import { useState, useCallback } from "react"
import { Button, Dialog, Input } from "@/components/ui"
import { cn } from "@/lib/utils"
import { useHistoryCleanupStore } from "@/stores/historyCleanupStore"
import type { HistoFusionSeparationCriteria } from "@/types/historyCleanup"

interface DeletionServicePanelProps {
  className?: string
}

type ValidationStatus = "idle" | "validating" | "valid" | "invalid"

const parseNumericValue = (value: string): number | undefined => {
  if (!value.trim()) return undefined
  const parsed = parseInt(value.trim())
  return isNaN(parsed) ? undefined : parsed
}

const getStatusColor = (status: ValidationStatus): string => {
  switch (status) {
    case "validating":
      return "text-blue-600"
    case "valid":
      return "text-green-600"
    case "invalid":
      return "text-red-600"
    default:
      return "text-gray-500"
  }
}

const getStatusText = (status: ValidationStatus): string => {
  switch (status) {
    case "validating":
      return "Validation en cours..."
    case "valid":
      return "Critères validés"
    case "invalid":
      return "Critères invalides ou aucune donnée trouvée"
    default:
      return "Saisissez vos critères de suppression"
  }
}

const getStatusIndicatorColor = (status: ValidationStatus): string => {
  switch (status) {
    case "validating":
      return "bg-blue-500"
    case "valid":
      return "bg-green-500"
    case "invalid":
      return "bg-red-500"
    default:
      return "bg-gray-300"
  }
}

export const DeletionServicePanel = ({ className }: DeletionServicePanelProps) => {
  const {
    isLoading,
    error,
    deletionResult,
    deleteHistoFusionSeparationSaisie,
    validateDeletionCriteria
  } = useHistoryCleanupStore()

  const [chronoEF, setChronoEF] = useState("")
  const [societe, setSociete] = useState("")
  const [compteReference, setCompteReference] = useState("")
  const [filiationReference, setFiliationReference] = useState("")
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>("idle")

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
    
    if (Object.keys(criteria).length === 0) {
      setValidationStatus("invalid")
      return
    }

    setValidationStatus("validating")
    
    try {
      const isValid = await validateDeletionCriteria(criteria)
      setValidationStatus(isValid ? "valid" : "invalid")
    } catch {
      setValidationStatus("invalid")
    }
  }, [buildCriteria, validateDeletionCriteria])

  const resetForm = useCallback(() => {
    setChronoEF("")
    setSociete("")
    setCompteReference("")
    setFiliationReference("")
    setValidationStatus("idle")
  }, [])

  const handleDeleteClick = useCallback(() => {
    if (validationStatus === "valid") {
      setShowConfirmDialog(true)
    } else {
      handleValidateCriteria()
    }
  }, [validationStatus, handleValidateCriteria])

  const handleConfirmDelete = useCallback(async () => {
    const criteria = buildCriteria()
    
    try {
      await deleteHistoFusionSeparationSaisie(criteria)
      setShowConfirmDialog(false)
      resetForm()
    } catch {
      setShowConfirmDialog(false)
    }
  }, [buildCriteria, deleteHistoFusionSeparationSaisie, resetForm])

  const handleInputChange = useCallback((setter: (value: string) => void) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value)
      setValidationStatus("idle")
    }, []
  )

  return (
    <>
      <div className={cn("bg-white rounded-lg shadow-sm border p-6 space-y-6", className)}>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Critères de suppression</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chrono EF
              </label>
              <Input
                type="number"
                value={chronoEF}
                onChange={handleInputChange(setChronoEF)}
                placeholder="Numéro chronologique"
                disabled={isLoading}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Société
              </label>
              <Input
                type="text"
                value={societe}
                onChange={handleInputChange(setSociete)}
                placeholder="Code société"
                disabled={isLoading}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Compte référence
              </label>
              <Input
                type="number"
                value={compteReference}
                onChange={handleInputChange(setCompteReference)}
                placeholder="Numéro de compte"
                disabled={isLoading}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filiation référence
              </label>
              <Input
                type="number"
                value={filiationReference}
                onChange={handleInputChange(setFiliationReference)}
                placeholder="Numéro de filiation"
                disabled={isLoading}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={cn("w-3 h-3 rounded-full", getStatusIndicatorColor(validationStatus))} />
            <span className={cn("text-sm font-medium", getStatusColor(validationStatus))}>
              {getStatusText(validationStatus)}
            </span>
          </div>

          <div className="space-x-3">
            <Button
              variant="outline"
              onClick={handleValidateCriteria}
              disabled={isLoading || validationStatus === "validating"}
              className="px-4 py-2"
            >
              {validationStatus === "validating" ? "Validation..." : "Valider"}
            </Button>
            
            <Button
              variant="destructive"
              onClick={handleDeleteClick}
              disabled={isLoading || validationStatus === "validating"}
              className="px-4 py-2"
            >
              {isLoading ? "Suppression..." : "Supprimer"}
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {deletionResult && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <h4 className="text-sm font-semibold text-green-800 mb-2">Résultat de la suppression</h4>
            <div className="space-y-1 text-sm text-green-700">
              <p><span className="font-medium">Enregistrements supprimés:</span> {deletionResult.recordsDeleted}</p>
              <p><span className="font-medium">Statut:</span> {deletionResult.success ? "Succès" : "Échec"}</p>
              <p><span className="font-medium">Horodatage:</span> {new Date(deletionResult.timestamp).toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>

      <Dialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        className="max-w-md"
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Confirmer la suppression
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Êtes-vous sûr de vouloir supprimer les données correspondant à ces critères ? 
            Cette action est irréversible.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isLoading}
            >
              {isLoading ? "Suppression..." : "Confirmer"}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  )
}