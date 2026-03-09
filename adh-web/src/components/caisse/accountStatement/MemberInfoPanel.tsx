import { useState } from 'react'
import { useDataSourceStore } from "@/stores/dataSourceStore"
import { apiClient } from "@/services/api/apiClient"
import { Button, Input } from "@/components/ui"
import { cn } from "@/lib/utils"
import type { AccountStatement } from '@/types/accountStatement'

interface MemberInfoPanelProps {
  onMemberSelect?: (memberCode: string) => void
  className?: string
}

export const MemberInfoPanel = ({ onMemberSelect, className }: MemberInfoPanelProps) => {
  const [memberCode, setMemberCode] = useState<string>('')
  const [memberInfo, setMemberInfo] = useState<AccountStatement | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const handleMemberCodeSearch = async () => {
    if (!memberCode) return

    setIsLoading(true)
    setError(null)

    try {
      const isRealApi = useDataSourceStore.getState().isRealApi
      const endpoint = isRealApi ? '/api/member-info' : '/mock/member-info'

      const response = await apiClient.get<AccountStatement>(endpoint, { 
        params: { memberCode } 
      })

      if (response.data) {
        setMemberInfo(response.data)
        onMemberSelect?.(memberCode)
      } else {
        setError('Member not found')
      }
    } catch {
      setError('Error fetching member information')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn(
      'bg-white p-4 rounded-lg shadow-md space-y-4',
      className
    )}>
      <div className="flex space-x-2">
        <Input
          value={memberCode}
          onChange={(e) => setMemberCode(e.target.value)}
          placeholder="Enter Member Code"
          className="flex-grow"
          disabled={isLoading}
        />
        <Button 
          onClick={handleMemberCodeSearch} 
          disabled={isLoading || !memberCode}
          className="px-4"
        >
          {isLoading ? 'Searching...' : 'Search'}
        </Button>
      </div>

      {error && (
        <div className="text-red-500 text-sm">
          {error}
        </div>
      )}

      {memberInfo && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="font-semibold">Member Name:</div>
            <div>{memberInfo.memberName}</div>
            
            <div className="font-semibold">Member Number:</div>
            <div>{memberInfo.memberNumber}</div>
          </div>
        </div>
      )}
    </div>
  )
}