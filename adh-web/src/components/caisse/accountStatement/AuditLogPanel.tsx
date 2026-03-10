import { useState, useCallback, useEffect } from "react"
import { apiClient } from "@/services/api/apiClient"
import { Button, Input } from "@/components/ui"
import type { AuditLog } from "@/types"

const OPERATION_FILTERS = [
  "PRINT_STATEMENT", 
  "GENERATE_STATEMENT", 
  "VALIDATE_PRINTER"
] as const

interface AuditLogPanelProps {
  memberCode?: string
}

export const AuditLogPanel: React.FC<AuditLogPanelProps> = ({ memberCode }) => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [selectedOperation, setSelectedOperation] = useState<string | null>(null)
  const [timestampRange, setTimestampRange] = useState<{ start?: Date; end?: Date }>({})


  const fetchAuditLogs = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.get<AuditLog[]>("/audit-logs", {
        params: {
          memberCode,
          operation: selectedOperation,
          startTimestamp: timestampRange.start,
          endTimestamp: timestampRange.end
        }
      })

      setAuditLogs(response.data || [])
    } catch (error) {
      console.error("Failed to fetch audit logs", error)
    } finally {
      setIsLoading(false)
    }
  }, [memberCode, selectedOperation, timestampRange])

  useEffect(() => {
    fetchAuditLogs()
  }, [fetchAuditLogs])

  const handleOperationFilter = (operation: string) => {
    setSelectedOperation(operation === selectedOperation ? null : operation)
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <div className="flex space-x-2 mb-4">
        {OPERATION_FILTERS.map((operation) => (
          <Button
            key={operation}
            variant={selectedOperation === operation ? "primary" : "outline"}
            size="sm"
            onClick={() => handleOperationFilter(operation)}
          >
            {operation}
          </Button>
        ))}
      </div>

      <div className="flex space-x-2 mb-4">
        <Input
          type="date"
          placeholder="Start Date"
          value={timestampRange.start?.toISOString().split('T')[0] || ''}
          onChange={(e) => setTimestampRange(prev => ({
            ...prev, 
            start: new Date(e.target.value)
          }))}
        />
        <Input
          type="date"
          placeholder="End Date"
          value={timestampRange.end?.toISOString().split('T')[0] || ''}
          onChange={(e) => setTimestampRange(prev => ({
            ...prev, 
            end: new Date(e.target.value)
          }))}
        />
      </div>

      {isLoading ? (
        <div className="text-center text-gray-500">Loading audit logs...</div>
      ) : auditLogs.length === 0 ? (
        <div className="text-center text-gray-500">No audit logs found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Timestamp</th>
                <th className="p-2 text-left">Operation</th>
                <th className="p-2 text-left">Member Code</th>
                <th className="p-2 text-left">Printer Number</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{log.timestamp.toLocaleString()}</td>
                  <td className="p-2">{log.operation}</td>
                  <td className="p-2">{log.memberCode}</td>
                  <td className="p-2">{log.printerNumber || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}