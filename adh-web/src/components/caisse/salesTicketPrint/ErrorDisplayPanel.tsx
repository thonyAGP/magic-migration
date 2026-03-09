import React from 'react'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'

export interface ErrorDisplayPanelProps {
  errorMessage: string
  onRetry?: () => void
  className?: string
}

export const ErrorDisplayPanel: React.FC<ErrorDisplayPanelProps> = ({
  errorMessage,
  onRetry,
  className
}) => {
  return (
    <div 
      className={cn(
        'flex flex-col items-center justify-center p-6 bg-red-50 rounded-lg border border-red-200',
        className
      )}
    >
      <div className="text-red-600 font-semibold text-center mb-4">
        {errorMessage}
      </div>
      {onRetry && (
        <Button 
          variant="destructive" 
          onClick={onRetry}
          className="px-4 py-2 rounded-md"
        >
          Retry
        </Button>
      )}
    </div>
  )
}