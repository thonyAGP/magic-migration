import type { ApiResponse } from "@/services/api/apiClient";

export interface MergeHistory {
  id: number;
  sourceAccount: string;
  targetAccount: string;
  mergeDate: Date;
  operator: string;
  status: string;
}

export interface Account {
  accountNumber: string;
  balance: number;
  status: string;
  createdDate: Date;
}

export interface MergeValidation {
  isClosureInProgress: boolean;
  networkStatus: string;
  validationStatus: string;
}

export interface AccountMergeState {
  mergeHistories: MergeHistory[];
  sourceAccount: Account | null;
  targetAccount: Account | null;
  validationState: MergeValidation | null;
  isLoading: boolean;
  error: string | null;
  mergeProgress: number;
  currentStep: string;
}

export interface AccountMergeActions {
  validateMergeConditions(sourceAccountId: string, targetAccountId: string): Promise<void>;
  executeMerge(sourceAccountId: string, targetAccountId: string): Promise<void>;
  createMergeHistory(sourceAccount: string, targetAccount: string, operator: string): Promise<void>;
  rollbackMerge(mergeHistoryId: number): Promise<void>;
  printMergeTicket(mergeHistoryId: number): Promise<void>;
}

export interface ValidateMergeRequest {
  sourceAccountId: string;
  targetAccountId: string;
}

export type ValidateMergeResponse = ApiResponse<MergeValidation>;

export interface ExecuteMergeRequest {
  sourceAccountId: string;
  targetAccountId: string;
}

export type ExecuteMergeResponse = ApiResponse<MergeHistory>;

