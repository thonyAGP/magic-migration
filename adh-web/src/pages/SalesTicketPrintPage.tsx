import React, { useCallback, useEffect, useState } from 'react'
import { ScreenLayout } from '@/components/layout'
import { Button, Dialog, Input } from '@/components/ui'
import { useSalesTicketPrintStore } from '@/stores/salesTicketPrintStore'

const formatDate = (date: Date | null): string => {
  if (!date) return '-'
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(date)
}

const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

export const SalesTicketPrint: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [ticketId, setTicketId] = useState<string>('')
  const [, setSelectedPrinter] = useState<number>(1)

  const {
    ticketData,
    paymentMethods,
    stayDates,
    reductions,
    isLoading,
    isPrinting,
    error,
    currentPrinterNumber,
    printSalesTicket,
    loadTicketData,
    loadPaymentMethods,
    loadStayDates,
    printReductions,
    printTaxDetails,
    reset
  } = useSalesTicketPrintStore()

  useEffect(() => {
    return () => {
      reset()
    }
  }, [reset])

  const handleOpenDialog = useCallback(() => {
    setIsDialogOpen(true)
  }, [])

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false)
    setTicketId('')
  }, [])

  const handleTicketIdChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setTicketId(event.target.value)
  }, [])

  const handlePrinterChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPrinter(Number(event.target.value))
  }, [])

  const loadAllTicketData = useCallback(async (ticketNumber: number) => {
    try {
      await Promise.all([
        loadTicketData(ticketNumber),
        loadPaymentMethods(ticketNumber),
        loadStayDates(ticketNumber)
      ])
    } catch (err) {
      console.error('Failed to load ticket data:', err)
    }
  }, [loadTicketData, loadPaymentMethods, loadStayDates])

  const handleLoadTicket = useCallback(async () => {
    if (!ticketId) return

    const parsedTicketId = parseInt(ticketId, 10)
    if (isNaN(parsedTicketId)) return

    await loadAllTicketData(parsedTicketId)
  }, [ticketId, loadAllTicketData])

  const handlePrint = useCallback(async () => {
    if (!ticketData) return

    try {
      await printSalesTicket(ticketData.ticketNumber, false)
      handleCloseDialog()
    } catch (err) {
      console.error('Failed to print ticket:', err)
    }
  }, [ticketData, printSalesTicket, handleCloseDialog])

  const handleReprint = useCallback(async () => {
    if (!ticketData) return

    try {
      await printSalesTicket(ticketData.ticketNumber, true)
    } catch (err) {
      console.error('Failed to reprint ticket:', err)
    }
  }, [ticketData, printSalesTicket])

  const handlePrintReductions = useCallback(async () => {
    if (!ticketData) return

    try {
      await printReductions(ticketData.ticketNumber)
    } catch (err) {
      console.error('Failed to print reductions:', err)
    }
  }, [ticketData, printReductions])

  const handlePrintTaxDetails = useCallback(async () => {
    if (!ticketData) return

    try {
      await printTaxDetails(ticketData.ticketNumber)
    } catch (err) {
      console.error('Failed to print tax details:', err)
    }
  }, [ticketData, printTaxDetails])

  const handleRetry = useCallback(() => {
    if (ticketId) {
      handleLoadTicket()
    }
  }, [ticketId, handleLoadTicket])

  const renderTicketHeader = () => (
    <div className="ticketHeader border-b border-gray-200 p-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Ticket N° {ticketData!.ticketNumber}
          </h3>
          <p className="text-sm text-gray-600">
            Date: {formatDate(ticketData!.saleDate)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">
            {formatAmount(ticketData!.totalAmount)}
          </p>
          <p className="text-sm text-gray-600">
            TVA: {formatAmount(ticketData!.taxAmount)}
          </p>
        </div>
      </div>
    </div>
  )

  const renderPaymentMethods = () => (
    <div className="paymentDetails border-b border-gray-200 p-6">
      <h4 className="text-md font-medium text-gray-900 mb-3">Moyens de Paiement</h4>
      <div className="space-y-2">
        {paymentMethods.map((payment, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-gray-700">{payment.label}</span>
            <span className="font-medium">{formatAmount(payment.amount)}</span>
          </div>
        ))}
      </div>
    </div>
  )

  const renderStayDates = () => (
    <div className="border-b border-gray-200 p-6">
      <h4 className="text-md font-medium text-gray-900 mb-3">Dates de Séjour</h4>
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <span className="text-gray-600">Arrivée:</span>
          <p className="font-medium">{formatDate(stayDates!.checkInDate)}</p>
        </div>
        <div>
          <span className="text-gray-600">Départ:</span>
          <p className="font-medium">{formatDate(stayDates!.checkOutDate)}</p>
        </div>
        <div>
          <span className="text-gray-600">Consommation:</span>
          <p className="font-medium">{formatDate(stayDates!.consumptionDate)}</p>
        </div>
      </div>
    </div>
  )

  const renderReductions = () => (
    <div className="reductionsApplied border-b border-gray-200 p-6">
      <h4 className="text-md font-medium text-gray-900 mb-3">Réductions Appliquées</h4>
      <div className="space-y-2">
        {reductions.map((reduction, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-gray-700">
              {reduction.type}
              {reduction.percentage && ` (${reduction.percentage}%)`}
            </span>
            <span className="font-medium text-green-600">
              {formatAmount(reduction.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )

  const renderPrintActions = () => (
    <div className="printActions p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="printerSelector">
            <label htmlFor="printer" className="block text-sm font-medium text-gray-700 mb-1">
              Imprimante
            </label>
            <select
              id="printer"
              value={currentPrinterNumber}
              onChange={handlePrinterChange}
              className="border border-gray-300 rounded px-3 py-2"
            >
              <option value={1}>Imprimante 1</option>
              <option value={4}>Imprimante 4</option>
              <option value={5}>Imprimante 5</option>
              <option value={8}>Imprimante 8</option>
              <option value={9}>Imprimante 9</option>
            </select>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Button
            onClick={handlePrintTaxDetails}
            disabled={isPrinting}
            className="bg-gray-600 hover:bg-gray-700"
          >
            Imprimer TVA
          </Button>
          <Button
            onClick={handlePrintReductions}
            disabled={isPrinting || reductions.length === 0}
            className="bg-green-600 hover:bg-green-700"
          >
            Imprimer Réductions
          </Button>
          <Button
            onClick={handleReprint}
            disabled={isPrinting}
            className="bg-orange-600 hover:bg-orange-700"
          >
            Réimprimer
          </Button>
          <Button
            onClick={handlePrint}
            disabled={isPrinting}
            className="printButton bg-blue-600 hover:bg-blue-700"
          >
            {isPrinting ? 'Impression...' : 'Imprimer'}
          </Button>
        </div>
      </div>
    </div>
  )

  const renderLoadingIndicator = () => (
    <div className="loadingIndicator bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-center space-x-3">
        <div className="progressSpinner w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="statusMessage text-gray-600">Veuillez patienter...</span>
      </div>
    </div>
  )

  const renderErrorDisplay = () => (
    <div className="errorDisplay bg-red-50 border border-red-200 rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-red-600 text-sm font-medium">!</span>
          </div>
          <span className="errorMessage text-red-800">{error}</span>
        </div>
        <Button onClick={handleRetry} className="retryButton bg-red-600 hover:bg-red-700 text-white">
          Réessayer
        </Button>
      </div>
    </div>
  )

  const renderTicketPreview = () => (
    <div className="ticketPreview bg-white rounded-lg shadow">
      {renderTicketHeader()}
      {paymentMethods.length > 0 && renderPaymentMethods()}
      {stayDates && renderStayDates()}
      {reductions.length > 0 && renderReductions()}
      {renderPrintActions()}
    </div>
  )

  const renderEmptyState = () => (
    <div className="bg-gray-50 rounded-lg p-12 text-center">
      <p className="text-gray-600 text-lg">Aucun ticket sélectionné</p>
      <p className="text-gray-500 mt-2">Cliquez sur "Nouveau Ticket" pour commencer</p>
    </div>
  )

  const renderTicketDialog = () => (
    <Dialog open={isDialogOpen} onClose={handleCloseDialog}>
      <div className="bg-white rounded-lg p-6 w-96">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Charger un Ticket</h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="ticketId" className="block text-sm font-medium text-gray-700 mb-1">
              Numéro de Ticket
            </label>
            <Input
              id="ticketId"
              type="number"
              value={ticketId}
              onChange={handleTicketIdChange}
              placeholder="Entrez le numéro de ticket"
              className="w-full"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              onClick={handleCloseDialog}
              className="cancelButton bg-gray-600 hover:bg-gray-700"
            >
              Annuler
            </Button>
            <Button
              onClick={handleLoadTicket}
              disabled={!ticketId || isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? 'Chargement...' : 'Charger'}
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  )

  return (
    <ScreenLayout className="flex flex-col h-full">
      <div className="flex-1 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Impression Ticket de Vente</h1>
          <Button onClick={handleOpenDialog} className="bg-blue-600 hover:bg-blue-700">
            Nouveau Ticket
          </Button>
        </div>

        {isLoading && renderLoadingIndicator()}

        {error && renderErrorDisplay()}

        {ticketData && !isLoading && renderTicketPreview()}

        {!ticketData && !isLoading && !error && renderEmptyState()}
      </div>

      {renderTicketDialog()}
    </ScreenLayout>
  )
}