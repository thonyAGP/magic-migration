```typescript
import type { ApiResponse } from "@/services/api/apiClient"

export interface MergeRequest {
  id: number
  sourceAccountId: number
  targetAccountId: number
  status: 'pending' | 'validated' | 'rejected' | 'completed'
  validatedBy: string | null
  validatedAt: Date | null
  chronoCode: string
}

export interface MergeHistory {
  id: number
  mergeRequestId: number
  timestamp: Date
  operation: string
  details: string | null
}

export interface MergeLog {
  id: number
  mergeId: number
  operation: string
  tableName: string
  recordCount: number
  timestamp: Date
  success: boolean
}

export interface Account {
  id: number
  status: 'active' | 'inactive' | 'suspended'
  balance: number
  clientName: string | null
  linkedAccounts: number | null
}

export interface ValidationStatus {
  network: boolean
  closure: boolean
  validation: string
}

export interface HistoFusionSeparationSaisie {
  id: number
  fusionId: number
  typeOperation: 'fusion' | 'separation'
  saisieDate: Date
  operateur: string
  details: string
}

export interface GmRecherche {
  id: number
  codeRecherche: string
  criteres: string
  resultats: number
  dateCreation: Date
} // RM-30

export interface DepotGarantie {
  id: number
  compteId: number
  montant: number
  dateDepot: Date
  statut: 'actif' | 'libere' | 'bloque'
  reference: string
} // RM-39

export interface CompteGm {
  id: number
  numeroCompte: string
  typeCompte: string
  solde: number
  dateOuverture: Date
  statut: 'ouvert' | 'ferme' | 'suspendu'
} // RM-47

export interface ReseauCloture {
  id: number
  reseauId: number
  dateCloture: Date
  motif: string
  validePar: string
  statut: 'en_cours' | 'complete' | 'annule'
} // RM-23

export interface FusionEclatement {
  id: number
  typeOperation: 'fusion' | 'eclatement'
  compteSource: number
  compteCible: number
  dateOperation: Date
  statut: 'prepare' | 'execute' | 'complete'
} // RM-51

export interface Prestations {
  id: number
  codePrestation: string
  libelle: string
  tarif: number
  dateApplication: Date
  actif: boolean
} // RM-33

export interface PvCustomerDat {
  id: number
  customerId: number
  customerData: string
  dateCreation: Date
  typeData: string
  statut: 'actif' | 'archive'
} // RM-837

export interface MvtPrestation {
  id: number
  prestationId: number
  typeMouvement: 'entree' | 'sortie' | 'modification'
  dateMouvement: Date
  quantite: number
  montant: number
  reference: string
} // RM-46

export interface Gratuites {
  id: number
  prestationId: number
  compteId: number
  dateGratuite: Date
  montantGratuite: number
  motif: string
  autorisePar: string
} // RM-79

export interface PersonnelGo {
  id: number
  personnelId: string
  nom: string
  prenom: string
  poste: string
  dateEmbauche: Date
  statut: 'actif' | 'inactif' | 'suspendu'
  departement: string
  droitsAcces: string
  superviseur: string | null
} // RM-35

export interface FichierValidation {
  id: number
  nomFichier: string
  typeFichier: string
  taille: number
  dateUpload: Date
  statut: 'valide' | 'erreur' | 'en_attente'
  nombreLignes: number
}

export interface CommentaireGm {
  id: number
  compteId: number
  commentaire: string
  dateCreation: Date
  auteur: string
  typeCommentaire: 'info' | 'alerte' | 'note'
}

export interface CommentaireGmAcc {
  id: number
  compteId: number
  commentaireAccueil: string
  dateCreation: Date
  auteur: string
  priorite: 'normale' | 'haute' | 'urgente'
  statut: 'actif' | 'archive'
  typeAccueil: 'reception' | 'concierge' | 'service'
} // RM-37

export interface ImportGoErreurAffection {
  id: number
  numeroLigne: number
  codeErreur: string
  messageErreur: string
  valeurErronee: string
  dateImport: Date
  statut: 'non_traite' | 'corrige' | 'ignore'
}

export interface FichierHistotel {
  id: number
  nomFichier: string
  dateTraitement: Date
  nombreReservations: number
  statut: 'traite' | 'en_cours' | 'erreur'
  versionHistotel: string
} // RM-137

export interface TpeParTerminal {
  id: number
  terminalId: string
  tpeId: string
  dateAssociation: Date
  statut: 'actif' | 'inactif'
  configuration: string
} // RM-834

export interface VenteParMoyenPaiement {
  id: number
  venteId: number
  moyenPaiement: string
  montant: number
  dateTransaction: Date
  numeroTransaction: string
  statut: 'valide' | 'annule' | 'rembourse'
} // RM-805

export interface ComptableCte {
  id: number
  codeComptable: string
  libelle: string
  typeCompte: 'actif' | 'passif' | 'charge' | 'produit'
  solde: number
  dateCreation: Date
  compteParent: string | null
  niveauCompte: number
} // RM-40

export interface PlafondLit {
  id: number
  categorieLogement: string
  nombreLitsMax: number
  dateApplication: Date
  saisonId: number
  tarifSupplement: number
} // RM-807

export interface EzCard {
  id: number
  numeroCard: string
  typeCard: string
  dateEmission: Date
  dateExpiration: Date
  statut: 'active' | 'inactive' | 'bloquee'
  solde: number
} // RM-312

export interface GmCompletGmc {
  id: number
  compteId: number
  donneesCompletes: string
  dateGeneration: Date
  versionGm: string
  statut: 'actuel' | 'archive'
  tailleDonnees: number
  formatExport: string
} // RM-31

export interface QualiteAvantReprise {
  id: number
  referenceQualite: string
  typeControle: string
  dateControle: Date
  resultat: 'conforme' | 'non_conforme' | 'a_verifier'
  commentaire: string
  controleurId: string
} // RM-786

export interface FichierMessagerie {
  id: number
  nomFichier: string
  typeFichier: string
  tailleFichier: number
  dateReception: Date
  expediteur: string
  statut: 'recu' | 'traite' | 'erreur'
  contenuMessage: string
} // RM-123

export interface ChangeVenteChg {
  id: number
  venteId: number
  tauxChange: number
  deviseSource: string
  deviseCible: string
  montantSource: number
  montantCible: number
  dateChange: Date
  commission: number
  numeroOperation: string
} // RM-147

export interface CodesAutocomAut {
  id: number
  codeAutocom: string
  libelle: string
  categorie: string
  actif: boolean
  dateCreation: Date
  parametres: string
  priorite: number
} // RM-80

export interface ChangeChg {
  id: number
  typeOperation: 'achat' | 'vente'
  deviseSource: string
  deviseCible: string
  tauxChange: number
  montant: number
  dateOperation: Date
  compteId: number
  numeroTransaction: string
  commission: number
} // RM-44

export interface VenteVep {
  id: number
  numeroVente: string
  dateVente: Date
  montantTotal: number
  compteClient: number
  vendeurId: string
  statut: 'en_cours' | 'validee' | 'annulee'
  moyenPaiement: string
  taxe: number
  remise: number
} // RM-309

export interface TransacEnteteBar {
  id: number
  numeroTransaction: string
  dateTransaction: Date
  montantTotal: number
  nombreArticles: number
  caissierId: string
  statut: 'ouverte' | 'fermee' | 'annulee'
  typeTransaction: 'vente' | 'remboursement'
} // RM-15

export interface VenteOptionVeo {
  id: number
  venteId: number
  optionId: string
  libelleOption: string
  prixOption: number
  quantite: number
  montantTotal: number
  dateAjout: Date
  typeOption: string
  obligatoire: boolean
} // RM-307

export interface DepotObjetsDoa {
  id: number
  numeroDepot: string
  clientId: number
  dateDepot: Date
  dateRetrait: Date | null
  description: string
  valeurEstimee: number
  statut: 'depose' | 'retire' | 'perdu'
  responsableId: string
  emplacementDepot: string
} // RM-41

export interface HeureDePassage {
  id: number
  passageId: string
  heureDebut: Date
  heureFin: Date
  typePassage: 'entree' | 'sortie' | 'transit'
  zoneId: number
  compteId: number
  statut: 'valide' | 'invalide'
} // RM-463

export interface Table947 {
  id: number
  referenceTable: string
  donneesTable: string
  dateCreation: Date
  typeEnregistrement: string
  statut: 'actif' | 'archive'
  metadonnees: string
} // RM-947

export interface HebergementHeb {
  id: number
  codeHebergement: string
  typeHebergement: string
  capacite: number
  dateOuverture: Date
  statut: 'disponible' | 'occupe' | 'maintenance'
  tarif: number
  services: string
} // RM-34

export interface HebCircuitHci {
  id: number
  hebergementId: number
  circuitId: string
  ordre: number
  dureeEtape: number
  dateDebut: Date
  dateFin: Date
  statut: 'programme' | 'en_cours' | 'termine'
} // RM-168

export interface CcTotalParType {
  id: number
  typeTransaction: string
  montantTotal: number
  nombreTransactions: number
  dateCalcul: Date
  periodeDebut: Date
  periodeFin: Date
  statut: 'calcule' | 'valide'
} // RM-268

export interface CcTypeDetail {
  id: number
  typeId: number
  codeDetail: string
  libelleDetail: string
  montant: number
  quantite: number
  dateTransaction: Date
  reference: string
} // RM-272

export interface LignesDeSoldeSld {
  id: number
  compteId: number
  typeLigne: 'debit' | 'credit' | 'solde'
  montant: number
  dateLigne: Date
  libelle: string
  reference: string
  statut: 'provisoire' | 'definitif'
} // RM-48

export interface CcTotal {
  id: number
  totalGeneral: number
  nombreOperations: number
  dateCalcul: Date
  periodeDebut: Date
  periodeFin: Date
  typeTotal: 'journalier' | 'hebdomadaire' | 'mensuel'
  statut: 'provisoire' | 'definitif'
} // RM-271

export interface ParticipantsPar {
  id: number
  participantId: string
  nom: string
  prenom: string
  dateNaissance: Date
  typeParticipant: 'adulte' | 'enfant' | 'accompagnant'
  circuitId: string
  statut: 'inscrit' | 'confirme' | 'annule'
} // RM-298

export interface VoyagesVoy {
  id: number
  codeVoyage: string
  destination: string
  dateDepart: Date
  dateRetour: Date
  nombreParticipants: number
  prixBase: number
  statut: 'programme' | 'confirme' | 'annule' | 'complete'
  typeVoyage: 'circuit' | 'sejour' | 'croisiere'
} // RM-29

export interface BlDetail {
  id: number
  blId: string
  numeroLigne: number
  articleId: string
  quantite: number
  prixUnitaire: number
  montantTotal: number
  dateCreation: Date
  statut: 'valide' | 'annule'
} // RM-19

export interface ComptableGratuite {
  id: number
  compteComptable: string
  typeGratuite: string
  montantGratuite: number
  dateApplication: Date
  motif: string
  autorisePar: string
  statut: 'active' | 'inactive'
} // RM-38

export interface ImportMod {
  id: number
  nomModule: string
  versionModule: string
  dateImport: Date
  fichierSource: string
  statut: 'importe' | 'erreur' | 'en_cours'
  nombreEnregistrements: number
  parametres: string
} // RM-358

export interface DepotDevisesDda {
  id: number
  compteId: number
  typeDevise: string
  montantDepot: number
  tauxChange: number
  dateDepot: Date
  dateEcheance: Date
  statut: 'actif' | 'echu' | 'annule'
  reference: string
} // RM-42

export interface PmsPrintParam {
  id: number
  parametreName: string
  parametreValue: string
  typeParametre: 'impression' | 'format' | 'config'
  dateModification: Date
  utilisateurModification: string
  actif: boolean
  description: string
} // RM-366

export interface DetailsParticiDpa {
  id: number
  participantId: string
  detailType: string
  valeurDetail: string
  dateCreation: Date
  dateModification: Date | null
  statut: 'actif' | 'archive'
  commentaire: string
} // RM-301

export interface SoldeDevisesSda {
  id: number
  compteId: number
  typeDevise: string
  soldeActuel: number
  soldePrecedent: number
  dateCalcul: Date
  mouvementPeriode: number
  statut: 'calcule' | 'valide' | 'corrige'
} // RM-43

export interface PvDiscountReasons {
  id: number
  codeRaison: string
  libelleRaison: string
  typeRemise: 'pourcentage' | 'montant'
  valeurRemise: number
  dateCreation: Date
  actif: boolean
  restrictions: string
} // RM-382

export interface CommentaireCom {
  id: number
  typeCommentaire: string
  contenuCommentaire: string
  dateCreation: Date
  auteur: string
  referenceObjet: string
  priorite: 'normale' | 'haute' | 'urgente'
  statut: 'ouvert' | 'ferme' | 'archive'
} // RM-171

export interface Email {
  id: number
  expediteur: string
  destinataire: string
  sujet: string
  contenu: string
  dateEnvoi: Date
  dateReception: Date | null
  statut: 'envoye' | 'recu' | 'lu' | 'archive'
  pieceJointe: boolean
} // RM-285

export interface ValeurCreditBarDefaut {
  id: number
  codeCredit: string
  valeurDefaut: number
  typeCredit: 'bar' | 'restaurant' | 'boutique'
  dateApplication: Date
  actif: boolean
  limiteTarifaire: number
  description: string
} // RM-804

export interface ClientGm {
  id: number
  clientId: string
  codeClient: string
  nom: string
  prenom: string
  dateNaissance: Date
  adresse: string
  telephone: string
  email: string
  statut: 'actif' | 'inactif' | 'suspendu'
  dateInscription: Date
} // RM-36

export interface VendeursVen {
  id: number
  vendeurId: string
  nom: string
  prenom: string
  codeVendeur: string
  commission: number
  typeVente: string
  secteur: string
  dateEmbauche: Date
  statut: 'actif' | 'inactif' | 'conge'
} // RM-93

export interface Table1059 {
  id: number
  referenceData: string
  typeData: string
  valeurData: string
  dateCreation: Date
  dateModification: Date | null
  parametres: string
  statut: 'actif' | 'archive'
  metadonnees: string
} // RM-1059

export interface TronconTro {
  id: number
  codeTroncon: string
  nomTroncon: string
  typeTransport: 'avion' | 'train' | 'bus' | 'bateau'
  villeDeparture: string
  villeArrivee: string
  dureeTrajet: number
  distanceKm: number
  actif: boolean
  compagnieTransport: string
} // RM-167

export interface HistoFusionSeparationLog {
  id: number
  operationId: string
  typeOperation: 'fusion' | 'separation'
  dateOperation: Date
  utilisateur: string
  compteSource: string
  compteCible: string
  statut: 'initie' | 'en_cours' | 'complete' | 'erreur'
  detailsOperation: string
  resultat: string | null
} // RM-342

export interface DateComptableDat {
  id: number
  dateComptable: Date
  exerciceComptable: string
  statut: 'ouvert' | 'ferme' | 'cloture'
  typeExercice: 'mensuel' | 'trimestriel' | 'annuel'
  dateOuverture: Date
  dateCloture: Date | null
  responsable: string
} // RM-70

export interface AccountMergeState {
  mergeRequest: MergeRequest | null
  sourceAccount: Account | null
  targetAccount: Account | null
  mergeHistory: MergeHistory[]
  mergeLogs: MergeLog[]
  validationStatus: ValidationStatus | null
  currentStep: 'validation' | 'preparation' | 'execution' | 'completion'
  isProcessing: boolean
  error: string | null
  progressData: { current: number; total: number; table: string }
  histoFusionSeparation: HistoFusionSeparationSaisie[] // RM-343
  gmRecherche: GmRecherche[] // RM-30
  depotGarantie: DepotGarantie[] // RM-39
  compteGm: CompteGm[] // RM-47
  reseauCloture: ReseauCloture[] // RM-23
  fusionEclatement: FusionEclatement[] // RM-51
  prestations: Prestations[] // RM-33
  pvCustomerDat: PvCustomerDat[] // RM-837
  mvtPrestation: MvtPrestation[] // RM-46
  gratuites: Gratuites[] // RM-79
  personnelGo: PersonnelGo[] // RM-35
  fichierValidation: FichierValidation[] // RM-131
  commentaireGm: CommentaireGm[] // RM-37
  commentaireGmAcc: CommentaireGmAcc[] // RM-37
  importGoErreur: ImportGoErreurAffection[] // RM-831
  fichierHistotel: FichierHistotel[] // RM-137
  tpeParTerminal: TpeParTerminal[] // RM-834
  venteParMoyenPaiement: VenteParMoyenPaiement[] // RM-805
  comptableCte: ComptableCte[] // RM-40
  plafondLit: PlafondLit[] // RM-807
  ezCard: EzCard[] // RM-312
  gmCompletGmc: GmCompletGmc[] // RM-31
  qualiteAvantReprise: QualiteAvantReprise[] // RM-786
  fichierMessagerie: FichierMessagerie[] // RM-123
  changeVenteChg: ChangeVenteChg[] // RM-147
  codesAutocomAut: CodesAutocomAut[] // RM-80
  changeChg: ChangeChg[] // RM-44
  venteVep: VenteVep[] // RM-309
  transacEnteteBar: TransacEnteteBar[] // RM-15
  venteOptionVeo: VenteOptionVeo[] // RM-307
  depotObjetsDoa: DepotObjetsDoa[] // RM-41
  heureDePassage: HeureDePassage[] // RM-463
  table947: Table947[] // RM-947
  hebergementHeb: HebergementHeb[] // RM-34
  hebCircuitHci: HebCircuitHci[] // RM-168
  ccTotalParType: CcTotalParType[] // RM-268
  ccTypeDetail: CcTypeDetail[] // RM-272
  lignesDeSoldeSld: LignesDeSoldeSld[] // RM-48
  ccTotal: CcTotal[] // RM-271
  participantsPar: ParticipantsPar[] // RM-298
  voyagesVoy: VoyagesVoy[] // RM-29
  blDetail: BlDetail[] // RM-19
  comptableGratuite: ComptableGratuite[] // RM-38
  importMod: ImportMod[] // RM-358
  depotDevisesDda: DepotDevisesDda[] // RM-42
  pmsPrintParam: PmsPrintParam[] // RM-366
  detailsParticiDpa: DetailsParticiDpa[] // RM-301
  soldeDevisesSda: SoldeDevisesSda[] // RM-43
  pvDiscountReasons: PvDiscountReasons[] // RM-382
  commentaireCom: CommentaireCom[] // RM-171
  email: Email[] // RM-285
  valeurCreditBarDefaut: ValeurCreditBarDefaut[] // RM-804
  clientGm: ClientGm[] // RM-36
  vendeursVen: VendeursVen[] // RM-93
  table1059: Table1059[] // RM-1059
  tronconTro: TronconTro[] // RM-167
  histoFusionSeparationLog: HistoFusionSeparationLog[] // RM-342
  dateComptableDat: DateComptableDat[] // RM-70
}

export type ApiValidationRequest = ApiResponse<ValidationStatus>

export type ApiAccountLoadRequest = ApiResponse<{
  source: Account
  target: Account
}>

export type ApiMergeExecuteRequest = ApiResponse<MergeRequest>

export type ApiMergeHistoryRequest = ApiResponse<MergeHistory[]>

export type ApiMergeLogRequest = ApiResponse<MergeLog[]>

export type ApiHistoFusionSeparationRequest = ApiResponse<HistoFusionSeparationSaisie[]> // RM-343

export type ApiGmRechercheRequest = ApiResponse<GmRecherche[]> // RM-30

export type ApiDepotGarantieRequest = ApiResponse<DepotGarantie[]> // RM-39

export type ApiCompteGmRequest = ApiResponse<CompteGm[]> // RM-47

export type ApiReseauClotureRequest = ApiResponse<ReseauCloture[]> // RM-23

export type ApiFusionEclatementRequest = ApiResponse<FusionEclatement[]> // RM-51

export type ApiPrestationsRequest = ApiResponse<Prestations[]> // RM-33

export type ApiPvCustomerDatRequest = ApiResponse<PvCustomerDat[]> // RM-837

export type ApiMvtPrestationRequest = ApiResponse<MvtPrestation[]> // RM-46

export type ApiGratuitesRequest = ApiResponse<Gratuites[]> // RM-79

export type ApiPersonnelGoRequest = ApiResponse<PersonnelGo[]> // RM-35

export type ApiFichierValidationRequest = ApiResponse<FichierValidation[]> // RM-131

export type ApiCommentaireGmRequest = ApiResponse<CommentaireGm[]> // RM-37

export type ApiCommentaireGmAccRequest = ApiResponse<CommentaireGmAcc[]> // RM-37

export type ApiImportGoErreurRequest = ApiResponse<ImportGoErreurAffection[]> // RM-831

export type ApiFichierHistotelRequest = ApiResponse<FichierHistotel[]> // RM-137

export type ApiTpeParTerminalRequest = ApiResponse<TpeParTerminal[]> // RM-834

export type ApiVenteParMoyenPaiementRequest = ApiResponse<VenteParMoyenPaiement[]> // RM-805

export type ApiComptableCteRequest = ApiResponse<ComptableCte[]> // RM-40

export type ApiPlafondLitRequest = ApiResponse<PlafondLit[]> // RM-807

export type ApiEzCardRequest = ApiResponse<EzCard[]> // RM-312

export type ApiGmCompletGmcRequest = ApiResponse<GmCompletGmc[]> // RM-31

export type ApiQualiteAvantRepriseRequest = ApiResponse<QualiteAvantReprise[]> // RM-786

export type ApiFichierMessagerieRequest = ApiResponse<FichierMessagerie[]> // RM-123

export type ApiChangeVenteChgRequest = ApiResponse<ChangeVenteChg[]> // RM-147

export type ApiCodesAutocomAutRequest = ApiResponse<CodesAutocomAut[]> // RM-80

export type ApiChangeChgRequest = ApiResponse<ChangeChg[]> // RM-44

export type ApiVenteVepRequest = ApiResponse<VenteVep[]> // RM-309

export type ApiTransacEnteteBarRequest = ApiResponse<TransacEnteteBar[]> // RM-15

export type ApiVenteOptionVeoRequest = ApiResponse<VenteOptionVeo[]> // RM-307

export type ApiDepotObjetsDoaRequest = ApiResponse<DepotObjetsDoa[]> // RM-41

export type ApiHeureDePassageRequest = ApiResponse<HeureDePassage[]> // RM-463

export type ApiTable947Request = ApiResponse<Table947[]> // RM-947

export type ApiHebergementHebRequest = ApiResponse<HebergementHeb[]> // RM-34

export type ApiHebCircuitHciRequest = ApiResponse<HebCircuitHci[]> // RM-168

export type ApiCcTotalParTypeRequest = ApiResponse<CcTotalParType[]> // RM-268

export type ApiCcTypeDetailRequest = ApiResponse<CcTypeDetail[]> // RM-272

export type ApiLignesDeSoldeSldRequest = ApiResponse<LignesDeSoldeSld[]> // RM-48

export type ApiCcTotalRequest = ApiResponse<CcTotal[]> // RM-271

export type ApiParticipantsParRequest = ApiResponse<ParticipantsPar[]> // RM-298

export type ApiVoyagesVoyRequest = ApiResponse<VoyagesVoy[]> // RM-29

export type ApiBlDetailRequest = ApiResponse<BlDetail[]> // RM-19

export type ApiComptableGratuiteRequest = ApiResponse<ComptableGratuite[]> // RM-38

export type ApiImportModRequest = ApiResponse<ImportMod[]> // RM-358

export type ApiDepotDevisesDdaRequest = ApiResponse<DepotDevisesDda[]> // RM-42

export type ApiPmsPrintParamRequest = ApiResponse<PmsPrintParam[]> // RM-366

export type ApiDetailsParticiDpaRequest = ApiResponse<DetailsParticiDpa[]> // RM-301

export type ApiSoldeDevisesSdaRequest = ApiResponse<SoldeDevisesSda[]> // RM-43

export type ApiPvDiscountReasonsRequest = ApiResponse<PvDiscountReasons[]> // RM-382

export type ApiCommentaireComRequest = ApiResponse<CommentaireCom[]> // RM-171

export type ApiEmailRequest = ApiResponse<Email[]> // RM-285

export type ApiValeurCreditBarDefautRequest = ApiResponse<ValeurCreditBarDefaut[]> // RM-804

export type ApiClientGmRequest = ApiResponse<ClientGm[]> // RM-36

export type ApiVendeursVenRequest = ApiResponse<VendeursVen[]> // RM-93

export type ApiTable1059Request = ApiResponse<Table1059[]> // RM-1059

export type ApiTronconTroRequest = ApiResponse<TronconTro[]> // RM-167

export type ApiHistoFusionSeparationLogRequest = ApiResponse<HistoFusionSeparationLog[]> // RM-342

export type ApiDateComptableDatRequest = ApiResponse<DateComptableDat[]> // RM-70

export const MERGE_STATUSES = {
  PENDING: 'pending',
  VALIDATED: 'validated',
  REJECTED: 'rejected',
  COMPLETED: 'completed'
} as const

export const MERGE_STEPS = {
  VALIDATION: 'validation',
  PREPARATION: 'preparation', 
  EXECUTION: 'execution',
  COMPLETION: 'completion'
} as const

export const TABLE_NAMES = {