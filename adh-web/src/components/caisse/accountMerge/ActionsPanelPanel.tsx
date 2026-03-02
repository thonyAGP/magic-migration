import type { ButtonHTMLAttributes } from 'react'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useAccountMergeStore } from '@/stores/accountMergeStore'

interface ActionsPanelProps {
  className?: string
  onExecute?: () => void
  onCancel?: () => void
  onPrintTicket?: () => void
  onViewHistory?: () => void
}

export const ActionsPanel = ({
  className,
  onExecute,
  onCancel,
  onPrintTicket,
  onViewHistory
}: ActionsPanelProps) => {
  const {
    mergeRequest,
    sourceAccount,
    targetAccount,
    validationStatus,
    currentStep,
    isProcessing,
    executeMerge,
    cancelMerge,
    printMergeTicket
  } = useAccountMergeStore()

  const canExecute = !!(
    sourceAccount &&
    targetAccount &&
    validationStatus?.network &&
    validationStatus?.closure &&
    validationStatus?.validation === 'valid' &&
    currentStep === 'validation' &&
    !isProcessing
  )

  const canCancel = !!(
    mergeRequest &&
    (mergeRequest.status === 'pending' || mergeRequest.status === 'validated') &&
    !isProcessing
  )

  const canPrint = !!(
    mergeRequest &&
    (mergeRequest.status === 'completed' || mergeRequest.status === 'validated')
  )

  const handleExecute = async () => {
    if (canExecute) {
      try {
        await executeMerge()
        onExecute?.()
      } catch (error) {
        console.error('Execute merge failed:', error)
      }
    }
  }

  const handleCancel = async () => {
    if (canCancel) {
      try {
        await cancelMerge()
        onCancel?.()
      } catch (error) {
        console.error('Cancel merge failed:', error)
      }
    }
  }

  const handlePrintTicket = async () => {
    if (canPrint && mergeRequest) {
      try {
        await printMergeTicket(mergeRequest.id)
        onPrintTicket?.()
      } catch (error) {
        console.error('Print ticket failed:', error)
      }
    }
  }

  const handleViewHistory = () => {
    onViewHistory?.()
  }

  return (
    <div className={cn('flex gap-3 p-4 bg-gray-50 border-t', className)}>
      <Button
        onClick={handleExecute}
        disabled={!canExecute || isProcessing}
        className="bg-green-600 hover:bg-green-700 text-white font-medium px-6"
      >
        {isProcessing ? 'Exécution...' : 'Exécuter la fusion'}
      </Button>
      
      <Button
        onClick={handleCancel}
        disabled={!canCancel}
        variant="outline"
        className="border-red-200 text-red-600 hover:bg-red-50 px-6"
      >
        Annuler
      </Button>
      
      <Button
        onClick={handlePrintTicket}
        disabled={!canPrint}
        variant="outline"
        className="border-blue-200 text-blue-600 hover:bg-blue-50 px-6"
      >
        Imprimer ticket
      </Button>
      
      <Button
        onClick={handleViewHistory}
        variant="outline"
        className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 ml-auto"
      >
        Voir l'historique
      </Button>
    </div>
  )
}