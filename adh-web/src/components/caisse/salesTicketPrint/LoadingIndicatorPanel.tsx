import React from 'react'
import { cn } from '@/lib/utils'
import { Spinner } from '@/components/ui/Spinner'

export interface LoadingIndicatorPanelProps {
  isLoading: boolean
  loadingMessage?: string
  className?: string
}

export const LoadingIndicatorPanel: React.FC<LoadingIndicatorPanelProps> = ({
  isLoading,
  loadingMessage = 'Loading...',
  className
}) => {
  if (!isLoading) return null

  return (
    <div 
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-black/50',
        'backdrop-blur-sm',
        className
      )}
    >
      <div 
        className={cn(
          'bg-white rounded-lg shadow-xl p-6',
          'flex flex-col items-center justify-center',
          'min-w-[300px] min-h-[200px]'
        )}
      >
        <Spinner 
          className={cn(
            'w-12 h-12 text-primary-500 mb-4',
            'animate-spin'
          )} 
        />
        <p 
          className={cn(
            'text-gray-700 text-lg font-medium',
            'text-center'
          )}
        >
          {loadingMessage}
        </p>
      </div>
    </div>
  )
}