import { cn } from '@/lib/utils'
import { Button } from '@/components/ui'

const PROCESSING_STATUS = {
  idle: 'Idle',
  processing: 'Processing...',
  completed: 'Completed',
  error: 'Error Occurred'
} as const

export interface ProcessingStatusPanelProps {
  memberName?: string
  processingStatus: keyof typeof PROCESSING_STATUS
  onRetry?: () => void
}

export const ProcessingStatusPanel = ({
  memberName,
  processingStatus,
  onRetry
}: ProcessingStatusPanelProps) => {
  const getStatusColor = (status: keyof typeof PROCESSING_STATUS) => {
    const statusColorMap = {
      idle: 'text-gray-500',
      processing: 'text-blue-500',
      completed: 'text-green-500',
      error: 'text-red-500'
    }
    return statusColorMap[status]
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-md">
      {memberName && (
        <div className="text-lg font-semibold mb-2">
          Member: {memberName}
        </div>
      )}
      <div className={cn(
        'text-md font-medium mb-4 flex items-center gap-2',
        getStatusColor(processingStatus)
      )}>
        <span className={`animate-pulse ${processingStatus === 'processing' ? 'visible' : 'invisible'}`}>
          ●
        </span>
        {PROCESSING_STATUS[processingStatus]}
      </div>
      {processingStatus === 'error' && onRetry && (
        <Button 
          variant="destructive" 
          onClick={onRetry}
          className="mt-2"
        >
          Retry
        </Button>
      )}
    </div>
  )
}