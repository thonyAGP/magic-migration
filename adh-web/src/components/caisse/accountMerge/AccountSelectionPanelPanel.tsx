import { useState, useCallback } from 'react'
import { Button, Input } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useAccountMergeStore } from '@/stores/accountMergeStore'

interface AccountSelectionPanelProps {
  className?: string
  sourceAccountId: string
  targetAccountId: string
  onSourceAccountChange: (value: string) => void
  onTargetAccountChange: (value: string) => void
  onValidate: () => void
}

export const AccountSelectionPanel = ({
  className,
  sourceAccountId,
  targetAccountId,
  onSourceAccountChange,
  onTargetAccountChange,
  onValidate
}: AccountSelectionPanelProps) => {
  const [isValidating, setIsValidating] = useState(false)
  
  const {
    sourceAccount,
    targetAccount,
    validationStatus,
    error,
    isProcessing
  } = useAccountMergeStore()

  const handleValidate = useCallback(async () => {
    if (!sourceAccountId || !targetAccountId) {
      return
    }
    
    setIsValidating(true)
    try {
      await onValidate()
    } finally {
      setIsValidating(false)
    }
  }, [sourceAccountId, targetAccountId, onValidate])

  const getValidationStatusColor = () => {
    if (!validationStatus) return 'text-gray-500'
    
    const { network, closure, validation } = validationStatus
    
    if (validation === 'rejected') return 'text-red-600'
    if (network && closure && validation === 'validated') return 'text-green-600'
    return 'text-yellow-600'
  }

  const getValidationStatusText = () => {
    if (!validationStatus) return 'Non validé'
    
    const { network, closure, validation } = validationStatus
    
    if (validation === 'rejected') return 'Validation rejetée'
    if (validation === 'validated') {
      if (network && closure) return 'Validation complète'
      return 'Validation partielle'
    }
    return 'En cours de validation'
  }

  const isValidateDisabled = !sourceAccountId || !targetAccountId || isValidating || isProcessing

  return (
    <div className={cn('bg-white rounded-lg border p-6', className)}>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Sélection des comptes
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="sourceAccount" className="block text-sm font-medium text-gray-700">
              Compte source
            </label>
            <Input
              id="sourceAccount"
              type="number"
              placeholder="ID du compte source"
              value={sourceAccountId}
              onChange={(e) => onSourceAccountChange(e.target.value)}
              disabled={isProcessing}
              className="w-full"
            />
            {sourceAccount && (
              <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                <div>Client: {sourceAccount.clientName || 'Non renseigné'}</div>
                <div>Statut: {sourceAccount.status}</div>
                <div>Solde: {sourceAccount.balance.toFixed(2)} €</div>
                {sourceAccount.linkedAccounts && (
                  <div>Comptes liés: {sourceAccount.linkedAccounts}</div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="targetAccount" className="block text-sm font-medium text-gray-700">
              Compte cible
            </label>
            <Input
              id="targetAccount"
              type="number"
              placeholder="ID du compte cible"
              value={targetAccountId}
              onChange={(e) => onTargetAccountChange(e.target.value)}
              disabled={isProcessing}
              className="w-full"
            />
            {targetAccount && (
              <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                <div>Client: {targetAccount.clientName || 'Non renseigné'}</div>
                <div>Statut: {targetAccount.status}</div>
                <div>Solde: {targetAccount.balance.toFixed(2)} €</div>
                {targetAccount.linkedAccounts && (
                  <div>Comptes liés: {targetAccount.linkedAccounts}</div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            onClick={handleValidate}
            disabled={isValidateDisabled}
            className="px-6"
          >
            {isValidating ? 'Validation...' : 'Valider les comptes'}
          </Button>

          <div className="text-right">
            <div className="text-sm font-medium text-gray-700 mb-1">
              Statut de validation
            </div>
            <div className={cn('text-sm font-medium', getValidationStatusColor())}>
              {getValidationStatusText()}
            </div>
            {validationStatus && (
              <div className="text-xs text-gray-500 mt-1">
                Réseau: {validationStatus.network ? '✓' : '✗'} | 
                Clôture: {validationStatus.closure ? '✓' : '✗'}
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="text-sm text-red-600">{error}</div>
          </div>
        )}
      </div>
    </div>
  )
}