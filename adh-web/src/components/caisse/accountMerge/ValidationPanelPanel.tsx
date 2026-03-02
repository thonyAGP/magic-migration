import type { ValidationStatus, Account } from '@/types/accountMerge'
import { useAccountMergeStore } from '@/stores/accountMergeStore'
import { cn } from '@/lib/utils'

interface ValidationPanelProps {
  className?: string
}

export const ValidationPanel = ({ className }: ValidationPanelProps) => {
  const { validationStatus, sourceAccount, targetAccount, error } = useAccountMergeStore()

  const getStatusColor = (status: boolean | string) => {
    if (typeof status === 'boolean') {
      return status ? 'text-green-600' : 'text-red-600'
    }
    switch (status) {
      case 'valid':
        return 'text-green-600'
      case 'invalid':
        return 'text-red-600'
      default:
        return 'text-yellow-600'
    }
  }

  const getStatusIcon = (status: boolean | string) => {
    if (typeof status === 'boolean') {
      return status ? '✓' : '✗'
    }
    switch (status) {
      case 'valid':
        return '✓'
      case 'invalid':
        return '✗'
      default:
        return '⚠'
    }
  }

  const getStatusText = (status: boolean | string) => {
    if (typeof status === 'boolean') {
      return status ? 'Connecté' : 'Déconnecté'
    }
    switch (status) {
      case 'valid':
        return 'Validé'
      case 'invalid':
        return 'Invalide'
      default:
        return 'En attente'
    }
  }

  const formatAccountStatus = (account: Account | null) => {
    if (!account) return 'Non chargé'
    return `${account.clientName || 'Client inconnu'} - Balance: ${account.balance.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}`
  }

  return (
    <div className={cn('bg-white rounded-lg border border-gray-200 p-6', className)}>
      <h3 className="text-lg font-semibold mb-4">Validation</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
          <span className="font-medium">Réseau</span>
          <div className="flex items-center gap-2">
            <span className={cn('text-sm font-medium', getStatusColor(validationStatus?.network ?? false))}>
              {getStatusIcon(validationStatus?.network ?? false)}
            </span>
            <span className={cn('text-sm', getStatusColor(validationStatus?.network ?? false))}>
              {getStatusText(validationStatus?.network ?? false)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
          <span className="font-medium">Clôture</span>
          <div className="flex items-center gap-2">
            <span className={cn('text-sm font-medium', getStatusColor(validationStatus?.closure ?? false))}>
              {getStatusIcon(validationStatus?.closure ?? false)}
            </span>
            <span className={cn('text-sm', getStatusColor(validationStatus?.closure ?? false))}>
              {getStatusText(validationStatus?.closure ?? false)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
          <span className="font-medium">Validation</span>
          <div className="flex items-center gap-2">
            <span className={cn('text-sm font-medium', getStatusColor(validationStatus?.validation ?? 'pending'))}>
              {getStatusIcon(validationStatus?.validation ?? 'pending')}
            </span>
            <span className={cn('text-sm', getStatusColor(validationStatus?.validation ?? 'pending'))}>
              {getStatusText(validationStatus?.validation ?? 'pending')}
            </span>
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">Comptes</h4>
          <div className="space-y-2">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-gray-600">Compte source:</span>
              <span className="text-sm">{formatAccountStatus(sourceAccount)}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-gray-600">Compte cible:</span>
              <span className="text-sm">{formatAccountStatus(targetAccount)}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="border-t pt-4">
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-start gap-2">
                <span className="text-red-600 font-medium">✗</span>
                <div className="flex-1">
                  <h5 className="font-medium text-red-800 mb-1">Erreur</h5>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}