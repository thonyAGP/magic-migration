import { useMemo } from 'react'
import { DataGrid } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { MergeLog } from '@/types/accountMerge'

interface LogsPanelProps {
  logs: MergeLog[]
  isLoading?: boolean
  className?: string
}

export const LogsPanelPanel = ({ logs, isLoading = false, className }: LogsPanelProps) => {
  const columns = useMemo(() => [
    {
      key: 'tableName',
      header: 'Table',
      sortable: true,
      render: (log: MergeLog) => (
        <span className="font-mono text-sm">{log.tableName}</span>
      )
    },
    {
      key: 'recordCount',
      header: 'Enregistrements',
      sortable: true,
      render: (log: MergeLog) => (
        <span className="text-right font-medium">
          {log.recordCount.toLocaleString()}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Statut',
      sortable: true,
      render: (log: MergeLog) => (
        <div className={cn(
          "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
          log.success
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        )}>
          <div className={cn(
            "w-1.5 h-1.5 rounded-full mr-2",
            log.success ? "bg-green-500" : "bg-red-500"
          )} />
          {log.success ? 'Succès' : 'Erreur'}
        </div>
      )
    },
    {
      key: 'timestamp',
      header: 'Heure',
      sortable: true,
      render: (log: MergeLog) => (
        <span className="text-sm text-gray-600">
          {new Date(log.timestamp).toLocaleString('fr-FR')}
        </span>
      )
    }
  ], [])

  if (isLoading) {
    return (
      <div className={cn("bg-white rounded-lg border p-6", className)}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-4 w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="grid grid-cols-4 gap-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (logs.length === 0) {
    return (
      <div className={cn("bg-white rounded-lg border p-8 text-center", className)}>
        <div className="text-gray-500">
          <div className="text-lg font-medium mb-2">Aucun log disponible</div>
          <p className="text-sm">Les logs d'opération apparaîtront ici une fois la fusion démarrée.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("bg-white rounded-lg border", className)}>
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Logs d'opération ({logs.length})
        </h3>
      </div>
      <div className="p-6">
        <DataGrid
          data={logs}
          columns={columns}
          keyField="id"
          className="w-full"
          pageSize={10}
          showPagination={logs.length > 10}
        />
      </div>
    </div>
  )
}