import { useCallback, useState } from "react"
import { Button, Input } from "@/components/ui"
import { cn } from "@/lib/utils"
import { useFusionSeparationHistoryStore } from "@/stores/fusionSeparationHistoryStore"
import type { FusionSeparationHistoryEntry } from "@/types/fusionSeparationHistory"

const TYPE_EF_OPTIONS = ["FUSION", "SEPARATION"] as const

interface HistoryFormPanelProps {
  className?: string
}

const validateNumericField = (value: string, fieldName: string): string | null => {
  if (!value.trim()) return `${fieldName} is required`
  const num = parseInt(value, 10)
  if (isNaN(num)) return `${fieldName} must be a valid number`
  return null
}

const validateTextField = (value: string, fieldName: string): string | null => {
  if (!value.trim()) return `${fieldName} is required`
  return null
}

export const HistoryFormPanel = ({ className }: HistoryFormPanelProps) => {
  const { writeHistoryEntry, isLoading } = useFusionSeparationHistoryStore()
  
  const [chronoEF, setChronoEF] = useState("")
  const [societe, setSociete] = useState("")
  const [compteReference, setCompteReference] = useState("")
  const [filiationReference, setFiliationReference] = useState("")
  const [comptePointeOld, setComptePointeOld] = useState("")
  const [filiationPointeOld, setFiliationPointeOld] = useState("")
  const [comptePointeNew, setComptePointeNew] = useState("")
  const [filiationPointeNew, setFiliationPointeNew] = useState("")
  const [typeEF, setTypeEF] = useState<string>("FUSION")
  const [nom, setNom] = useState("")
  const [prenom, setPrenom] = useState("")
  
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [validationError, setValidationError] = useState("")

  const validateForm = useCallback((): string | null => {
    const validations = [
      validateNumericField(chronoEF, "Chrono EF"),
      validateTextField(societe, "Société"),
      validateNumericField(compteReference, "Compte Reference"),
      validateNumericField(filiationReference, "Filiation Reference"),
      validateNumericField(comptePointeOld, "Compte Pointe Old"),
      validateNumericField(filiationPointeOld, "Filiation Pointe Old"),
      validateNumericField(comptePointeNew, "Compte Pointe New"),
      validateNumericField(filiationPointeNew, "Filiation Pointe New"),
      validateTextField(nom, "Nom"),
      validateTextField(prenom, "Prénom")
    ]
    
    return validations.find(error => error !== null) || null
  }, [chronoEF, societe, compteReference, filiationReference, comptePointeOld, filiationPointeOld, comptePointeNew, filiationPointeNew, nom, prenom])

  const clearForm = useCallback(() => {
    setChronoEF("")
    setSociete("")
    setCompteReference("")
    setFiliationReference("")
    setComptePointeOld("")
    setFiliationPointeOld("")
    setComptePointeNew("")
    setFiliationPointeNew("")
    setTypeEF("FUSION")
    setNom("")
    setPrenom("")
    setSubmitSuccess(false)
    setValidationError("")
  }, [])

  const handleSubmit = useCallback(async () => {
    const validationErrorMsg = validateForm()
    if (validationErrorMsg) {
      setValidationError(validationErrorMsg)
      return
    }

    setValidationError("")

    const entry: FusionSeparationHistoryEntry = {
      chronoEF: parseInt(chronoEF, 10),
      societe,
      compteReference: parseInt(compteReference, 10),
      filiationReference: parseInt(filiationReference, 10),
      comptePointeOld: parseInt(comptePointeOld, 10),
      filiationPointeOld: parseInt(filiationPointeOld, 10),
      comptePointeNew: parseInt(comptePointeNew, 10),
      filiationPointeNew: parseInt(filiationPointeNew, 10),
      typeEF,
      nom,
      prenom
    }

    try {
      await writeHistoryEntry(entry)
      setSubmitSuccess(true)
      clearForm()
      setTimeout(() => setSubmitSuccess(false), 3000)
    } catch {
      setValidationError("Failed to save entry")
    }
  }, [validateForm, chronoEF, societe, compteReference, filiationReference, comptePointeOld, filiationPointeOld, comptePointeNew, filiationPointeNew, typeEF, nom, prenom, writeHistoryEntry, clearForm])

  return (
    <div className={cn("bg-white rounded-lg shadow p-6 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">New History Entry</h3>
        {submitSuccess && (
          <span className="text-sm text-green-600 font-medium">Entry saved successfully!</span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Chrono EF"
          type="number"
          value={chronoEF}
          onChange={(e) => setChronoEF(e.target.value)}
          placeholder="Enter chrono EF"
          required
        />

        <Input
          label="Société"
          value={societe}
          onChange={(e) => setSociete(e.target.value)}
          placeholder="Enter société"
          required
        />

        <Input
          label="Compte Reference"
          type="number"
          value={compteReference}
          onChange={(e) => setCompteReference(e.target.value)}
          placeholder="Enter compte reference"
          required
        />

        <Input
          label="Filiation Reference"
          type="number"
          value={filiationReference}
          onChange={(e) => setFiliationReference(e.target.value)}
          placeholder="Enter filiation reference"
          required
        />

        <Input
          label="Compte Pointe Old"
          type="number"
          value={comptePointeOld}
          onChange={(e) => setComptePointeOld(e.target.value)}
          placeholder="Enter compte pointe old"
          required
        />

        <Input
          label="Filiation Pointe Old"
          type="number"
          value={filiationPointeOld}
          onChange={(e) => setFiliationPointeOld(e.target.value)}
          placeholder="Enter filiation pointe old"
          required
        />

        <Input
          label="Compte Pointe New"
          type="number"
          value={comptePointeNew}
          onChange={(e) => setComptePointeNew(e.target.value)}
          placeholder="Enter compte pointe new"
          required
        />

        <Input
          label="Filiation Pointe New"
          type="number"
          value={filiationPointeNew}
          onChange={(e) => setFiliationPointeNew(e.target.value)}
          placeholder="Enter filiation pointe new"
          required
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Type EF <span className="text-red-500">*</span>
          </label>
          <select
            value={typeEF}
            onChange={(e) => setTypeEF(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            {TYPE_EF_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Nom"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          placeholder="Enter nom"
          required
        />

        <Input
          label="Prénom"
          value={prenom}
          onChange={(e) => setPrenom(e.target.value)}
          placeholder="Enter prénom"
          required
        />
      </div>

      {validationError && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
          {validationError}
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isLoading ? "Saving..." : "Submit Entry"}
        </Button>
        
        <Button
          onClick={clearForm}
          variant="outline"
          disabled={isLoading}
        >
          Clear Form
        </Button>
      </div>
    </div>
  )
}