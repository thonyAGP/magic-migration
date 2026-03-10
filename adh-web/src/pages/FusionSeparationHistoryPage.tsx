import { useCallback, useEffect, useState } from "react"
import { ScreenLayout } from "@/components/layout"
import { Button, Input } from "@/components/ui"
import { cn } from "@/lib/utils"
import { useFusionSeparationHistoryStore } from "@/stores/fusionSeparationHistoryStore"
import type { FusionSeparationHistoryEntry } from "@/types/fusionSeparationHistory"

const TYPE_EF_OPTIONS = ["FUSION", "SEPARATION"] as const

const validateNumber = (value: string, fieldName: string): string => {
  if (!value.trim()) return `${fieldName} is required`
  const num = parseInt(value)
  if (isNaN(num) || num <= 0) return `${fieldName} must be a positive number`
  return ""
}

const validateText = (value: string, fieldName: string): string => {
  if (!value.trim()) return `${fieldName} is required`
  return ""
}

export const FusionSeparationHistoryPage = () => {
  const {
    historyEntries,
    isLoading,
    error,
    currentEntry,
    writeHistoryEntry,
    formatFullName,
    setCurrentEntry,
    loadHistoryEntries,
    reset
  } = useFusionSeparationHistoryStore()

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

  useEffect(() => {
    loadHistoryEntries()
    return () => {
      reset()
    }
  }, [loadHistoryEntries, reset])

  const validateForm = useCallback((): string => {
    const chronoEFError = validateNumber(chronoEF, "Chrono EF")
    if (chronoEFError) return chronoEFError

    const societeError = validateText(societe, "Société")
    if (societeError) return societeError

    const compteRefError = validateNumber(compteReference, "Compte Reference")
    if (compteRefError) return compteRefError

    const filiationRefError = validateNumber(filiationReference, "Filiation Reference")
    if (filiationRefError) return filiationRefError

    const compteOldError = validateNumber(comptePointeOld, "Compte Pointe Old")
    if (compteOldError) return compteOldError

    const filiationOldError = validateNumber(filiationPointeOld, "Filiation Pointe Old")
    if (filiationOldError) return filiationOldError

    const compteNewError = validateNumber(comptePointeNew, "Compte Pointe New")
    if (compteNewError) return compteNewError

    const filiationNewError = validateNumber(filiationPointeNew, "Filiation Pointe New")
    if (filiationNewError) return filiationNewError

    const nomError = validateText(nom, "Nom")
    if (nomError) return nomError

    const prenomError = validateText(prenom, "Prénom")
    if (prenomError) return prenomError

    return ""
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
    setValidationError("")
    setSubmitSuccess(false)
  }, [])

  const handleSubmit = useCallback(async () => {
    const validationMsg = validateForm()
    if (validationMsg) {
      setValidationError(validationMsg)
      return
    }

    setValidationError("")

    const entry: FusionSeparationHistoryEntry = {
      chronoEF: parseInt(chronoEF),
      societe: societe.trim(),
      compteReference: parseInt(compteReference),
      filiationReference: parseInt(filiationReference),
      comptePointeOld: parseInt(comptePointeOld),
      filiationPointeOld: parseInt(filiationPointeOld),
      comptePointeNew: parseInt(comptePointeNew),
      filiationPointeNew: parseInt(filiationPointeNew),
      typeEF: typeEF,
      nom: nom.trim(),
      prenom: prenom.trim()
    }

    try {
      await writeHistoryEntry(entry)
      setCurrentEntry(entry)
      setSubmitSuccess(true)
      clearForm()
    } catch {
      setValidationError("Failed to write history entry")
    }
  }, [chronoEF, societe, compteReference, filiationReference, comptePointeOld, filiationPointeOld, comptePointeNew, filiationPointeNew, typeEF, nom, prenom, validateForm, writeHistoryEntry, setCurrentEntry, clearForm])

  const createFieldChangeHandler = useCallback((setter: (value: string) => void) => (value: string) => {
    setter(value)
    setValidationError("")
  }, [])

  const handleChronoEFChange = useCallback(createFieldChangeHandler(setChronoEF), [createFieldChangeHandler])
  const handleSocieteChange = useCallback(createFieldChangeHandler(setSociete), [createFieldChangeHandler])
  const handleCompteReferenceChange = useCallback(createFieldChangeHandler(setCompteReference), [createFieldChangeHandler])
  const handleFiliationReferenceChange = useCallback(createFieldChangeHandler(setFiliationReference), [createFieldChangeHandler])
  const handleComptePointeOldChange = useCallback(createFieldChangeHandler(setComptePointeOld), [createFieldChangeHandler])
  const handleFiliationPointeOldChange = useCallback(createFieldChangeHandler(setFiliationPointeOld), [createFieldChangeHandler])
  const handleComptePointeNewChange = useCallback(createFieldChangeHandler(setComptePointeNew), [createFieldChangeHandler])
  const handleFiliationPointeNewChange = useCallback(createFieldChangeHandler(setFiliationPointeNew), [createFieldChangeHandler])
  const handleTypeEFChange = useCallback(createFieldChangeHandler(setTypeEF), [createFieldChangeHandler])
  const handleNomChange = useCallback(createFieldChangeHandler(setNom), [createFieldChangeHandler])
  const handlePrenomChange = useCallback(createFieldChangeHandler(setPrenom), [createFieldChangeHandler])

  if (isLoading) {
    return (
      <ScreenLayout className="flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading fusion separation history...</div>
      </ScreenLayout>
    )
  }

  return (
    <ScreenLayout className="space-y-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Fusion Separation History
            </h1>
            <p className="text-gray-600">
              Write fusion and separation history entries for account operations audit trail
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="text-red-800 text-sm font-medium">{error}</div>
            </div>
          )}

          {validationError && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="text-yellow-800 text-sm font-medium">{validationError}</div>
            </div>
          )}

          {submitSuccess && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="text-green-800 text-sm font-medium">
                History entry written successfully
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label htmlFor="chronoEF" className="block text-sm font-medium text-gray-700 mb-1">
                  Chrono EF *
                </label>
                <Input
                  id="chronoEF"
                  type="number"
                  value={chronoEF}
                  onChange={(e) => handleChronoEFChange(e.target.value)}
                  placeholder="Enter chrono EF"
                  className="w-full"
                  min="1"
                />
              </div>

              <div>
                <label htmlFor="societe" className="block text-sm font-medium text-gray-700 mb-1">
                  Société *
                </label>
                <Input
                  id="societe"
                  type="text"
                  value={societe}
                  onChange={(e) => handleSocieteChange(e.target.value)}
                  placeholder="Enter société"
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="compteReference" className="block text-sm font-medium text-gray-700 mb-1">
                  Compte Reference *
                </label>
                <Input
                  id="compteReference"
                  type="number"
                  value={compteReference}
                  onChange={(e) => handleCompteReferenceChange(e.target.value)}
                  placeholder="Enter compte reference"
                  className="w-full"
                  min="1"
                />
              </div>

              <div>
                <label htmlFor="filiationReference" className="block text-sm font-medium text-gray-700 mb-1">
                  Filiation Reference *
                </label>
                <Input
                  id="filiationReference"
                  type="number"
                  value={filiationReference}
                  onChange={(e) => handleFiliationReferenceChange(e.target.value)}
                  placeholder="Enter filiation reference"
                  className="w-full"
                  min="1"
                />
              </div>

              <div>
                <label htmlFor="comptePointeOld" className="block text-sm font-medium text-gray-700 mb-1">
                  Compte Pointe Old *
                </label>
                <Input
                  id="comptePointeOld"
                  type="number"
                  value={comptePointeOld}
                  onChange={(e) => handleComptePointeOldChange(e.target.value)}
                  placeholder="Enter old compte pointe"
                  className="w-full"
                  min="1"
                />
              </div>

              <div>
                <label htmlFor="filiationPointeOld" className="block text-sm font-medium text-gray-700 mb-1">
                  Filiation Pointe Old *
                </label>
                <Input
                  id="filiationPointeOld"
                  type="number"
                  value={filiationPointeOld}
                  onChange={(e) => handleFiliationPointeOldChange(e.target.value)}
                  placeholder="Enter old filiation pointe"
                  className="w-full"
                  min="1"
                />
              </div>

              <div>
                <label htmlFor="comptePointeNew" className="block text-sm font-medium text-gray-700 mb-1">
                  Compte Pointe New *
                </label>
                <Input
                  id="comptePointeNew"
                  type="number"
                  value={comptePointeNew}
                  onChange={(e) => handleComptePointeNewChange(e.target.value)}
                  placeholder="Enter new compte pointe"
                  className="w-full"
                  min="1"
                />
              </div>

              <div>
                <label htmlFor="filiationPointeNew" className="block text-sm font-medium text-gray-700 mb-1">
                  Filiation Pointe New *
                </label>
                <Input
                  id="filiationPointeNew"
                  type="number"
                  value={filiationPointeNew}
                  onChange={(e) => handleFiliationPointeNewChange(e.target.value)}
                  placeholder="Enter new filiation pointe"
                  className="w-full"
                  min="1"
                />
              </div>

              <div>
                <label htmlFor="typeEF" className="block text-sm font-medium text-gray-700 mb-1">
                  Type EF *
                </label>
                <select
                  id="typeEF"
                  value={typeEF}
                  onChange={(e) => handleTypeEFChange(e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                    "bg-white text-sm"
                  )}
                >
                  {TYPE_EF_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom *
                </label>
                <Input
                  id="nom"
                  type="text"
                  value={nom}
                  onChange={(e) => handleNomChange(e.target.value)}
                  placeholder="Enter nom"
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom *
                </label>
                <Input
                  id="prenom"
                  type="text"
                  value={prenom}
                  onChange={(e) => handlePrenomChange(e.target.value)}
                  placeholder="Enter prénom"
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
              >
                {isLoading ? "Writing..." : "Write History Entry"}
              </Button>
              <Button
                onClick={clearForm}
                variant="outline"
                className="px-6 py-2"
              >
                Clear Form
              </Button>
            </div>
          </div>

          {currentEntry && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Current Entry</h3>
              <div className="bg-gray-50 rounded-md p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><span className="font-medium">Chrono EF:</span> {currentEntry.chronoEF}</div>
                  <div><span className="font-medium">Société:</span> {currentEntry.societe}</div>
                  <div><span className="font-medium">Type:</span> {currentEntry.typeEF}</div>
                  <div><span className="font-medium">Full Name:</span> {formatFullName(currentEntry.nom, currentEntry.prenom)}</div>
                  <div><span className="font-medium">Compte Ref:</span> {currentEntry.compteReference} / {currentEntry.filiationReference}</div>
                  <div><span className="font-medium">Old → New:</span> {currentEntry.comptePointeOld}/{currentEntry.filiationPointeOld} → {currentEntry.comptePointeNew}/{currentEntry.filiationPointeNew}</div>
                </div>
              </div>
            </div>
          )}

          {historyEntries.length === 0 && !isLoading && (
            <div className="mt-8 pt-6 border-t border-gray-200 text-center text-gray-500">
              No history entries found
            </div>
          )}

          {historyEntries.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Recent History Entries ({historyEntries.length})
              </h3>
              <div className="space-y-2">
                {historyEntries.slice(-5).reverse().map((entry, index) => (
                  <div
                    key={`${entry.chronoEF}-${index}`}
                    className="bg-gray-50 rounded-md p-3 text-sm"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-medium">{entry.typeEF}</span> - {entry.societe}
                      </div>
                      <span className="text-gray-500">#{entry.chronoEF}</span>
                    </div>
                    <div className="text-gray-600 mt-1">
                      {formatFullName(entry.nom, entry.prenom)} | 
                      Ref: {entry.compteReference}/{entry.filiationReference} | 
                      {entry.comptePointeOld}/{entry.filiationPointeOld} → {entry.comptePointeNew}/{entry.filiationPointeNew}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </ScreenLayout>
  )
}