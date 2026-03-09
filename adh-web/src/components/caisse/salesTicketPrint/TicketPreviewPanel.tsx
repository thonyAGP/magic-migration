import React from 'react'
import type { SalesTicket, PaymentMethod, StayDates, TicketReduction } from '@/types/salesTicketPrint'
import { Button } from '@/components/ui'

interface SalesTicketPreviewPanelProps {
  ticketData: SalesTicket | null
  paymentMethods: PaymentMethod[]
  stayDates: StayDates | null
  reductions: TicketReduction[]
  isLoading?: boolean
  onPrint?: () => void
  onReprint?: () => void
}

const formatCurrency = (amount: number): string =>
  amount.toLocaleString('en-US', { 
    style: 'currency', 
    currency: 'USD' 
  })

const formatDate = (date: Date | null): string => 
  date ? date.toLocaleDateString() : 'N/A'

export const TicketPreviewPanel: React.FC<SalesTicketPreviewPanelProps> = ({
  ticketData,
  paymentMethods,
  stayDates,
  reductions,
  isLoading = false,
  onPrint,
  onReprint
}) => {
  const renderSalesTicketHeader = () => (
    <div className="bg-gray-100 p-4 border-b border-gray-300">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Sales Ticket</h2>
        {ticketData && (
          <div className="text-right">
            <p>Ticket #: {ticketData.ticketNumber}</p>
            <p>Date: {ticketData.saleDate.toLocaleDateString()}</p>
          </div>
        )}
      </div>
    </div>
  )

  const renderPaymentMethodsList = () => (
    <div className="p-4">
      <h3 className="font-semibold mb-2">Payment Methods</h3>
      {paymentMethods.length > 0 ? (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2 text-left">Method</th>
              <th className="border p-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {paymentMethods.map((method, index) => (
              <tr key={index} className="border-b">
                <td className="border p-2">{method.label}</td>
                <td className="border p-2 text-right">
                  {formatCurrency(method.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-500">No payment methods found</p>
      )}
    </div>
  )

  const renderSalesTicketPaymentDetails = () => (
    <div className="p-4 border-t">
      <div className="flex justify-between">
        <span>Total Amount:</span>
        <span className="font-bold">
          {formatCurrency(ticketData?.totalAmount ?? 0)}
        </span>
      </div>
      <div className="flex justify-between">
        <span>Tax Amount:</span>
        <span>
          {formatCurrency(ticketData?.taxAmount ?? 0)}
        </span>
      </div>
    </div>
  )

  const renderTicketReductionsApplied = () => (
    <div className="p-4 border-t">
      <h3 className="font-semibold mb-2">Reductions</h3>
      {reductions.length > 0 ? (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2 text-left">Type</th>
              <th className="border p-2 text-right">Amount</th>
              <th className="border p-2 text-right">Percentage</th>
            </tr>
          </thead>
          <tbody>
            {reductions.map((reduction, index) => (
              <tr key={index} className="border-b">
                <td className="border p-2">{reduction.type}</td>
                <td className="border p-2 text-right">
                  {formatCurrency(reduction.amount)}
                </td>
                <td className="border p-2 text-right">
                  {reduction.percentage ? `${reduction.percentage}%` : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-500">No reductions applied</p>
      )}
    </div>
  )

  const renderTicketStayDates = () => (
    <div className="p-4 border-t">
      <h3 className="font-semibold mb-2">Stay Details</h3>
      {stayDates ? (
        <>
          <div className="flex justify-between mb-1">
            <span>Check-in:</span>
            <span>{formatDate(stayDates.checkInDate)}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span>Check-out:</span>
            <span>{formatDate(stayDates.checkOutDate)}</span>
          </div>
          <div className="flex justify-between">
            <span>Consumption Date:</span>
            <span>{formatDate(stayDates.consumptionDate)}</span>
          </div>
        </>
      ) : (
        <p className="text-gray-500">No stay dates available</p>
      )}
    </div>
  )

  const renderSalesTicketActionButtons = () => (
    <div className="p-4 border-t flex justify-between">
      <Button 
        variant="outline" 
        onClick={onReprint}
        disabled={!ticketData}
      >
        Reprint
      </Button>
      <Button 
        variant="default" 
        onClick={onPrint}
        disabled={!ticketData}
      >
        Print Ticket
      </Button>
    </div>
  )

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <span>Loading ticket preview...</span>
      </div>
    )
  }

  if (!ticketData) {
    return (
      <div className="flex justify-center items-center h-full text-gray-500">
        No ticket selected
      </div>
    )
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      {renderSalesTicketHeader()}
      {renderPaymentMethodsList()}
      {renderSalesTicketPaymentDetails()}
      {renderTicketReductionsApplied()}
      {renderTicketStayDates()}
      {renderSalesTicketActionButtons()}
    </div>
  )
}