export interface FetchMergeHistoryRequest {
  accountId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export type FetchMergeHistoryResponse = ApiResponse<MergeHistory[]>;

export interface RollbackMergeRequest {
  mergeHistoryId: number;
}

export type RollbackMergeResponse = ApiResponse<void>;

export interface PrintMergeTicketRequest {
  mergeHistoryId: number;
}

export type PrintMergeTicketResponse = ApiResponse<void>;

export interface HistoFusionSeparationSaisie {
  id: number;
  accountId: string;
  operationType: "FUSION" | "SEPARATION";
  inputDate: Date;
  operator: string;
  status: string;
  data: Record<string, unknown>;
}

export interface GmRecherche {
  id: number;
  searchCriteria: string;
  searchDate: Date;
  resultCount: number;
  userId: string;
}

export interface DepotGarantie {
  id: number;
  accountId: string;
  depositAmount: number;
  depositDate: Date;
  status: string;
  expirationDate?: Date;
  deletionDate?: Date;
}

export interface HistoFusionSeparation {
  id: number;
  sourceAccountId: string;
  targetAccountId: string;
  operationType: "FUSION" | "SEPARATION";
  operationDate: Date;
  operator: string;
  status: string;
  reversalDate?: Date;
  validated: boolean;
}

export interface HistoFusionSeparationLog {
  id: number;
  fusionSeparationId: number;
  operationType: "FUSION" | "SEPARATION";
  logDate: Date;
  logLevel: "INFO" | "WARNING" | "ERROR" | "DEBUG";
  logMessage: string;
  operationStep?: string;
  accountIdSource?: string;
  accountIdTarget?: string;
  operator: string;
  errorCode?: string;
  stackTrace?: string;
  additionalData?: Record<string, unknown>;
  sessionId?: string;
}

export interface CompteGm {
  accountId: string;
  accountNumber: string;
  balance: number;
  status: string;
  createdDate: Date;
  lastModifiedDate: Date;
  networkId?: string;
  closureStatus?: string;
  filiationStatus?: string;
}

export interface ReseauCloture {
  id: number;
  networkId: string;
  closureStartDate: Date;
  closureEndDate?: Date;
  status: "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  operator: string;
}

export interface FusionEclatement {
  id: number;
  fusionId: number;
  accountId: string;
  splitType: string;
  splitDate: Date;
  amount?: number;
  status: string;
  validated: boolean;
}

export interface Prestation {
  id: number;
  accountId: string;
  prestationType: string;
  amount: number;
  prestationDate: Date;
  status: string;
  description?: string;
  transferredToAccount?: string;
}

export interface FichierValidation {
  id: number;
  fileName: string;
  validationDate: Date;
  validationStatus: "PENDING" | "VALIDATED" | "REJECTED";
  validator?: string;
  errors?: string[];
  relatedEntityType?: string;
  relatedEntityId?: string;
}

export interface CommentaireGm {
  id: number;
  accountId: string;
  comment: string;
  commentDate: Date;
  userId: string;
  category?: string;
  relatedOperation?: string;
}

export interface ImportGoErreurAffection {
  id: number;
  importId: string;
  errorCode: string;
  errorMessage: string;
  affectedEntityType: string;
  affectedEntityId: string;
  importDate: Date;
  resolved: boolean;
  severity?: string;
}

export interface PvCustomerData {
  id: number;
  customerId: string;
  customerData: Record<string, unknown>;
  processDate: Date;
  status: string;
  batchId?: string;
  sessionId?: string;
}

export interface MvtPrestation {
  id: number;
  prestationId: number;
  accountId: string;
  movementType: string;
  movementDate: Date;
  amount: number;
  sourceAccount?: string;
  targetAccount?: string;
  status: string;
  description?: string;
  operator?: string;
}

export interface Gratuites {
  id: number;
  accountId: string;
  gratuitType: string;
  amount: number;
  gratuitDate: Date;
  expirationDate?: Date;
  status: string;
  description?: string;
  createdBy: string;
  transferredToAccount?: string;
}

export interface FichierHistotel {
  id: number;
  accountId: string;
  histotelData: Record<string, unknown>;
  recordDate: Date;
  status: string;
  operator?: string;
  mergeRelated: boolean;
}

export interface TpeParTerminal {
  id: number;
  terminalId: string;
  tpeType: string;
  status: string;
  installationDate: Date;
  lastTransactionDate?: Date;
  locationCode?: string;
  commission?: number;
}

export interface VenteParMoyenPaiement {
  id: number;
  accountId: string;
  paymentMethod: string;
  saleAmount: number;
  saleDate: Date;
  transactionId?: string;
  status: string;
  terminalId?: string;
  validated: boolean;
}

export interface ComptableCompte {
  id: number;
  accountNumber: string;
  accountType: string;
  balance: number;
  currency: string;
  status: string;
  openingDate: Date;
  closingDate?: Date;
  relatedAccountId?: string;
}

export interface PlafondLit {
  id: number;
  roomId: string;
  bedLimit: number;
  effectiveDate: Date;
  expirationDate?: Date;
  status: string;
  overrideReason?: string;
  operator?: string;
}

export interface EzCard {
  id: number;
  cardNumber: string;
  accountId: string;
  issueDate: Date;
  expirationDate?: Date;
  status: string;
  balance: number;
  lastUsedDate?: Date;
  transferredToCard?: string;
}

export interface GmComplet {
  id: number;
  accountId: string;
  completeData: Record<string, unknown>;
  lastSyncDate: Date;
  status: string;
  validationStatus: string;
  operator?: string;
}

export interface PersonnelGo {
  id: number;
  goId: string;
  firstName: string;
  lastName: string;
  position: string;
  status: string;
  hireDate: Date;
  departureDate?: Date;
  assignedAccountId?: string;
}

export interface QualiteAvantReprise {
  id: number;
  accountId: string;
  qualityLevel: string;
  assessmentDate: Date;
  assessor: string;
  notes?: string;
  score?: number;
  reprisePlanned: boolean;
  repriseDate?: Date;
}

export interface FichierMessagerie {
  id: number;
  messageId: string;
  accountId?: string;
  messageType: string;
  subject: string;
  messageDate: Date;
  sender: string;
  recipient: string;
  status: string;
  content?: string;
  attachments?: string[];
}

export interface ChangeVente {
  id: number;
  accountId: string;
  saleId: string;
  changeType: string;
  changeDate: Date;
  originalAmount: number;
  newAmount: number;
  operator: string;
  status: string;
  reason?: string;
  validated: boolean;
}

export interface CodesAutocom {
  id: number;
  code: string;
  category: string;
  description: string;
  value: string;
  effectiveDate: Date;
  expirationDate?: Date;
  status: string;
  displayOrder?: number;
}

export interface Change {
  id: number;
  accountId: string;
  exchangeDate: Date;
  fromCurrency: string;
  toCurrency: string;
  fromAmount: number;
  toAmount: number;
  exchangeRate: number;
  commission: number;
  operator: string;
  status: string;
  transactionId?: string;
}

export interface CcComptable {
  id: number;
  accountNumber: string;
  accountId: string;
  entryDate: Date;
  entryType: string;
  debitAmount: number;
  creditAmount: number;
  balance: number;
  description?: string;
  operator: string;
  validated: boolean;
  validationDate?: Date;
  fiscalPeriod?: string;
}

export interface Vente {
  id: number;
  accountId: string;
  saleDate: Date;
  saleType: string;
  totalAmount: number;
  taxAmount: number;
  netAmount: number;
  paymentMethod: string;
  status: string;
  terminalId?: string;
  operator: string;
  invoiceNumber?: string;
  cancelled: boolean;
  cancellationDate?: Date;
}

export interface TransacEnteteBar {
  id: number;
  transactionId: string;
  accountId: string;
  transactionDate: Date;
  barLocation: string;
  totalAmount: number;
  taxAmount: number;
  status: string;
  operator: string;
  sessionId?: string;
  validated: boolean;
  validationDate?: Date;
}

export interface VenteOption {
  id: number;
  saleId: number;
  optionType: string;
  optionCode: string;
  optionValue: string;
  optionPrice: number;
  quantity: number;
  status: string;
  addedDate: Date;
  operator?: string;
}

export interface DepotObjets {
  id: number;
  accountId: string;
  depositDate: Date;
  objectDescription: string;
  objectType: string;
  quantity: number;
  estimatedValue?: number;
  storageLocation: string;
  status: string;
  retrievalDate?: Date;
  operator: string;
  notes?: string;
}

export interface HeureDePassage {
  id: number;
  accountId: string;
  passageDate: Date;
  passageTime: string;
  location: string;
  direction: "IN" | "OUT";
  activityType?: string;
  operator?: string;
  validated: boolean;
  notes?: string;
}

export interface Table947 {
  id: number;
  entityId: string;
  entityType: string;
  recordData: Record<string, unknown>;
  recordDate: Date;
  status: string;
  operator?: string;
  relatedAccountId?: string;
}

export interface Table1059 {
  id: number;
  entityId: string;
  recordType: string;
  recordData: Record<string, unknown>;
  recordDate: Date;
  status: string;
  operator?: string;
  accountId?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
}

export interface Hebergement {
  id: number;
  accountId: string;
  roomNumber: string;
  roomType: string;
  checkInDate: Date;
  checkOutDate?: Date;
  numberOfGuests: number;
  status: string;
  rateCode?: string;
  dailyRate: number;
  totalAmount: number;
  operator?: string;
  notes?: string;
}

export interface HebCircuit {
  id: number;
  hebergementId: number;
  circuitCode: string;
  circuitType: string;
  circuitDate: Date;
  destination?: string;
  duration?: number;
  pricePerPerson: number;
  numberOfParticipants: number;
  status: string;
  operator?: string;
}

export interface CcTotalParType {
  id: number;
  accountId: string;
  typeCode: string;
  typeLabel: string;
  totalAmount: number;
  totalDate: Date;
  fiscalPeriod: string;
  numberOfTransactions: number;
  validated: boolean;
  validationDate?: Date;
  operator?: string;
}

export interface CcTypeDetail {
  id: number;
  ccTotalParTypeId: number;
  accountId: string;
  detailCode: string;
  detailLabel: string;
  amount: number;
  quantity: number;
  unitPrice: number;
  transactionDate: Date;
  status: string;
  operator?: string;
}

export interface LignesDeSolde {
  id: number;
  accountId: string;
  lineType: string;
  lineDate: Date;
  debitAmount: number;
  creditAmount: number;
  balance: number;
  description: string;
  referenceNumber?: string;
  validated: boolean;
  validationDate?: Date;
  fiscalPeriod?: string;
  operator?: string;
}

export interface CcTotal {
  id: number;
  accountId: string;
  totalDate: Date;
  totalDebit: number;
  totalCredit: number;
  balance: number;
  fiscalPeriod: string;
  numberOfLines: number;
  status: string;
  validated: boolean;
  validationDate?: Date;
  operator?: string;
}

export interface Participants {
  id: number;
  accountId: string;
  voyageId?: number;
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  passportNumber?: string;
  nationality?: string;
  participantType: string;
  registrationDate: Date;
  status: string;
  contactEmail?: string;
  contactPhone?: string;
  emergencyContact?: string;
  specialRequirements?: string;
}

export interface Voyages {
  id: number;
  accountId: string;
  voyageCode: string;
  destination: string;
  departureDate: Date;
  returnDate: Date;
  numberOfDays: number;
  numberOfNights: number;
  basePrice: number;
  status: string;
  travelAgent?: string;
  bookingDate: Date;
  confirmationNumber?: string;
  cancelled: boolean;
  cancellationDate?: Date;
  operator?: string;
}

export interface BlDetail {
  id: number;
  blNumber: string;
  accountId: string;
  lineNumber: number;
  itemCode: string;
  itemDescription: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxRate: number;
  taxAmount: number;
  lineDate: Date;
  status: string;
  operator?: string;
}

export interface ComptableGratuite {
  id: number;
  accountId: string;
  gratuitType: string;
  gratuitCode: string;
  amount: number;
  accountingDate: Date;
  accountNumber: string;
  fiscalPeriod: string;
  description?: string;
  approvedBy?: string;
  approvalDate?: Date;
  status: string;
  validated: boolean;
  validationDate?: Date;
  operator?: string;
}

export interface ImportMod {
  id: number;
  importId: string;
  moduleName: string;
  importDate: Date;
  importType: string;
  recordCount: number;
  status: string;
  errorCount?: number;
  successCount?: number;
  operator: string;
  completionDate?: Date;
  batchId?: string;
  sourceFile?: string;
}

export interface DepotDevises {
  id: number;
  accountId: string;
  currency: string;
  depositAmount: number;
  depositDate: Date;
  exchangeRate: number;
  localCurrencyAmount: number;
  status: string;
  operator: string;
  transactionId?: string;
  retrievalDate?: Date;
  notes?: string;
}

export interface PmsPrintParam {
  id: number;
  parameterId: string;
  parameterName: string;
  parameterValue: string;
  parameterType: string;
  effectiveDate: Date;
  expirationDate?: Date;
  printerId?: string;
  printerModel?: string;
  pageSize?: string;
  orientation?: string;
  copies?: number;
  status: string;
  operator?: string;
}

export interface DetailsPartici {
  id: number;
  participantId: number;
  accountId: string;
  detailType: string;
  detailValue: string;
  detailDate: Date;
  activityCode?: string;
  amount?: number;
  quantity?: number;
  status: string;
  operator?: string;
  notes?: string;
  validated: boolean;
}

export interface SoldeDevises {
  id: number;
  accountId: string;
  currency: string;
  balance: number;
  balanceDate: Date;
  lastMovementDate?: Date;
  lastMovementType?: string;
  status: string;
  localCurrencyEquivalent: number;
  exchangeRate: number;
  operator?: string;
}

export interface PvDiscountReasons {
  id: number;
  reasonCode: string;
  reasonLabel: string;
  reasonCategory: string;
  discountPercentage?: number;
  discountAmount?: number;
  maxDiscountAmount?: number;
  requiresApproval: boolean;
  approverLevel?: string;
  effectiveDate: Date;
  expirationDate?: Date;
  status: string;
  displayOrder?: number;
  notes?: string;
}

export interface Commentaire {
  id: number;
  entityType: string;
  entityId: string;
  commentText: string;
  commentDate: Date;
  commentType: string;
  userId: string;
  userName?: string;
  category?: string;
  priority?: string;
  status: string;
  parentCommentId?: number;
  attachments?: string[];
  visibility?: string;
}

export interface ValeurCreditBarDefaut {
  id: number;
  barLocationId: string;
  creditType: string;
  defaultCreditAmount: number;
  currency: string;
  effectiveDate: Date;
  expirationDate?: Date;
  clientCategory?: string;
  roomType?: string;
  packageCode?: string;
  minimumCreditAmount?: number;
  maximumCreditAmount?: number;
  status: string;
  operator?: string;
  notes?: string;
}

export interface ClientGm {
  id: number;
  clientId: string;
  accountNumber: string;
  clientType: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  dateOfBirth?: Date;
  nationality?: string;
  idDocumentType?: string;
  idDocumentNumber?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  phoneNumber?: string;
  mobileNumber?: string;
  email?: string;
  registrationDate: Date;
  lastVisitDate?: Date;
  status: string;
  vipStatus?: string;
  loyaltyProgram?: string;
  loyaltyPoints?: number;
  preferredLanguage?: string;
  marketingConsent: boolean;
  notes?: string;
}

export interface Vendeurs {
  id: number;
  vendorId: string;
  vendorCode: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  position: string;
  department?: string;
  hireDate: Date;
  departureDate?: Date;
  status: string;
  email?: string;
  phoneNumber?: string;
  commissionRate?: number;
  targetSales?: number;
  currentSales?: number;
  lastSaleDate?: Date;
  performanceRating?: string;
  supervisor?: string;
  notes?: string;
}

export interface Troncon {
  id: number;
  tronconCode: string;
  accountId?: string;
  segmentType: string;
  startDate: Date;
  endDate?: Date;
  description?: string;
  status: string;
  amount?: number;
  quantity?: number;
  operator?: string;
  parentTronconId?: number;
  validated: boolean;
  validationDate?: Date;
}

export interface DateComptable {
  id: number;
  comptableDate: Date;
  fiscalPeriod: string;
  fiscalYear: number;
  periodType: string;
  periodStartDate: Date;
  periodEndDate: Date;
  status: string;
  closureDate?: Date;
  closedBy?: string;
  validated: boolean;
  validationDate?: Date;
  notes?: string;
  operator?: string;
}

export interface BusinessRulesResult {
  [key: string]: {
    passed: boolean;
    description: string;
    status?: string;
  };
}

export const TABLE_NAMES = {
  GM_RECHERCHE: "gm-recherche_____gmr",
  DEPOT_GARANTIE: "depot_garantie___dga",
  COMPTE_GM: "compte_gm________cgm",
  RESEAU_CLOTURE: "reseau_cloture___rec",
  FUSION_ECLATEMENT: "fusion_eclatementfec",
  PRESTATIONS: "prestations______pre",
  COMMENTAIRE_GM: "commentaire_gm_________acc",
  PV_CUSTOMER_DATA: "##_pv_customer_dat",
  MVT_PRESTATION: "mvt_prestation___mpr",
  GRATUITES: "gratuites________gra",
  FICHIER_HISTOTEL: "fichier_histotel",
  TPE_PAR_TERMINAL: "tpe_par_terminal",
  VENTE_PAR_MOYEN_PAIEMENT: "vente_par_moyen_paiement",
  COMPTABLE_COMPTE: "comptable________cte",
  PLAFOND_LIT: "plafond_lit",
  EZ_CARD: "ez_card",
  GM_COMPLET: "gm-complet_______gmc",
  PERSONNEL_GO: "personnel_go______go",
  QUALITE_AVANT_REPRISE: "qualite_avant_reprise",
  FICHIER_MESSAGERIE: "fichier_messagerie",
  CHANGE_VENTE: "change_vente_____chg",
  CODES_AUTOCOM: "codes_autocom____aut",
  CHANGE: "change___________chg",
  CC_COMPTABLE: "cc_comptable",
  VENTE: "vente____________vep",
  TRANSAC_ENTETE_BAR: "transac_entete_bar",
  VENTE_OPTION: "vente_option_veo",
  DEPOT_OBJETS: "depot_objets_____doa",
  HEURE_DE_PASSAGE: "heure_de_passage",
  TABLE_947: "Table_947",
  TABLE_1059: "Table_1059",
  HEBERGEMENT: "hebergement______heb",
  HEB_CIRCUIT: "heb_circuit______hci",
  CC_TOTAL_PAR_TYPE: "cc_total_par_type",
  CC_TYPE_DETAIL: "cc_type_detail",
  LIGNES_DE_SOLDE: "lignes_de_solde__sld",
  CC_TOTAL: "cc_total",
  PARTICIPANTS: "participants_____par",
  VOYAGES: "voyages__________voy",
  BL_DETAIL: "bl_detail",
  COMPTABLE_GRATUITE: "comptable_gratuite",
  IMPORT_MOD: "import_mod",
  DEPOT_DEVISES: "depot_devises____dda",
  PMS_PRINT_PARAM: "pms_print_param",
  DETAILS_PARTICI: "details_partici__dpa",
  SOLDE_DEVISES: "solde_devises____sda",
  PV_DISCOUNT_REASONS: "pv_discount_reasons",
  COMMENTAIRE: "commentaire______com",
  VALEUR_CREDIT_BAR_DEFAUT: "valeur_credit_bar_defaut",
  CLIENT_GM: "client_gm",
  VENDEURS: "vendeurs_________ven",
  TRONCON: "troncon__________tro",
  HISTO_FUSION_SEPARATION_LOG: "histo__fusionseparation_log",
  DATE_COMPTABLE: "date_comptable___dat",
} as const;

export const ACCOUNT_MERGE_ACTIONS = {
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  SET_SOURCE_ACCOUNT: "SET_SOURCE_ACCOUNT",
  SET_TARGET_ACCOUNT: "SET_TARGET_ACCOUNT",
  SET_VALIDATION_STATE: "SET_VALIDATION_STATE",
  SET_MERGE_PROGRESS: "SET_MERGE_PROGRESS",
  SET_CURRENT_STEP: "SET_CURRENT_STEP",
  ADD_MERGE_HISTORY: "ADD_MERGE_HISTORY",
  FETCH_MERGE_HISTORIES: "FETCH_MERGE_HISTORIES",
  CLEAR_STATE: "CLEAR_STATE",
} as const;

export type AccountMergeActionType = typeof ACCOUNT_MERGE_ACTIONS[keyof typeof ACCOUNT_MERGE_ACTIONS];