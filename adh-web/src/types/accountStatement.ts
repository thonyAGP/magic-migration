import type { ApiResponse } from "@/services/api/apiClient"

// Table Interfaces
export interface LogMajTpe {
  id: number
  operation: string
  timestamp: Date
  memberCode: string
  printerNumber: number | null
  programId: string
  userId: string
}

export interface ComptableCte {
  id: number
  accountCode: string
  accountName: string
  accountType: string
  currency: string
  isActive: boolean
}

export interface GmCompletGmc {
  id: number
  memberCode: string
  memberName: string
  memberNumber: string
  memberStatus: string
  registrationDate: Date
}

export interface GmRechercheGmr {
  id: number
  searchKey: string
  memberCode: string
  searchType: string
  lastAccess: Date
}

export interface TypeLit {
  id: number
  bedTypeCode: string
  bedTypeName: string
  capacity: number
  category: string
}

export interface PvTva {
  id: number
  taxCode: string
  taxRate: number
  taxName: string
  countryCode: string
  isActive: boolean
}

export interface PvCustRentals {
  id: number
  memberCode: string
  rentalCode: string
  rentalDate: Date
  rentalAmount: number
  currency: string
}

export interface HebergementHeb {
  id: number
  accommodationCode: string
  accommodationName: string
  capacity: number
  bedTypeId: number
  priceCategory: string
}

export interface TablesTab {
  id: number
  tableCode: string
  tableName: string
  tableType: string
  configData: string
  isActive: boolean
  createdDate: Date
  modifiedDate: Date
} // RM-067

// Entity Interfaces
export interface AccountStatement {
  memberCode: string
  memberName: string
  memberNumber: string
  currency: string
  accountingPeriod: string
  printMask: string | null
  editionLabel: string | null
}

export interface AuditLog {
  id: number
  operation: string
  timestamp: Date
  memberCode: string
  printerNumber: number | null
}

// API Request/Response Types
export type AccountStatementResponse = ApiResponse<AccountStatement>
export type AuditLogResponse = ApiResponse<AuditLog[]>
export type LogMajTpeResponse = ApiResponse<LogMajTpe[]>
export type ComptableCteResponse = ApiResponse<ComptableCte[]>
export type GmCompletGmcResponse = ApiResponse<GmCompletGmc[]>
export type GmRechercheGmrResponse = ApiResponse<GmRechercheGmr[]>
export type TypeLitResponse = ApiResponse<TypeLit[]>
export type PvTvaResponse = ApiResponse<PvTva[]>
export type PvCustRentalsResponse = ApiResponse<PvCustRentals[]>
export type HebergementHebResponse = ApiResponse<HebergementHeb[]>
export type TablesTabResponse = ApiResponse<TablesTab[]> // RM-067

// Store State Interface
export interface AccountStatementState {
  accountStatements: AccountStatement[]
  auditLogs: AuditLog[]
  logMajTpe: LogMajTpe[]
  comptableCte: ComptableCte[]
  gmCompletGmc: GmCompletGmc[]
  gmRechercheGmr: GmRechercheGmr[]
  typeLit: TypeLit[]
  pvTva: PvTva[]
  pvCustRentals: PvCustRentals[]
  hebergementHeb: HebergementHeb[]
  tablesTab: TablesTab[] // RM-067
  isLoading: boolean
  error: string | null
  currentPrinter: number
  isDirectCall: boolean
  processingStatus: string
}

// Actions Interface
export interface AccountStatementActions {
  validatePrinter1(): Promise<boolean>
  validatePrinter6(): Promise<boolean>
  validatePrinter8(): Promise<boolean>
  validatePrinter9(): Promise<boolean>
  validateDirectCall(): Promise<boolean>
  generateAccountStatement(memberCode: string, printerNumber: number): Promise<AccountStatement>
  printStatementByName(memberCode: string, printerNumber: number): Promise<void>
  logPrintOperation(memberCode: string, printerNumber: number, operation: string): Promise<void>
  loadLogMajTpe(): Promise<LogMajTpe[]>
  loadComptableCte(): Promise<ComptableCte[]>
  loadGmCompletGmc(): Promise<GmCompletGmc[]>
  loadGmRechercheGmr(): Promise<GmRechercheGmr[]>
  loadTypeLit(): Promise<TypeLit[]>
  loadPvTva(): Promise<PvTva[]>
  loadPvCustRentals(): Promise<PvCustRentals[]>
  loadHebergementHeb(): Promise<HebergementHeb[]>
  loadTablesTab(): Promise<TablesTab[]> // RM-067
}