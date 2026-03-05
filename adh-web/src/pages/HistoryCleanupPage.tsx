import { useCallback, useEffect, useState } from "react"
import { ScreenLayout } from "@/components/layout"
import { Button, Dialog, Input } from "@/components/ui"
import { cn } from "@/lib/utils"
import { useHistoryCleanupStore } from "@/stores/historyCleanupStore"
import type { HistoFusionSeparationCriteria } from "@/types/historyCleanup"

type ValidationStatus = "idle" | "valid" | "invalid"

export const HistoryCleanupPage = () => {
  const {
    isLoading,
    error,
    deletionCriteria,
    deletionResult,
    deleteHistoFusionSeparationSaisie,
    validateDeletionCriteria,
    reset
  } = useHistoryCleanupStore()

  const [chronoEF, setChronoEF] = useState("")
  const [societe, setSociete] = useState("")
  const [compteReference, setCompteReference] = useState("")
  const [filiationReference, setFiliationReference] = useState("")
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>("idle")

  useEffect(() => {
    return () => {
      reset()
    }
  }, [reset])

  const parseNumericValue = (value: string): number | undefined => {
    if (!value.trim()) return undefined
    const parsed = parseInt(value.trim())
    return isNaN(parsed) ? undefined : parsed
  }

  const buildCriteria = useCallback((): HistoFusionSeparationCriteria => {
    const criteria: HistoFusionSeparationCriteria = {}
    
    const chronoEFParsed = parseNumericValue(chronoEF)
    if (chronoEFParsed !== undefined) {
      criteria.chronoEF = chronoEFParsed
    }
    
    if (societe.trim()) {
      criteria.societe = societe.trim()
    }
    
    const compteReferenceParsed = parseNumericValue(compteReference)
    if (compteReferenceParsed !== undefined) {
      criteria.compteReference = compteReferenceParsed
    }
    
    const filiationReferenceParsed = parseNumericValue(filiationReference)
    if (filiationReferenceParsed !== undefined) {
      criteria.filiationReference = filiationReferenceParsed
    }
    
    return criteria
  }, [chronoEF, societe, compteReference, filiationReference])

  const handleValidateCriteria = useCallback(async () => {
    const criteria = buildCriteria()
    
    try {
      const isValid = await validateDeletionCriteria(criteria)
      setValidationStatus(isValid ? "valid" : "invalid")
    } catch {
      setValidationStatus("invalid")
    }
  }, [buildCriteria, validateDeletionCriteria])

  const handleDeleteClick = useCallback(() => {
    if (validationStatus === "valid") {
      setShowConfirmDialog(true)
    }
  }, [validationStatus])

  const handleConfirmDelete = useCallback(async () => {
    setShowConfirmDialog(false)
    const criteria = buildCriteria()
    
    try {
      await deleteHistoFusionSeparationSaisie(criteria)
    } catch {
      // Error is handled in store
    }
  }, [buildCriteria, deleteHistoFusionSeparationSaisie])

  const handleClearForm = useCallback(() => {
    setChronoEF("")
    setSociete("")
    setCompteReference("")
    setFiliationReference("")
    setValidationStatus("idle")
  }, [])

  const hasCriteria = chronoEF || societe || compteReference || filiationReference
  const canDelete = validationStatus === "valid" && !isLoading

  const getStatusColor = (status: ValidationStatus): string => {
    switch (status) {
      case "valid":
        return "bg-green-500"
      case "invalid":
        return "bg-red-500"
      default:
        return "bg-gray-300"
    }
  }

  const getStatusText = (status: ValidationStatus): string => {
    switch (status) {
      case "valid":
        return "Criteria Valid"
      case "invalid":
        return "Invalid Criteria"
      default:
        return "Not Validated"
    }
  }

  return (
    <ScreenLayout className="p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            History Cleanup Service
          </h1>

          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Deletion Criteria
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chrono EF
                  </label>
                  <Input
                    type="number"
                    value={chronoEF}
                    onChange={(e) => setChronoEF(e.target.value)}
                    placeholder="Enter chrono EF"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Societe
                  </label>
                  <Input
                    type="text"
                    value={societe}
                    onChange={(e) => setSociete(e.target.value)}
                    placeholder="Enter societe code"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Compte Reference
                  </label>
                  <Input
                    type="number"
                    value={compteReference}
                    onChange={(e) => setCompteReference(e.target.value)}
                    placeholder="Enter compte reference"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filiation Reference
                  </label>
                  <Input
                    type="number"
                    value={filiationReference}
                    onChange={(e) => setFiliationReference(e.target.value)}
                    placeholder="Enter filiation reference"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={handleValidateCriteria}
                  disabled={!hasCriteria || isLoading}
                  variant="outline"
                  className="flex-1"
                >
                  {isLoading ? "Validating..." : "Validate Criteria"}
                </Button>
                
                <Button
                  onClick={handleClearForm}
                  variant="outline"
                  className="px-6"
                >
                  Clear
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-3 h-3 rounded-full",
                  getStatusColor(validationStatus)
                )} />
                <span className="text-sm font-medium">
                  Status: {getStatusText(validationStatus)}
                </span>
              </div>

              <Button
                onClick={handleDeleteClick}
                disabled={!canDelete}
                variant={canDelete ? "default" : "outline"}
                className={cn(
                  canDelete && "bg-red-600 hover:bg-red-700 text-white"
                )}
              >
                {isLoading ? "Processing..." : "Delete Records"}
              </Button>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span className="text-sm font-medium text-red-800">Error</span>
                </div>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            )}

            {deletionResult && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 mb-3">
                  Deletion Complete
                </h3>
                <div className="space-y-2 text-sm text-green-700">
                  <div className="flex justify-between">
                    <span>Records Deleted:</span>
                    <span className="font-medium">{deletionResult.recordsDeleted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Success:</span>
                    <span className="font-medium">
                      {deletionResult.success ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Timestamp:</span>
                    <span className="font-medium">
                      {new Date(deletionResult.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {deletionCriteria && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-sm font-semibold text-blue-800 mb-2">
                  Applied Criteria
                </h3>
                <div className="text-xs text-blue-700 space-y-1">
                  {deletionCriteria.chronoEF && (
                    <div>Chrono EF: {deletionCriteria.chronoEF}</div>
                  )}
                  {deletionCriteria.societe && (
                    <div>Societe: {deletionCriteria.societe}</div>
                  )}
                  {deletionCriteria.compteReference && (
                    <div>Compte Reference: {deletionCriteria.compteReference}</div>
                  )}
                  {deletionCriteria.filiationReference && (
                    <div>Filiation Reference: {deletionCriteria.filiationReference}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete the history records matching the specified criteria? 
            This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Dialog>
    </ScreenLayout>
  )
}