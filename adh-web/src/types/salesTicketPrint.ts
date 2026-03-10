import type { ApiResponse } from "@/services/api/apiClient"

export interface SalesTicket {
  ticketNumber: number
  saleDate: Date
  totalAmount: number
  taxAmount: number
  printerNumber: number | null
}

export interface PaymentMethod {
  code: string
  label: string
  amount: number
}

export interface StayDates {
  checkInDate: Date | null
  checkOutDate: Date | null
  consumptionDate: Date | null
}

export interface TicketReduction {
  type: string
  amount: number
  percentage: number | null
}

export interface PaymentMethodClassification {
  classification: string
  label: string
}

export interface TicketFooter {
  content: string
  timestamp: Date
}

export interface StatLieuVenteDate {
  lieuId: number
  venteDate: Date
  totalAmount: number
  transactionCount: number
}

export interface TempoEcranPolice {
  ecranId: number
  policeSize: number
  fontFamily: string
  isActive: boolean
}

export interface Hebergement {
  hebId: number
  roomNumber: string
  guestName: string
  checkInDate: Date
  checkOutDate: Date
  status: string
}

export interface Article {
  artId: number
  code: string
  designation: string
  price: number
  vatRate: number
  categoryId: number
}

export interface Table {
  tabId: number
  tableNumber: string
  sectionId: number
  capacity: number
  status: string
}

export interface LogMajTpe {
  logId: number
  tpeId: number
  updateDate: Date
  operation: string
  status: string
}

export interface Comptable {
  cteId: number
  accountCode: string
  accountLabel: string
  debitAmount: number
  creditAmount: number
}

export interface CategorieOperationMw {
  categoryId: number
  operationType: string
  label: string
  isActive: boolean
}

export interface GmComplet {
  gmcId: number
  productCode: string
  fullDescription: string
  shortDescription: string
  unitPrice: number
}

export interface Table1037 {
  id: number
  referenceCode: string
  description: string
  numericValue: number
  textValue: string
  dateValue: Date | null
}

export interface Initialisation {
  iniId: number
  parameterCode: string
  parameterValue: string
  description: string
  isActive: boolean
}

export interface BooAvailibleEmployee {
  employeeId: number
  firstName: string
  lastName: string
  position: string
  isAvailable: boolean
  shiftStartTime: Date | null
  shiftEndTime: Date | null
}

export interface ArcCcTotal {
  arcId: number
  creditCardType: string
  terminalId: number
  totalAmount: number
  transactionCount: number
  processingDate: Date
}

export const SALES_TICKET_PRINT_TABLES = {
  HEBERGEMENT: 34,
  ARTICLES: 77,
  TABLES: 67,
  COMPTABLE: 40,
  GM_COMPLET: 31,
  INITIALISATION: 69
} as const

export interface SalesTicketPrintState {
  ticketData: SalesTicket | null
  paymentMethods: PaymentMethod[]
  stayDates: StayDates | null
  reductions: TicketReduction[]
  statLieuVenteDate: StatLieuVenteDate[]
  tempoEcranPolice: TempoEcranPolice[]
  hebergements: Hebergement[]
  articles: Article[]
  tables: Table[]
  logMajTpe: LogMajTpe[]
  comptables: Comptable[]
  categoriesOperationMw: CategorieOperationMw[]
  gmComplets: GmComplet[]
  table1037Records: Table1037[]
  initialisations: Initialisation[]
  booAvailibleEmployees: BooAvailibleEmployee[]
  arcCcTotals: ArcCcTotal[]
  isLoading: boolean
  isPrinting: boolean
  error: string | null
  currentPrinterNumber: number
  tableRegistry: Record<number, string>
}

export interface SalesTicketPrintActions {
  printSalesTicket(ticketId: number, reprintMode?: boolean): Promise<void>
  loadTicketData(ticketId: number): Promise<SalesTicket>
  loadPaymentMethods(ticketId: number): Promise<PaymentMethod[]>
  loadStayDates(ticketId: number): Promise<StayDates>
  printReductions(ticketId: number): Promise<void>
  printTaxDetails(ticketId: number): Promise<void>
  createTicketFooter(ticketId: number): Promise<string>
  loadStatLieuVenteDate(lieuId: number): Promise<StatLieuVenteDate[]>
  loadTempoEcranPolice(ecranId: number): Promise<TempoEcranPolice[]>
  loadHebergements(guestName?: string): Promise<Hebergement[]>
  loadArticles(categoryId?: number): Promise<Article[]>
  loadTables(sectionId?: number): Promise<Table[]>
  loadLogMajTpe(tpeId: number): Promise<LogMajTpe[]>
  loadComptables(accountCode?: string): Promise<Comptable[]>
  loadCategoriesOperationMw(): Promise<CategorieOperationMw[]>
  loadGmComplets(productCode?: string): Promise<GmComplet[]>
  loadTable1037Records(referenceCode?: string): Promise<Table1037[]>
  loadInitialisations(parameterCode?: string): Promise<Initialisation[]>
  loadBooAvailibleEmployees(position?: string): Promise<BooAvailibleEmployee[]>
  loadArcCcTotals(terminalId?: number): Promise<ArcCcTotal[]>
  registerTable(tableNumber: number, tableName: string): void
  getTableName(tableNumber: number): string | undefined
}

export type SalesTicketResponse = ApiResponse<SalesTicket>
export type PaymentMethodsResponse = ApiResponse<PaymentMethod[]>
export type StayDatesResponse = ApiResponse<StayDates>
export type TicketReductionsResponse = ApiResponse<TicketReduction[]>
export type StatLieuVenteDateResponse = ApiResponse<StatLieuVenteDate[]>
export type TempoEcranPoliceResponse = ApiResponse<TempoEcranPolice[]>
export type HebergementResponse = ApiResponse<Hebergement[]>
export type ArticleResponse = ApiResponse<Article[]>
export type TableResponse = ApiResponse<Table[]>
export type LogMajTpeResponse = ApiResponse<LogMajTpe[]>
export type ComptableResponse = ApiResponse<Comptable[]>
export type CategorieOperationMwResponse = ApiResponse<CategorieOperationMw[]>
export type GmCompletResponse = ApiResponse<GmComplet[]>
export type Table1037Response = ApiResponse<Table1037[]>
export type InitialisationResponse = ApiResponse<Initialisation[]>
export type BooAvailibleEmployeeResponse = ApiResponse<BooAvailibleEmployee[]>
export type ArcCcTotalResponse = ApiResponse<ArcCcTotal[]>