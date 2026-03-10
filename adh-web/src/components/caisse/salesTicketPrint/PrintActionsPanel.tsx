import React from 'react'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'

export interface PrintActionsPanelProps {
  selectedPrinter: number
  onPrinterChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
  onPrint: () => void
  onCancel: () => void
  isPrinting?: boolean
}

interface SalesTicketPrinter {
  id: number
  name: string
}

const SALES_TICKET_PRINTERS: readonly SalesTicketPrinter[] = [
  { id: 1, name: 'Main Printer' },
  { id: 2, name: 'Secondary Printer' },
  { id: 3, name: 'Kitchen Printer' }
] as const

export const PrintActionsPanel: React.FC<PrintActionsPanelProps> = ({
  selectedPrinter,
  onPrinterChange,
  onPrint,
  onCancel,
  isPrinting = false
}) => {
  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow-md">
      <div className="flex items-center gap-4">
        <label htmlFor="salesTicketPrinterSelector" className="text-sm font-medium">
          Select Printer
        </label>
        <select
          id="salesTicketPrinterSelector"
          value={selectedPrinter}
          onChange={onPrinterChange}
          className="flex-1 px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {SALES_TICKET_PRINTERS.map((printer) => (
            <option key={printer.id} value={printer.id}>
              {printer.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex justify-between gap-4">
        <Button 
          onClick={onCancel}
          variant="outline"
          className="flex-1"
        >
          Cancel
        </Button>
        <Button 
          onClick={onPrint}
          disabled={isPrinting}
          className={cn(
            "flex-1",
            isPrinting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
          )}
        >
          {isPrinting ? 'Printing...' : 'Print'}
        </Button>
      </div>
    </div>
  )
}