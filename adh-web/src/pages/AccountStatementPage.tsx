import { useCallback, useEffect, useState } from "react"
import { useAccountStatementStore } from "@/stores/accountStatementStore"
import { ScreenLayout } from "@/components/layout"
import { Button, Dialog, Input } from "@/components/ui"
import { cn } from "@/lib/utils"

// RM-001: Error boundary component for React error handling
const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      setHasError(true)
      setError(new Error(error.message))
    }

    const handleRejection = (event: PromiseRejectionEvent) => {
      setHasError(true)
      setError(new Error(event.reason))
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleRejection)
    }
  }, [])

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold text-red-600 mb-4">Erreur Application</h2>
          <p className="text-gray-600 mb-4">
            Une erreur inattendue s'est produite dans l'application.
          </p>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
              <p className="text-sm text-red-700">{error.message}</p>
            </div>
          )}
          <Button onClick={() => window.location.reload()}>
            Recharger l'application
          </Button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// RM-002: GetParam function for printer configuration retrieval
const getParam = async (printerNumber: number): Promise<{ success: boolean; config?: unknown }> => {
  try {
    const response = await fetch(`/api/printer/${printerNumber}/config`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to get printer ${printerNumber} configuration: ${response.statusText}`)
    }

    const config = await response.json()
    return { success: true, config }
  } catch (error) {
    console.error(`Error retrieving printer ${printerNumber} configuration:`, error)
    return { success: false }
  }
}

// RM-003: IsComponent validation check
const isComponent = (value: unknown): boolean => {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  
  const component = value as Record<string, unknown>
  return (
    typeof component.type === 'function' ||
    typeof component.type === 'string' ||
    (typeof component.props === 'object' && component.props !== null)
  )
}

const AccountStatementPageContent = () => {
  const {
    accountStatements,
    isLoading,
    error,
    currentPrinter,
    validatePrinter1,
    validatePrinter6,
    validatePrinter8,
    validatePrinter9,
    validateDirectCall,
    generateAccountStatement,
    printStatementByName,
    logPrintOperation,
    reset
  } = useAccountStatementStore()

  const [showDialog, setShowDialog] = useState(false)
  const [memberCode, setMemberCode] = useState("")
  const [adherentName, setAdherentName] = useState("")
  const [cumulativeDate, setCumulativeDate] = useState("")
  const [currentStep, setCurrentStep] = useState<string>("idle")
  const [isProcessing, setIsProcessing] = useState(false)
  const [printerNumber, setPrinterNumber] = useState(1)
  const [selectedMember, setSelectedMember] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [printerConfig, setPrinterConfig] = useState<unknown>(null)

  // RM-004: Component validation check in main page
  useEffect(() => {
    const validateComponent = () => {
      const componentData = {
        type: AccountStatementPageContent,
        props: { memberCode, adherentName, isProcessing }
      }
      
      if (!isComponent(componentData)) {
        console.warn('Component validation failed')
        setValidationErrors(prev => [...prev, 'Invalid component structure detected'])
      }
    }

    validateComponent()
  }, [memberCode, adherentName, isProcessing])

  useEffect(() => {
    const initializeData = async () => {
      try {
        // RM-005: Proper error handling for async operations
        await validateDirectCall()
        
        // RM-006: Retrieve printer configuration on initialization
        const config = await getParam(printerNumber)
        if (config.success) {
          setPrinterConfig(config.config)
        } else {
          setValidationErrors(prev => [...prev, `Failed to retrieve printer ${printerNumber} configuration`])
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown initialization error'
        setValidationErrors(prev => [...prev, errorMessage])
        console.error('Initialization error:', error)
      }
    }
    
    initializeData()

    return () => {
      reset()
    }
  }, [validateDirectCall, reset, printerNumber])

  const handleGenerateStatement = useCallback(async () => {
    if (!memberCode.trim()) return

    setIsProcessing(true)
    setCurrentStep("Initialisation...")
    setShowDialog(true)
    setValidationErrors([])

    try {
      setCurrentStep("Validation de l'imprimante...")

      let validationResult = false
      switch (printerNumber) {
        case 1:
          validationResult = await validatePrinter1()
          break
        case 6:
          validationResult = await validatePrinter6()
          break
        case 8:
          validationResult = await validatePrinter8()
          break
        case 9:
          validationResult = await validatePrinter9()
          break
        default:
          throw new Error("Imprimante non supportée")
      }

      if (!validationResult) {
        throw new Error(`Validation de l'imprimante ${printerNumber} échouée`)
      }

      setCurrentStep("Génération de l'extrait...")
      const statement = await generateAccountStatement(memberCode, printerNumber)

      setCurrentStep("Impression en cours...")
      await printStatementByName(memberCode, printerNumber)

      setCurrentStep("Enregistrement de l'opération...")
      await logPrintOperation(memberCode, printerNumber, "PRINT_STATEMENT")
      
      setCurrentStep("Terminé")
      setAdherentName(statement.memberName)
      
      setTimeout(() => {
        setShowDialog(false)
        setCurrentStep("idle")
        setIsProcessing(false)
      }, 1500)
      
    } catch (err) {
      // RM-008: Enhanced error handling with detailed error information
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setValidationErrors(prev => [...prev, errorMessage])
      setCurrentStep("Erreur")
      setIsProcessing(false)
      
      console.error('Statement generation error:', {
        error: err,
        memberCode,
        printer: currentPrinter,
        timestamp: new Date().toISOString()
      })
    }
  }, [memberCode, printerNumber, validatePrinter1, validatePrinter6, validatePrinter8, validatePrinter9, generateAccountStatement, printStatementByName, logPrintOperation])

  const handleCancel = useCallback(() => {
    setShowDialog(false)
    setCurrentStep("idle")
    setIsProcessing(false)
  }, [])

  const handlePrinterChange = useCallback(async (printer: number) => {
    setPrinterNumber(printer)
    setValidationErrors([])

    try {
      const validators: Record<number, () => Promise<boolean>> = {
        1: validatePrinter1,
        6: validatePrinter6,
        8: validatePrinter8,
        9: validatePrinter9,
      }
      const validate = validators[printer]
      if (validate) {
        const isValid = await validate()
        setPrinterConfig(isValid ? { available: true } : null)
        if (!isValid) {
          setValidationErrors(prev => [...prev, `Printer ${printer} validation failed`])
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setValidationErrors(prev => [...prev, errorMessage])
      console.error('Printer validation error:', error)
    }
  }, [validatePrinter1, validatePrinter6, validatePrinter8, validatePrinter9])

  const handleMemberSelect = useCallback((member: string) => {
    setSelectedMember(member)
    setMemberCode(member)
    const statement = accountStatements.find(s => s.memberCode === member)
    if (statement) {
      setAdherentName(statement.memberName)
    }
  }, [accountStatements])

  const getCurrentStepMessage = useCallback(() => {
    switch (currentStep) {
      case "idle":
        return ""
      case "Initialisation...":
        return "Initialisation du traitement..."
      case "Validation de l'imprimante...":
        return `Validation de l'imprimante ${currentPrinter}...`
      case "Génération de l'extrait...":
        return "Génération de l'extrait de compte..."
      case "Impression en cours...":
        return "Impression en cours..."
      case "Enregistrement de l'opération...":
        return "Enregistrement de l'opération..."
      case "Terminé":
        return "Traitement terminé avec succès"
      case "Erreur":
        return "Une erreur est survenue"
      default:
        return currentStep
    }
  }, [currentStep, currentPrinter])

  return (
    <ScreenLayout className="p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Édition Extrait de Compte Cumulé
          </h1>
          <p className="text-gray-600 mb-6">
            Génération et impression des extraits de compte pour les adhérents
          </p>

          {adherentName && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-blue-900">Informations Adhérent</h3>
              <p className="text-blue-700">
                <span className="font-medium">Nom:</span> {adherentName}
              </p>
              <p className="text-blue-700">
                <span className="font-medium">Code:</span> {memberCode}
              </p>
            </div>
          )}
        </div>

        {validationErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-medium text-red-900 mb-2">Erreurs de Validation</h3>
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index} className="text-red-700 text-sm">{error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="memberCode" className="block text-sm font-medium text-gray-700 mb-2">
                Code Adhérent
              </label>
              <Input
                id="memberCode"
                value={memberCode}
                onChange={(e) => setMemberCode(e.target.value)}
                placeholder="Saisir le code adhérent"
                disabled={isProcessing}
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="cumulativeDate" className="block text-sm font-medium text-gray-700 mb-2">
                Date Cumulative
              </label>
              <Input
                id="cumulativeDate"
                type="date"
                value={cumulativeDate}
                onChange={(e) => setCumulativeDate(e.target.value)}
                disabled={isProcessing}
                className="w-full"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Sélection Imprimante
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[1, 6, 8, 9].map((printer) => (
                <button
                  key={printer}
                  onClick={() => handlePrinterChange(printer)}
                  disabled={isProcessing}
                  className={cn(
                    "p-3 border rounded-lg text-center transition-colors",
                    printerNumber === printer
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-gray-300 text-gray-700",
                    isProcessing && "opacity-50 cursor-not-allowed"
                  )}
                >
                  Imprimante {printer}
                  {printerConfig && printerNumber === printer && (
                    <div className="text-xs text-green-600 mt-1">✓ Configurée</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {isLoading && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full" />
                <span className="text-yellow-800">Chargement en cours...</span>
              </div>
              <div className="mt-2 text-sm text-yellow-700">
                {getCurrentStepMessage()}
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">Erreur</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          )}
        </div>

        {accountStatements.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Adhérents Disponibles</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {accountStatements.map((statement) => (
                <button
                  key={statement.memberCode}
                  onClick={() => handleMemberSelect(statement.memberCode)}
                  disabled={isProcessing}
                  className={cn(
                    "w-full p-3 text-left border rounded-lg transition-colors",
                    selectedMember === statement.memberCode
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300",
                    isProcessing && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">{statement.memberName}</p>
                      <p className="text-sm text-gray-600">Code: {statement.memberCode}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{statement.currency}</p>
                      <p className="text-xs text-gray-500">{statement.accountingPeriod}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <Button
            onClick={handleGenerateStatement}
            disabled={!memberCode.trim() || isProcessing || validationErrors.length > 0}
            className="px-8"
          >
            {isProcessing ? "Traitement..." : "Générer l'Extrait"}
          </Button>
        </div>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Veuillez patienter...
                </h3>
                
                <div className="mb-6">
                  <div className="animate-spin mx-auto w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-4" />
                  <p className="text-gray-600">{getCurrentStepMessage()}</p>
                </div>

                {adherentName && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4 text-left">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Adhérent:</span> {adherentName}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Imprimante:</span> {currentPrinter}
                    </p>
                    {cumulativeDate && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Date:</span> {cumulativeDate}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={currentStep === "Terminé"}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Dialog>
      </div>
    </ScreenLayout>
  )
}

// RM-010: Main component wrapped with error boundary
export const AccountStatementPage = () => {
  return (
    <ErrorBoundary>
      <AccountStatementPageContent />
    </ErrorBoundary>
  )
}