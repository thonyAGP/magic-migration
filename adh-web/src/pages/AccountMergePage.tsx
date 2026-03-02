import { useState, useCallback, useEffect } from 'react'
import { ScreenLayout } from '@/components/layout'
import { Button, Dialog, Input } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useAccountMergeStore } from '@/stores/accountMergeStore'

const AccountMergePage = () => {
  const [sourceAccountId, setSourceAccountId] = useState('')
  const [targetAccountId, setTargetAccountId] = useState('')
  const [showLogsDialog, setShowLogsDialog] = useState(false)
  const [selectedMergeId, setSelectedMergeId] = useState<number | null>(null)
  const [historyFilters, setHistoryFilters] = useState({
    startDate: '',
    endDate: '',
    accountId: ''
  })

  const {
    mergeRequest,
    sourceAccount,
    targetAccount,
    mergeHistory,
    mergeLogs,
    validationStatus,
    currentStep,
    isProcessing,
    error,
    progressData,
    validatePrerequisites,
    loadAccounts,
    executeMerge,
    saveMergeHistory,
    writeMergeLogs,
    cleanupTemporaryData,
    printMergeTicket,
    cancelMerge,
    getMergeHistory,
    getMergeLogs,
    setCurrentStep,
    updateProgress,
    setError,
    reset
  } = useAccountMergeStore()

  useEffect(() => {
    getMergeHistory()
    
    return () => {
      reset()
    }
  }, [getMergeHistory, reset])

  const handleValidateAccounts = useCallback(async () => {
    if (!sourceAccountId || !targetAccountId) {
      setError('Veuillez saisir les numéros de compte source et cible')
      return
    }

    try {
      setError(null)
      await validatePrerequisites()
      await loadAccounts(parseInt(sourceAccountId), parseInt(targetAccountId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la validation')
    }
  }, [sourceAccountId, targetAccountId, validatePrerequisites, loadAccounts, setError])

  const handleExecuteMerge = useCallback(async () => {
    try {
      setError(null)
      await executeMerge()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'exécution de la fusion')
    }
  }, [executeMerge, setError])

  const handleCancelMerge = useCallback(async () => {
    try {
      await cancelMerge()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'annulation')
    }
  }, [cancelMerge, setError])

  const handlePrintTicket = useCallback(async () => {
    if (!mergeRequest) return
    
    try {
      await printMergeTicket(mergeRequest.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'impression')
    }
  }, [mergeRequest, printMergeTicket, setError])

  const handleViewLogs = useCallback(async (mergeId: number) => {
    try {
      setSelectedMergeId(mergeId)
      await getMergeLogs(mergeId)
      setShowLogsDialog(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des logs')
    }
  }, [getMergeLogs, setError])

  const handleHistoryFilter = useCallback(async () => {
    const filters: { startDate?: Date; endDate?: Date; accountId?: number } = {}
    
    if (historyFilters.startDate) filters.startDate = new Date(historyFilters.startDate)
    if (historyFilters.endDate) filters.endDate = new Date(historyFilters.endDate)
    if (historyFilters.accountId) filters.accountId = parseInt(historyFilters.accountId)

    try {
      await getMergeHistory(filters)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du filtrage')
    }
  }, [historyFilters, getMergeHistory, setError])

  const getStepIndex = useCallback((step: string) => {
    const steps = ['validation', 'preparation', 'execution', 'completion']
    return steps.indexOf(step)
  }, [])

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }, [])

  const formatDate = useCallback((date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }, [])

  return (
    <ScreenLayout className="p-6 space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Sélection des comptes</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Compte source</label>
                <Input
                  value={sourceAccountId}
                  onChange={(e) => setSourceAccountId(e.target.value)}
                  placeholder="Numéro de compte"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Compte cible</label>
                <Input
                  value={targetAccountId}
                  onChange={(e) => setTargetAccountId(e.target.value)}
                  placeholder="Numéro de compte"
                  className="w-full"
                />
              </div>
            </div>

            <Button 
              onClick={handleValidateAccounts}
              disabled={isProcessing || !sourceAccountId || !targetAccountId}
              className="w-full mb-4"
            >
              Valider les comptes
            </Button>

            {validationStatus && (
              <div className="space-y-2 p-3 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-3 h-3 rounded-full",
                    validationStatus.network ? "bg-green-500" : "bg-red-500"
                  )} />
                  <span className="text-sm">Réseau: {validationStatus.network ? 'OK' : 'Erreur'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-3 h-3 rounded-full",
                    !validationStatus.closure ? "bg-green-500" : "bg-red-500"
                  )} />
                  <span className="text-sm">Clôture: {!validationStatus.closure ? 'OK' : 'En cours'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-3 h-3 rounded-full",
                    validationStatus.validation === 'V' ? "bg-green-500" : "bg-red-500"
                  )} />
                  <span className="text-sm">Validation: {validationStatus.validation}</span>
                </div>
              </div>
            )}

            {sourceAccount && targetAccount && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="p-3 border rounded">
                  <h4 className="font-medium text-sm mb-2">Compte source</h4>
                  <div className="text-xs space-y-1">
                    <div>N°: {sourceAccount.id}</div>
                    <div>Client: {sourceAccount.clientName}</div>
                    <div>Solde: {formatCurrency(sourceAccount.balance)}</div>
                    <div>Statut: {sourceAccount.status}</div>
                  </div>
                </div>
                <div className="p-3 border rounded">
                  <h4 className="font-medium text-sm mb-2">Compte cible</h4>
                  <div className="text-xs space-y-1">
                    <div>N°: {targetAccount.id}</div>
                    <div>Client: {targetAccount.clientName}</div>
                    <div>Solde: {formatCurrency(targetAccount.balance)}</div>
                    <div>Statut: {targetAccount.status}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Progression</h2>
            
            <div className="mb-4">
              <div className="text-sm font-medium mb-2">
                Étape actuelle: {currentStep}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((getStepIndex(currentStep) + 1) / 4) * 100}%` }}
                />
              </div>
            </div>

            {progressData.total > 0 && (
              <div className="space-y-2">
                <div className="text-sm">
                  Table en cours: <span className="font-medium">{progressData.table}</span>
                </div>
                <div className="text-sm">
                  Progression: {progressData.current} / {progressData.total}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(progressData.current / progressData.total) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {error}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Actions</h2>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleExecuteMerge}
                disabled={!sourceAccount || !targetAccount || isProcessing || currentStep === 'completion'}
                variant="default"
              >
                {isProcessing ? 'Traitement...' : 'Exécuter fusion'}
              </Button>
              
              <Button
                onClick={handleCancelMerge}
                disabled={!isProcessing}
                variant="outline"
              >
                Annuler
              </Button>
              
              <Button
                onClick={handlePrintTicket}
                disabled={!mergeRequest || currentStep !== 'completion'}
                variant="outline"
              >
                Imprimer ticket
              </Button>
              
              <Button
                onClick={() => getMergeHistory()}
                variant="outline"
              >
                Actualiser historique
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Historique des fusions</h2>
            
            <div className="grid grid-cols-3 gap-2 mb-4">
              <Input
                type="date"
                value={historyFilters.startDate}
                onChange={(e) => setHistoryFilters(prev => ({ ...prev, startDate: e.target.value }))}
                className="text-xs"
              />
              <Input
                type="date"
                value={historyFilters.endDate}
                onChange={(e) => setHistoryFilters(prev => ({ ...prev, endDate: e.target.value }))}
                className="text-xs"
              />
              <Button onClick={handleHistoryFilter} size="sm">
                Filtrer
              </Button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {mergeHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  Aucun historique trouvé
                </div>
              ) : (
                mergeHistory.map((history) => (
                  <div key={history.id} className="border rounded p-3 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm font-medium">{history.operation}</div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewLogs(history.mergeRequestId)}
                        className="text-xs px-2 py-1"
                      >
                        Logs
                      </Button>
                    </div>
                    <div className="text-xs text-gray-600 mb-1">
                      {formatDate(history.timestamp)}
                    </div>
                    {history.details && (
                      <div className="text-xs text-gray-700">
                        {history.details}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {mergeRequest && (
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-semibold mb-4">Demande de fusion</h2>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>ID:</span>
                  <span className="font-medium">{mergeRequest.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Statut:</span>
                  <span className={cn(
                    "px-2 py-1 rounded text-xs font-medium",
                    mergeRequest.status === 'completed' && "bg-green-100 text-green-800",
                    mergeRequest.status === 'pending' && "bg-yellow-100 text-yellow-800",
                    mergeRequest.status === 'rejected' && "bg-red-100 text-red-800"
                  )}>
                    {mergeRequest.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Code chrono:</span>
                  <span className="font-medium">{mergeRequest.chronoCode}</span>
                </div>
                {mergeRequest.validatedBy && (
                  <div className="flex justify-between">
                    <span>Validé par:</span>
                    <span className="font-medium">{mergeRequest.validatedBy}</span>
                  </div>
                )}
                {mergeRequest.validatedAt && (
                  <div className="flex justify-between">
                    <span>Validé le:</span>
                    <span className="font-medium">{formatDate(mergeRequest.validatedAt)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={showLogsDialog} onOpenChange={setShowLogsDialog}>
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">
                Logs de fusion - ID {selectedMergeId}
              </h3>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-96">
              {mergeLogs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Aucun log trouvé
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-4 text-sm font-medium border-b pb-2">
                    <div>Table</div>
                    <div>Enregistrements</div>
                    <div>Statut</div>
                    <div>Timestamp</div>
                  </div>
                  {mergeLogs.map((log) => (
                    <div key={log.id} className="grid grid-cols-4 gap-4 text-sm py-2 border-b">
                      <div className="font-medium">{log.tableName}</div>
                      <div>{log.recordCount}</div>
                      <div>
                        <span className={cn(
                          "px-2 py-1 rounded text-xs",
                          log.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        )}>
                          {log.success ? 'Succès' : 'Erreur'}
                        </span>
                      </div>
                      <div>{formatDate(log.timestamp)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-6 border-t flex justify-end">
              <Button onClick={() => setShowLogsDialog(false)}>
                Fermer
              </Button>
            </div>
          </div>
        </div>
      </Dialog>
    </ScreenLayout>
  )
}

export default AccountMergePage