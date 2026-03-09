import { useState, useCallback } from 'react'
import { useAccountStatementStore } from "@/stores/accountStatementStore"
import { Button, Select } from "@/components/ui"
import { cn } from "@/lib/utils"

const PRINTER_OPTIONS = [
  { value: 1, label: 'Printer 1' },
  { value: 6, label: 'Printer 6' },
  { value: 8, label: 'Printer 8' },
  { value: 9, label: 'Printer 9' }
] as const

interface PrinterSelectionPanelProps {
  onPrinterValidation?: (success: boolean) => void
  className?: string
}

export const PrinterSelectionPanel: React.FC<PrinterSelectionPanelProps> = ({
  onPrinterValidation,
  className
}) => {
  const { currentPrinter } = useAccountStatementStore()
  const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'success' | 'error'>('idle')

  const handlePrinterChange = useCallback((value: number) => {
    useAccountStatementStore.setState({ currentPrinter: value })
  }, [])

  const validateSelectedPrinter = useCallback(async () => {
    setValidationStatus('validating')
    try {
      let validationResult = false
      switch (currentPrinter) {
        case 1:
          validationResult = await useAccountStatementStore.getState().validatePrinter1()
          break
        case 6:
          validationResult = await useAccountStatementStore.getState().validatePrinter6()
          break
        case 8:
          validationResult = await useAccountStatementStore.getState().validatePrinter8()
          break
        case 9:
          validationResult = await useAccountStatementStore.getState().validatePrinter9()
          break
      }

      const status = validationResult ? 'success' : 'error'
      setValidationStatus(status)
      onPrinterValidation?.(validationResult)
      return validationResult
    } catch {
      setValidationStatus('error')
      onPrinterValidation?.(false)
      return false
    }
  }, [currentPrinter, onPrinterValidation])

  return (
    <div className={cn('flex flex-col gap-4 w-full max-w-md', className)}>
      <Select
        value={currentPrinter}
        onValueChange={(value) => handlePrinterChange(Number(value))}
        options={PRINTER_OPTIONS}
        placeholder="Select Printer"
        disabled={validationStatus === 'validating'}
      />
      
      <Button 
        onClick={validateSelectedPrinter}
        disabled={!currentPrinter || validationStatus === 'validating'}
        variant={validationStatus === 'success' ? 'success' : 
                 validationStatus === 'error' ? 'destructive' : 'default'}
      >
        {validationStatus === 'validating' ? 'Validating...' : 
         validationStatus === 'success' ? 'Validated' : 
         validationStatus === 'error' ? 'Validation Failed' : 
         'Validate Printer'}
      </Button>

      {validationStatus === 'error' && (
        <div className="text-red-500 text-sm">
          Printer validation failed. Please select another printer.
        </div>
      )}
    </div>
  )
}