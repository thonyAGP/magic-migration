import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui'

export interface HeaderPanelProps {
  adherentName: string
  memberCode: string
  onGenerateStatement: () => void
  isProcessing: boolean
}

export const HeaderPanel = ({
  adherentName,
  memberCode,
  onGenerateStatement,
  isProcessing
}: HeaderPanelProps) => {
  const [isInfoExpanded, setIsInfoExpanded] = useState(false)

  return (
    <div className="bg-white shadow-sm rounded-lg p-4 mb-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-gray-800">
            Relevé de Compte
          </h1>
          <div 
            onClick={() => setIsInfoExpanded(!isInfoExpanded)}
            className="cursor-pointer flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <span className="text-sm font-medium">
              {adherentName || 'Aucun adhérent sélectionné'}
            </span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={cn(
                "h-5 w-5 transition-transform", 
                isInfoExpanded ? "rotate-180" : ""
              )} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <Button 
          onClick={onGenerateStatement}
          disabled={!memberCode || isProcessing}
          className={cn(
            "px-4 py-2 rounded transition-colors",
            !memberCode || isProcessing 
              ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
              : "bg-blue-600 text-white hover:bg-blue-700"
          )}
        >
          {isProcessing ? 'Génération en cours...' : 'Générer Relevé'}
        </Button>
      </div>

      {isInfoExpanded && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Code Adhérent</p>
              <p className="font-medium text-gray-800">{memberCode || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Nom Complet</p>
              <p className="font-medium text-gray-800">{adherentName || 'N/A'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}