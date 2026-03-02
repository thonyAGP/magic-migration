import type { FC } from 'react'
import { cn } from '@/lib/utils'
import { useAccountMergeStore } from '@/stores/accountMergeStore'

interface ProgressPanelProps {
  className?: string
}

export const ProgressPanel: FC<ProgressPanelProps> = ({ className }) => {
  const { currentStep, isProcessing, progressData, mergeLogs } = useAccountMergeStore()

  const getStepDisplayText = (step: string): string => {
    switch (step) {
      case 'validation':
        return 'Validation des comptes'
      case 'preparation':
        return 'Préparation du transfert'
      case 'execution':
        return 'Exécution du transfert'
      case 'completion':
        return 'Finalisation'
      default:
        return 'En attente'
    }
  }

  const getStepNumber = (step: string): number => {
    switch (step) {
      case 'validation':
        return 1
      case 'preparation':
        return 2
      case 'execution':
        return 3
      case 'completion':
        return 4
      default:
        return 0
    }
  }

  const currentStepNumber = getStepNumber(currentStep)
  const progressPercentage = currentStepNumber > 0 ? (currentStepNumber / 4) * 100 : 0
  const tableProgressPercentage = progressData.total > 0 ? (progressData.current / progressData.total) * 100 : 0

  const getStatusMessages = () => {
    const recentLogs = mergeLogs
      .slice(-10)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return recentLogs.map(log => ({
      id: log.id,
      timestamp: log.timestamp,
      message: `${log.operation} - Table: ${log.tableName} (${log.recordCount} enregistrements)`,
      success: log.success
    }))
  }

  const statusMessages = getStatusMessages()

  return (
    <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200 p-6', className)}>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Progression</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Étape {currentStepNumber}/4: {getStepDisplayText(currentStep)}
              </span>
              {isProcessing && (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-blue-600">En cours...</span>
                </div>
              )}
            </div>

            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {progressData.table && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Table en cours de traitement
            </h4>
            
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-900">
                  {progressData.table}
                </span>
                <span className="text-gray-600">
                  {progressData.current}/{progressData.total}
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300 ease-in-out"
                  style={{ width: `${tableProgressPercentage}%` }}
                />
              </div>
            </div>
          </div>
        )}

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Nombre d'enregistrements traités
          </h4>
          
          <div className="text-2xl font-bold text-gray-900">
            {progressData.current.toLocaleString()}
            {progressData.total > 0 && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                / {progressData.total.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Journal des opérations
          </h4>
          
          <div className="bg-gray-50 rounded-lg border max-h-64 overflow-y-auto">
            {statusMessages.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                Aucune opération en cours
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {statusMessages.map(msg => (
                  <div key={msg.id} className="p-3 flex items-start space-x-3">
                    <div className={cn(
                      'w-2 h-2 rounded-full mt-2 flex-shrink-0',
                      msg.success ? 'bg-green-500' : 'bg-red-500'
                    )} />
                    
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-900">
                        {msg.message}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(msg.timestamp).toLocaleString('fr-FR')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}