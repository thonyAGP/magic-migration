// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

const { mockStore, mockSetState } = vi.hoisted(() => {
  const store = {
    ticketData: null,
    paymentMethods: [],
    stayDates: null,
    reductions: [],
    isLoading: false,
    isPrinting: false,
    error: null,
    currentPrinterNumber: 1,
    printSalesTicket: vi.fn(),
    loadTicketData: vi.fn(),
    loadPaymentMethods: vi.fn(),
    loadStayDates: vi.fn(),
    printReductions: vi.fn(),
    printTaxDetails: vi.fn(),
    createTicketFooter: vi.fn(),
    reset: vi.fn(),
    setState: vi.fn()
  }
  return {
    mockStore: store,
    mockSetState: vi.fn()
  }
})

vi.mock('@/stores/salesTicketPrintStore', () => {
  const mockHook = (() => mockStore) as typeof mockStore & { setState: typeof mockSetState }
  mockHook.setState = mockSetState
  return { useSalesTicketPrintStore: mockHook }
})

vi.mock('@/components/layout', () => ({
  ScreenLayout: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="screen-layout" className={className}>{children}</div>
  )
}))

vi.mock('@/components/ui', () => ({
  Button: ({ children, onClick, disabled, className, ...props }: {
    children: React.ReactNode
    onClick?: () => void
    disabled?: boolean
    className?: string
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      data-testid={props['data-testid'] || 'button'}
      {...props}
    >
      {children}
    </button>
  ),
  Dialog: ({ open, onClose, children }: {
    open: boolean
    onClose: () => void
    children: React.ReactNode
  }) => (
    open ? (
      <div data-testid="dialog" role="dialog">
        <div onClick={onClose} data-testid="dialog-backdrop" />
        {children}
      </div>
    ) : null
  ),
  Input: ({ value, onChange, placeholder, type, id, className, ...props }: {
    value?: string
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    placeholder?: string
    type?: string
    id?: string
    className?: string
  }) => (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      type={type}
      id={id}
      className={className}
      data-testid={props['data-testid'] || 'input'}
      {...props}
    />
  )
}))

vi.mock('@/lib/utils', () => ({
  cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ')
}))

import { SalesTicketPrint } from '@/pages/SalesTicketPrintPage'

describe('SalesTicketPrintPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockStore.ticketData = null
    mockStore.paymentMethods = []
    mockStore.stayDates = null
    mockStore.reductions = []
    mockStore.isLoading = false
    mockStore.isPrinting = false
    mockStore.error = null
    mockStore.currentPrinterNumber = 1
  })

  it('renders without crashing', () => {
    render(<SalesTicketPrint />)
    
    expect(screen.getByText('Impression Ticket de Vente')).toBeInTheDocument()
    expect(screen.getByText('Nouveau Ticket')).toBeInTheDocument()
    expect(screen.getByText('Aucun ticket sélectionné')).toBeInTheDocument()
  })

  it('displays loading state', () => {
    mockStore.isLoading = true
    
    render(<SalesTicketPrint />)
    
    expect(screen.getByText('Veuillez patienter...')).toBeInTheDocument()
    const loadingElement = screen.getByText('Veuillez patienter...').closest('.loadingIndicator')
    expect(loadingElement).toHaveClass('loadingIndicator')
    const progressElement = screen.getByText('Veuillez patienter...').closest('div')?.querySelector('.progressSpinner')
    expect(progressElement).toHaveClass('progressSpinner')
  })

  it('displays error state with retry button', () => {
    mockStore.error = 'Erreur de chargement des données'
    
    render(<SalesTicketPrint />)
    
    const errorElement = screen.getByText('Erreur de chargement des données').closest('.errorDisplay')
    expect(errorElement).toHaveClass('errorDisplay')
    expect(screen.getByText('Erreur de chargement des données')).toBeInTheDocument()
    expect(screen.getByText('Réessayer')).toBeInTheDocument()
  })

  it('displays ticket data when loaded', () => {
    const mockTicket = {
      ticketNumber: 12345,
      saleDate: new Date('2024-01-15T10:30:00'),
      totalAmount: 150.50,
      taxAmount: 15.05,
      printerNumber: 1
    }
    
    const mockPayments = [
      { code: 'CASH', label: 'Espèces', amount: 100.00 },
      { code: 'CARD', label: 'Carte Bancaire', amount: 50.50 }
    ]
    
    const mockStay = {
      checkInDate: new Date('2024-01-15'),
      checkOutDate: new Date('2024-01-17'),
      consumptionDate: new Date('2024-01-16')
    }
    
    const mockReductions = [
      { type: 'Réduction Senior', amount: 10.00, percentage: 10 }
    ]
    
    mockStore.ticketData = mockTicket
    mockStore.paymentMethods = mockPayments
    mockStore.stayDates = mockStay
    mockStore.reductions = mockReductions
    
    render(<SalesTicketPrint />)
    
    const ticketElement = screen.getByText('Ticket N° 12345').closest('.ticketPreview')
    expect(ticketElement).toHaveClass('ticketPreview')
    expect(screen.getByText('Ticket N° 12345')).toBeInTheDocument()
    expect(screen.getByText('150,50 €')).toBeInTheDocument()
    expect(screen.getByText('TVA: 15,05 €')).toBeInTheDocument()
    
    expect(screen.getByText('Moyens de Paiement')).toBeInTheDocument()
    expect(screen.getByText('Espèces')).toBeInTheDocument()
    expect(screen.getByText('Carte Bancaire')).toBeInTheDocument()
    
    expect(screen.getByText('Dates de Séjour')).toBeInTheDocument()
    expect(screen.getByText('Réductions Appliquées')).toBeInTheDocument()
    expect(screen.getByText('Réduction Senior (10%)')).toBeInTheDocument()
  })

  it('opens and closes dialog for new ticket', async () => {
    render(<SalesTicketPrint />)
    
    const newTicketButton = screen.getByText('Nouveau Ticket')
    fireEvent.click(newTicketButton)
    
    await waitFor(() => {
      expect(screen.getByTestId('dialog')).toBeInTheDocument()
      expect(screen.getByText('Charger un Ticket')).toBeInTheDocument()
    })
    
    const cancelButton = screen.getByText('Annuler')
    fireEvent.click(cancelButton)
    
    await waitFor(() => {
      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument()
    })
  })

  it('handles ticket ID input and load', async () => {
    mockStore.loadTicketData.mockResolvedValue({
      ticketNumber: 123,
      saleDate: new Date(),
      totalAmount: 100,
      taxAmount: 10,
      printerNumber: 1
    })
    mockStore.loadPaymentMethods.mockResolvedValue([])
    mockStore.loadStayDates.mockResolvedValue({
      checkInDate: null,
      checkOutDate: null,
      consumptionDate: null
    })
    
    render(<SalesTicketPrint />)
    
    fireEvent.click(screen.getByText('Nouveau Ticket'))
    
    await waitFor(() => {
      expect(screen.getByTestId('dialog')).toBeInTheDocument()
    })
    
    const ticketInput = screen.getByPlaceholderText('Entrez le numéro de ticket')
    fireEvent.change(ticketInput, { target: { value: '123' } })
    
    const loadButton = screen.getByText('Charger')
    fireEvent.click(loadButton)
    
    await waitFor(() => {
      expect(mockStore.loadTicketData).toHaveBeenCalledWith(123)
      expect(mockStore.loadPaymentMethods).toHaveBeenCalledWith(123)
      expect(mockStore.loadStayDates).toHaveBeenCalledWith(123)
    })
  })

  it('handles print actions', async () => {
    const mockTicket = {
      ticketNumber: 12345,
      saleDate: new Date(),
      totalAmount: 150.50,
      taxAmount: 15.05,
      printerNumber: 1
    }
    
    mockStore.ticketData = mockTicket
    mockStore.printSalesTicket.mockResolvedValue()
    mockStore.printReductions.mockResolvedValue()
    mockStore.printTaxDetails.mockResolvedValue()
    
    render(<SalesTicketPrint />)
    
    const printActionsElement = screen.getByText('Imprimer').closest('.printActions')
    expect(printActionsElement).toHaveClass('printActions')
    
    const printButton = screen.getByText('Imprimer')
    fireEvent.click(printButton)
    
    await waitFor(() => {
      expect(mockStore.printSalesTicket).toHaveBeenCalledWith(12345, false)
    })
    
    const reprintButton = screen.getByText('Réimprimer')
    fireEvent.click(reprintButton)
    
    await waitFor(() => {
      expect(mockStore.printSalesTicket).toHaveBeenCalledWith(12345, true)
    })
    
    const taxButton = screen.getByText('Imprimer TVA')
    fireEvent.click(taxButton)
    
    await waitFor(() => {
      expect(mockStore.printTaxDetails).toHaveBeenCalledWith(12345)
    })
  })

  it('handles printer selection', () => {
    const mockTicket = {
      ticketNumber: 12345,
      saleDate: new Date(),
      totalAmount: 150.50,
      taxAmount: 15.05,
      printerNumber: 1
    }
    
    mockStore.ticketData = mockTicket
    mockStore.currentPrinterNumber = 4
    
    render(<SalesTicketPrint />)
    
    const printerSelect = screen.getByDisplayValue('Imprimante 4')
    expect(printerSelect).toHaveValue('4')
  })

  it('disables buttons during printing', () => {
    const mockTicket = {
      ticketNumber: 12345,
      saleDate: new Date(),
      totalAmount: 150.50,
      taxAmount: 15.05,
      printerNumber: 1
    }
    
    mockStore.ticketData = mockTicket
    mockStore.isPrinting = true
    
    render(<SalesTicketPrint />)
    
    expect(screen.getByText('Impression...')).toBeInTheDocument()
    expect(screen.getByText('Réimprimer')).toBeDisabled()
    expect(screen.getByText('Imprimer TVA')).toBeDisabled()
  })

  it('disables print reductions when no reductions available', () => {
    const mockTicket = {
      ticketNumber: 12345,
      saleDate: new Date(),
      totalAmount: 150.50,
      taxAmount: 15.05,
      printerNumber: 1
    }
    
    mockStore.ticketData = mockTicket
    mockStore.reductions = []
    
    render(<SalesTicketPrint />)
    
    expect(screen.getByText('Imprimer Réductions')).toBeDisabled()
  })

  it('calls reset on unmount', () => {
    const { unmount } = render(<SalesTicketPrint />)
    
    unmount()
    
    expect(mockStore.reset).toHaveBeenCalled()
  })

  it('handles retry on error', async () => {
    mockStore.error = 'Network error'
    mockStore.loadTicketData.mockResolvedValue({
      ticketNumber: 123,
      saleDate: new Date(),
      totalAmount: 100,
      taxAmount: 10,
      printerNumber: 1
    })
    mockStore.loadPaymentMethods.mockResolvedValue([])
    mockStore.loadStayDates.mockResolvedValue({
      checkInDate: null,
      checkOutDate: null,
      consumptionDate: null
    })
    
    render(<SalesTicketPrint />)
    
    // First load a ticket to set ticketId
    fireEvent.click(screen.getByText('Nouveau Ticket'))
    await waitFor(() => {
      expect(screen.getByTestId('dialog')).toBeInTheDocument()
    })
    
    const ticketInput = screen.getByPlaceholderText('Entrez le numéro de ticket')
    fireEvent.change(ticketInput, { target: { value: '123' } })
    
    const loadButton = screen.getByText('Charger')
    fireEvent.click(loadButton)
    
    await waitFor(() => {
      expect(mockStore.loadTicketData).toHaveBeenCalledWith(123)
    })
    
    // Now test retry
    const retryButton = screen.getByText('Réessayer')
    fireEvent.click(retryButton)
    
    await waitFor(() => {
      expect(mockStore.loadTicketData).toHaveBeenCalledTimes(2)
    })
  })
})