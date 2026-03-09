import { apiClient } from "@/services/api/apiClient"
import type {
  SalesTicket,
  PaymentMethod,
  StayDates,
  TicketReduction,
  PaymentMethodClassification,
  TicketFooter
} from "@/types/salesTicketPrint"
import { useDataSourceStore } from "@/stores/dataSourceStore"

const createMockPaymentClassifications = (): Record<string, PaymentMethodClassification> => ({
  'CASH': { classification: 'LIQUID', label: 'Espèces' },
  'CARD': { classification: 'ELECTRONIC', label: 'Carte bancaire' },
  'CHECK': { classification: 'PAPER', label: 'Chèque' },
  'VOUCHER': { classification: 'VOUCHER', label: 'Bon d\'achat' }
})

const createMockTicketData = (ticketId: number): SalesTicket => ({
  ticketNumber: ticketId,
  saleDate: new Date(),
  totalAmount: 100.50,
  taxAmount: 10.05,
  printerNumber: 1
})

const createMockPaymentMethods = (): PaymentMethod[] => [
  { code: 'CASH', label: 'Cash Payment', amount: 50.25 },
  { code: 'CARD', label: 'Card Payment', amount: 50.25 }
]

const createMockStayDates = (): StayDates => ({
  checkInDate: new Date(),
  checkOutDate: new Date(Date.now() + 86400000),
  consumptionDate: new Date()
})

const createMockReductions = (): TicketReduction[] => [
  { type: 'DISCOUNT', amount: 10.00, percentage: 10 },
  { type: 'LOYALTY', amount: 5.00, percentage: 5 }
]

const createMockTicketFooter = (terminalId: string, legalMentions?: string[]): TicketFooter => {
  const currentDateTime = new Date()
  const formattedDate = currentDateTime.toLocaleDateString('fr-FR')
  const formattedTime = currentDateTime.toLocaleTimeString('fr-FR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })

  return {
    legalMentions: legalMentions || [
      'TVA non applicable - Art. 293B du CGI',
      'Merci de votre visite',
      'Service client: 01 23 45 67 89'
    ],
    terminalInfo: `Terminal: ${terminalId}`,
    printDateTime: `${formattedDate} ${formattedTime}`,
    footerSequence: Math.floor(Math.random() * 1000000)
  }
}

export const salesTicketPrintService = {
  getTicket: async (ticketId: number): Promise<SalesTicket> => {
    const isRealApi = useDataSourceStore.getState().isRealApi

    if (isRealApi) {
      const response = await apiClient.get<SalesTicket>(`/api/salesTicketPrint/ticket/${ticketId}`)
      return response.data
    }

    return createMockTicketData(ticketId)
  },

  getPaymentMethods: async (ticketId: number): Promise<PaymentMethod[]> => {
    const isRealApi = useDataSourceStore.getState().isRealApi

    if (isRealApi) {
      const response = await apiClient.get<PaymentMethod[]>(`/api/salesTicketPrint/paymentMethods/${ticketId}`)
      return response.data
    }

    return createMockPaymentMethods()
  },

  // ADH IDE 152: Recup Classe et Lib du MOP
  recupererClasseEtLibelleMOP: async (paymentCode: string): Promise<PaymentMethodClassification> => { // RM-152
    const isRealApi = useDataSourceStore.getState().isRealApi

    if (isRealApi) {
      const response = await apiClient.get<PaymentMethodClassification>(`/api/salesTicketPrint/mop/classification/${paymentCode}`)
      return response.data
    }

    const mockClassifications = createMockPaymentClassifications()
    return mockClassifications[paymentCode] || { 
      classification: 'OTHER', 
      label: paymentCode 
    }
  },

  getPaymentMethodClassification: async (paymentCode: string): Promise<PaymentMethodClassification> => {
    const isRealApi = useDataSourceStore.getState().isRealApi

    if (isRealApi) {
      const response = await apiClient.get<PaymentMethodClassification>(`/api/salesTicketPrint/paymentClassification/${paymentCode}`) // RM-152
      return response.data
    }

    const mockClassifications = { // RM-152
      'CASH': { classification: 'LIQUID', label: 'Espèces' },
      'CARD': { classification: 'ELECTRONIC', label: 'Carte bancaire' },
      'CHECK': { classification: 'PAPER', label: 'Chèque' }
    }

    return mockClassifications[paymentCode as keyof typeof mockClassifications] || { 
      classification: 'OTHER', 
      label: paymentCode 
    }
  },

  getStayDates: async (ticketId: number): Promise<StayDates> => {
    const isRealApi = useDataSourceStore.getState().isRealApi

    if (isRealApi) {
      const response = await apiClient.get<StayDates>(`/api/salesTicketPrint/stayDates/${ticketId}`)
      return response.data
    }

    return createMockStayDates()
  },

  getReductions: async (ticketId: number): Promise<TicketReduction[]> => {
    const isRealApi = useDataSourceStore.getState().isRealApi

    if (isRealApi) {
      const response = await apiClient.get<TicketReduction[]>(`/api/salesTicketPrint/reductions/${ticketId}`)
      return response.data
    }

    return createMockReductions()
  },

  // ADH IDE 251: Creation pied Ticket
  creationPiedTicket: async (terminalId: string, ticketNumber: number, legalMentions?: string[]): Promise<TicketFooter> => { // RM-251
    const isRealApi = useDataSourceStore.getState().isRealApi

    if (isRealApi) {
      const response = await apiClient.post<TicketFooter>('/api/salesTicketPrint/ticket/footer', {
        terminalId,
        ticketNumber,
        legalMentions
      })
      return response.data
    }

    return createMockTicketFooter(terminalId, legalMentions)
  },

  generateTicketFooter: async (terminalId: string, ticketNumber: number): Promise<TicketFooter> => {
    const isRealApi = useDataSourceStore.getState().isRealApi

    if (isRealApi) {
      const response = await apiClient.post<TicketFooter>('/api/salesTicketPrint/generateFooter', { // RM-251
        terminalId,
        ticketNumber
      })
      return response.data
    }

    const currentDate = new Date().toLocaleDateString('fr-FR') // RM-251
    return {
      legalMentions: [
        'TVA non applicable - Art. 293B du CGI',
        'Merci de votre visite'
      ],
      terminalInfo: `Terminal: ${terminalId}`,
      printDateTime: currentDate,
      footerSequence: Math.floor(Math.random() * 1000000)
    }
  },

  printTicket: async (
    ticketId: number, 
    printerNumber?: number, 
    reprint?: boolean
  ): Promise<void> => {
    const isRealApi = useDataSourceStore.getState().isRealApi

    if (isRealApi) {
      await apiClient.post('/api/salesTicketPrint/print', {
        ticketId,
        printerNumber,
        reprint
      })
      return
    }

    console.log(`Printing ticket ${ticketId}`)
  }
}