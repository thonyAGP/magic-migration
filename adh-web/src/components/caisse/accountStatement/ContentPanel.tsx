import { useState, useCallback } from 'react'
import { apiClient } from "@/services/api/apiClient"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui"
import type { AccountStatement } from "@/types/accountStatement"

interface ContentPanelProps {
  cumulativeDate: string
  memberCode: string
  onProcessingStep: (step: string) => void
}

export const ContentPanel: React.FC<ContentPanelProps> = ({
  cumulativeDate,
  memberCode,
  onProcessingStep
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [statementData, setStatementData] = useState<AccountStatement | null>(null)

  const fetchAccountStatement = useCallback(async () => {
    setIsLoading(true)
    onProcessingStep("Chargement des données...")

    try {
      const response = await apiClient.get<AccountStatement>('/account-statement', {
        params: { 
          memberCode, 
          date: cumulativeDate 
        }
      })

      if (response.data) {
        setStatementData(response.data)
        onProcessingStep("Données chargées avec succès")
      }
    } catch {
      onProcessingStep("Erreur de chargement")
    } finally {
      setIsLoading(false)
    }
  }, [memberCode, cumulativeDate, onProcessingStep])

  return (
    <div className="w-full p-4 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Relevé de Compte
        </h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            Date: {cumulativeDate}
          </span>
          <Button 
            onClick={fetchAccountStatement}
            disabled={isLoading}
            className={cn(
              "px-4 py-2 text-sm font-medium text-white rounded-md",
              isLoading 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-700"
            )}
          >
            {isLoading ? "Chargement..." : "Charger"}
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      )}

      {!isLoading && !statementData && (
        <div className="text-center text-gray-500 h-40 flex items-center justify-center">
          Aucune donnée disponible
        </div>
      )}

      {statementData && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Code Membre</p>
            <p className="font-semibold">{statementData.memberCode}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Nom du Membre</p>
            <p className="font-semibold">{statementData.memberName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Période Comptable</p>
            <p className="font-semibold">{statementData.accountingPeriod}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Devise</p>
            <p className="font-semibold">{statementData.currency}</p>
          </div>
        </div>
      )}
    </div>
  )
}