import { useState, useEffect } from 'react'
import { Button, Dialog, Input } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useAccountMergeStore } from '@/stores/accountMergeStore'
import type { MergeHistory, MergeLog } from '@/types/accountMerge'

interface HistoryPanelProps {
  className?: string
  filters: {
    startDate: string
    endDate: string
    accountId: string
  }
  onFiltersChange: (filters: { startDate: string; endDate: string; accountId: string }) => void
  onViewLogs: (mergeId: number) => void
}

export const HistoryPanel = ({ 
  className, 
  filters, 
  onFiltersChange, 
  onViewLogs 
}: HistoryPanelProps) => {
  const { mergeHistory, getMergeHistory } = useAccountMergeStore()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true)
      try {
        await getMergeHistory()
      } finally {
        setIsLoading(false)
      }
    }
    loadHistory()
  }, [getMergeHistory])

  const handleDateRangeChange = (field: 'startDate' | 'endDate', value: string) => {
    onFiltersChange({
      ...filters,
      [field]: value
    })
  }

  const handleAccountFilterChange = (value: string) => {
    onFiltersChange({
      ...filters,
      accountId: value
    })
  }

  const filteredHistory = mergeHistory.filter((item) => {
    if (filters.startDate && new Date(item.timestamp) < new Date(filters.startDate)) {
      return false
    }
    if (filters.endDate && new Date(item.timestamp) > new Date(filters.endDate)) {
      return false
    }
    if (filters.accountId && !item.operation.toLowerCase().includes(filters.accountId.toLowerCase())) {
      return false
    }
    return true
  })

  return (
    <div className={cn('bg-white rounded-lg shadow-sm border p-6', className)}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Historique des fusions
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de début
            </label>
            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de fin
            </label>
            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filtrer par compte
            </label>
            <Input
              type="text"
              placeholder="N° de compte"
              value={filters.accountId}
              onChange={(e) => handleAccountFilterChange(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => onFiltersChange({ startDate: '', endDate: '', accountId: '' })}
              className="w-full"
            >
              Réinitialiser
            </Button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-2">Aucun historique trouvé</div>
            <div className="text-sm text-gray-400">
              {filters.startDate || filters.endDate || filters.accountId
                ? 'Essayez de modifier vos filtres'
                : 'Aucune fusion n\'a encore été effectuée'}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID Fusion
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date/Heure
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Opération
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Détails
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{item.mergeRequestId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.timestamp).toLocaleString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.operation}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {item.details || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewLogs(item.mergeRequestId)}
                      >
                        Voir logs
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {filteredHistory.length > 0 && (
        <div className="mt-4 text-sm text-gray-500 text-right">
          {filteredHistory.length} résultat{filteredHistory.length > 1 ? 's' : ''}
          {filters.startDate || filters.endDate || filters.accountId ? ' (filtré)' : ''}
        </div>
      )}
    </div>
  )
}