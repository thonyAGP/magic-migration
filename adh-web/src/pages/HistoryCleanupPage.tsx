import type { HistoFusionSeparationCriteria } from "@/types/historyCleanup"
import { useCallback, useEffect, useState } from "react"
import { ScreenLayout } from "@/components/layout"
import { Button, Dialog, Input } from "@/components/ui"
import { cn } from "@/lib/utils"
import { useHistoryCleanupStore } from "@/stores/historyCleanupStore"
import { useDataSourceStore } from "@/stores/dataSourceStore"

type ValidationStatus = "idle" | "valid" | "invalid"

// RM-001: Session context for implicit deletion criteria
interface SessionContext {
  sessionId?: string
  operationKey?: string
  fusionProcessId?: string
}

// RM-002: Audit log entry structure
interface AuditLogEntry {
  operation: "delete"
  table: "histo_Fus_Sep_Saisie"
  criteria: HistoFusionSeparationCriteria
  recordCount: number
  timestamp: string
  sessionId?: string
  userId?: string
}

// RM-003: Database constraint error types
const DB_CONSTRAINT_ERRORS = {
  FOREIGN_KEY_VIOLATION: "foreign_key_violation",
  CHECK_CONSTRAINT: "check_constraint_violation",
  UNIQUE_VIOLATION: "unique_violation"
} as const

type DbConstraintError = typeof DB_CONSTRAINT_ERRORS[keyof typeof DB_CONSTRAINT_ERRORS]

export const HistoryCleanupPage = () => {
  const {
    isLoading,
    error,
    deletionCriteria,
    deletionResult,
    deleteHistoFusionSeparationSaisie,
    validateDeletionCriteria,
    reset
  } = useHistoryCleanupStore()

  const { getState } = useDataSourceStore()

  const [chronoEF, setChronoEF] = useState("")
  const [societe, setSociete] = useState("")
  const [compteReference, setCompteReference] = useState("")
  const [filiationReference, setFiliationReference] = useState("")
  // RM-004: Missing table columns from spec
  const [iComptePointeOld, setIComptePointeOld] = useState("")
  const [iFiliationPointeOld, setIFiliationPointeOld] = useState("")
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>("idle")
  
  // RM-005: Context-based deletion support
  const [sessionContext, setSessionContext] = useState<SessionContext>({})
  const [useImplicitCriteria, setUseImplicitCriteria] = useState(false)
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([])
  const [constraintErrors, setConstraintErrors] = useState<string[]>([])

  useEffect(() => {
    // RM-006: Initialize session context from global state or URL params
    const initializeSessionContext = () => {
      const urlParams = new URLSearchParams(window.location.search)
      const context: SessionContext = {
        sessionId: urlParams.get("sessionId") || undefined,
        operationKey: urlParams.get("operationKey") || undefined,
        fusionProcessId: urlParams.get("fusionProcessId") || undefined
      }
      
      if (context.sessionId || context.operationKey || context.fusionProcessId) {
        setSessionContext(context)
        setUseImplicitCriteria(true)
      }
    }

    initializeSessionContext()
    
    return () => {
      reset()
    }
  }, [reset])

  const parseNumericValue = (value: string): number | undefined => {
    if (!value.trim()) return undefined
    const parsed = parseInt(value.trim())
    return isNaN(parsed) ? undefined : parsed
  }

  // RM-007: Enhanced criteria builder with all 6 table columns
  const buildCriteria = useCallback((): HistoFusionSeparationCriteria => {
    const criteria: HistoFusionSeparationCriteria = {}
    
    const chronoEFParsed = parseNumericValue(chronoEF)
    if (chronoEFParsed !== undefined) {
      criteria.chronoEF = chronoEFParsed
    }
    
    if (societe.trim()) {
      criteria.societe = societe.trim()
    }
    
    const compteReferenceParsed = parseNumericValue(compteReference)
    if (compteReferenceParsed !== undefined) {
      criteria.compteReference = compteReferenceParsed
    }
    
    const filiationReferenceParsed = parseNumericValue(filiationReference)
    if (filiationReferenceParsed !== undefined) {
      criteria.filiationReference = filiationReferenceParsed
    }

    const iComptePointeOldParsed = parseNumericValue(iComptePointeOld)
    if (iComptePointeOldParsed !== undefined) {
      criteria.iComptePointeOld = iComptePointeOldParsed
    }

    const iFiliationPointeOldParsed = parseNumericValue(iFiliationPointeOld)
    if (iFiliationPointeOldParsed !== undefined) {
      criteria.iFiliationPointeOld = iFiliationPointeOldParsed
    }
    
    return criteria
  }, [chronoEF, societe, compteReference, filiationReference, iComptePointeOld, iFiliationPointeOld])

  // RM-008: Context-based criteria from session/operation key
  const buildImplicitCriteria = useCallback((): HistoFusionSeparationCriteria => {
    const criteria: HistoFusionSeparationCriteria = {}
    
    if (sessionContext.sessionId) {
      criteria.sessionId = sessionContext.sessionId
    }
    
    if (sessionContext.operationKey) {
      criteria.operationKey = sessionContext.operationKey
    }
    
    if (sessionContext.fusionProcessId) {
      criteria.fusionProcessId = sessionContext.fusionProcessId
    }
    
    return criteria
  }, [sessionContext])

  // RM-009: Database constraint error detection
  const detectConstraintError = (errorMessage: string): DbConstraintError | null => {
    const message = errorMessage.toLowerCase()
    
    if (message.includes("foreign key") || message.includes("fk_")) {
      return DB_CONSTRAINT_ERRORS.FOREIGN_KEY_VIOLATION
    }
    
    if (message.includes("check constraint") || message.includes("ck_")) {
      return DB_CONSTRAINT_ERRORS.CHECK_CONSTRAINT
    }
    
    if (message.includes("unique") || message.includes("uk_")) {
      return DB_CONSTRAINT_ERRORS.UNIQUE_VIOLATION
    }
    
    return null
  }

  // RM-010: Audit logging for deletion operations
  const logDeletionAudit = useCallback((
    criteria: HistoFusionSeparationCriteria,
    recordCount: number,
    sessionId?: string
  ) => {
    const auditEntry: AuditLogEntry = {
      operation: "delete",
      table: "histo_Fus_Sep_Saisie",
      criteria,
      recordCount,
      timestamp: new Date().toISOString(),
      sessionId: sessionId || sessionContext.sessionId,
      userId: "current_user"
    }
    
    setAuditLogs(prev => [...prev, auditEntry])
    
    console.log("Audit log entry:", auditEntry)
  }, [sessionContext.sessionId])

  const handleValidateCriteria = useCallback(async () => {
    const criteria = useImplicitCriteria ? buildImplicitCriteria() : buildCriteria()
    
    try {
      setConstraintErrors([])
      const isValid = await validateDeletionCriteria(criteria)
      setValidationStatus(isValid ? "valid" : "invalid")
    } catch (err) {
      setValidationStatus("invalid")
      
      // RM-011: Handle constraint validation errors
      if (err instanceof Error) {
        const constraintError = detectConstraintError(err.message)
        if (constraintError) {
          setConstraintErrors(prev => [...prev, err.message])
        }
      }
    }
  }, [buildCriteria, buildImplicitCriteria, useImplicitCriteria, validateDeletionCriteria])

  const handleDeleteClick = useCallback(() => {
    if (validationStatus === "valid") {
      setShowConfirmDialog(true)
    }
  }, [validationStatus])

  const handleConfirmDelete = useCallback(async () => {
    setShowConfirmDialog(false)
    const criteria = useImplicitCriteria ? buildImplicitCriteria() : buildCriteria()
    
    try {
      setConstraintErrors([])
      const result = await deleteHistoFusionSeparationSaisie(criteria)
      
      // RM-012: Log successful deletion for audit
      if (result && result.success) {
        logDeletionAudit(criteria, result.recordsDeleted || 0, sessionContext.sessionId)
      }
    } catch (err) {
      // RM-013: Enhanced error handling for database constraints
      if (err instanceof Error) {
        const constraintError = detectConstraintError(err.message)
        if (constraintError) {
          setConstraintErrors(prev => [...prev, err.message])
        }
      }
    }
  }, [buildCriteria, buildImplicitCriteria, useImplicitCriteria, deleteHistoFusionSeparationSaisie, logDeletionAudit, sessionContext.sessionId])

  const handleClearForm = useCallback(() => {
    setChronoEF("")
    setSociete("")
    setCompteReference("")
    setFiliationReference("")
    setIComptePointeOld("")
    setIFiliationPointeOld("")
    setValidationStatus("idle")
    setConstraintErrors([])
  }, [])

  // RM-014: Integration with IDE 28 (Fusion program) detection
  const isCalledFromFusion = sessionContext.fusionProcessId !== undefined

  const hasCriteria = useImplicitCriteria ? 
    !!(sessionContext.sessionId || sessionContext.operationKey || sessionContext.fusionProcessId) :
    !!(chronoEF || societe || compteReference || filiationReference || iComptePointeOld || iFiliationPointeOld)
  
  const canDelete = validationStatus === "valid" && !isLoading && constraintErrors.length === 0

  const getStatusColor = (status: ValidationStatus): string => {
    switch (status) {
      case "valid":
        return "bg-green-500"
      case "invalid":
        return "bg-red-500"
      default:
        return "bg-gray-300"
    }
  }

  const getStatusText = (status: ValidationStatus): string => {
    switch (status) {
      case "valid":
        return "Criteria Valid"
      case "invalid":
        return "Invalid Criteria"
      default:
        return "Not Validated"
    }
  }

  return (
    <ScreenLayout className="p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              History Cleanup Service
            </h1>
            {isCalledFromFusion && (
              <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                Called from Fusion (IDE 28)
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* RM-015: Context selection UI */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-4 mb-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={!useImplicitCriteria}
                    onChange={() => setUseImplicitCriteria(false)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Explicit Criteria</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={useImplicitCriteria}
                    onChange={() => setUseImplicitCriteria(true)}
                    className="w-4 h-4"
                    disabled={!hasCriteria || (!sessionContext.sessionId && !sessionContext.operationKey && !sessionContext.fusionProcessId)}
                  />
                  <span className="text-sm font-medium">Context-based Criteria</span>
                </label>
              </div>

              {useImplicitCriteria ? (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-800">Session Context</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-600">
                    {sessionContext.sessionId && (
                      <div>Session ID: {sessionContext.sessionId}</div>
                    )}
                    {sessionContext.operationKey && (
                      <div>Operation: {sessionContext.operationKey}</div>
                    )}
                    {sessionContext.fusionProcessId && (
                      <div>Fusion Process: {sessionContext.fusionProcessId}</div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Deletion Criteria (All 6 Table Columns)
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Chrono EF
                      </label>
                      <Input
                        type="number"
                        value={chronoEF}
                        onChange={(e) => setChronoEF(e.target.value)}
                        placeholder="Enter chrono EF"
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Societe
                      </label>
                      <Input
                        type="text"
                        value={societe}
                        onChange={(e) => setSociete(e.target.value)}
                        placeholder="Enter societe code"
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Compte Reference
                      </label>
                      <Input
                        type="number"
                        value={compteReference}
                        onChange={(e) => setCompteReference(e.target.value)}
                        placeholder="Enter compte reference"
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Filiation Reference
                      </label>
                      <Input
                        type="number"
                        value={filiationReference}
                        onChange={(e) => setFiliationReference(e.target.value)}
                        placeholder="Enter filiation reference"
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        I Compte Pointe Old
                      </label>
                      <Input
                        type="number"
                        value={iComptePointeOld}
                        onChange={(e) => setIComptePointeOld(e.target.value)}
                        placeholder="Enter i compte pointe old"
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        I Filiation Pointe Old
                      </label>
                      <Input
                        type="number"
                        value={iFiliationPointeOld}
                        onChange={(e) => setIFiliationPointeOld(e.target.value)}
                        placeholder="Enter i filiation pointe old"
                        className="w-full"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={handleValidateCriteria}
                  disabled={!hasCriteria || isLoading}
                  variant="outline"
                  className="flex-1"
                >
                  {isLoading ? "Validating..." : "Validate Criteria"}
                </Button>
                
                {!useImplicitCriteria && (
                  <Button
                    onClick={handleClearForm}
                    variant="outline"
                    className="px-6"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-3 h-3 rounded-full",
                  getStatusColor(validationStatus)
                )} />
                <span className="text-sm font-medium">
                  Status: {getStatusText(validationStatus)}
                </span>
              </div>

              <Button
                onClick={handleDeleteClick}
                disabled={!canDelete}
                variant={canDelete ? "default" : "outline"}
                className={cn(
                  canDelete && "bg-red-600 hover:bg-red-700 text-white"
                )}
              >
                {isLoading ? "Processing..." : "Delete Records"}
              </Button>
            </div>

            {/* RM-016: Database constraint errors display */}
            {constraintErrors.length > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full" />
                  <span className="text-sm font-medium text-amber-800">Database Constraints</span>
                </div>
                <div className="space-y-1">
                  {constraintErrors.map((error, index) => (
                    <p key={index} className="text-amber-700 text-xs">{error}</p>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span className="text-sm font-medium text-red-800">Error</span>
                </div>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            )}

            {deletionResult && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 mb-3">
                  Deletion Complete
                </h3>
                <div className="space-y-2 text-sm text-green-700">
                  <div className="flex justify-between">
                    <span>Records Deleted:</span>
                    <span className="font-medium">{deletionResult.recordsDeleted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Success:</span>
                    <span className="font-medium">
                      {deletionResult.success ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Timestamp:</span>
                    <span className="font-medium">
                      {new Date(deletionResult.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* RM-017: Audit logs display */}
            {auditLogs.length > 0 && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h3 className="text-sm font-semibold text-purple-800 mb-2">
                  Audit Trail ({auditLogs.length} entries)
                </h3>
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {auditLogs.map((log, index) => (
                    <div key={index} className="text-xs text-purple-700 p-2 bg-purple-25 rounded">
                      <div className="flex justify-between items-center">
                        <span>{log.operation.toUpperCase()} - {log.recordCount} records</span>
                        <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                      {log.sessionId && (
                        <div className="text-purple-600">Session: {log.sessionId}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {deletionCriteria && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-sm font-semibold text-blue-800 mb-2">
                  Applied Criteria
                </h3>
                <div className="text-xs text-blue-700 space-y-1">
                  {deletionCriteria.chronoEF && (
                    <div>Chrono EF: {deletionCriteria.chronoEF}</div>
                  )}
                  {deletionCriteria.societe && (
                    <div>Societe: {deletionCriteria.societe}</div>
                  )}
                  {deletionCriteria.compteReference && (
                    <div>Compte Reference: {deletionCriteria.compteReference}</div>
                  )}
                  {deletionCriteria.filiationReference && (
                    <div>Filiation Reference: {deletionCriteria.filiationReference}</div>
                  )}
                  {deletionCriteria.iComptePointeOld && (
                    <div>I Compte Pointe Old: {deletionCriteria.iComptePointeOld}</div>
                  )}
                  {deletionCriteria.iFiliationPointeOld && (
                    <div>I Filiation Pointe Old: {deletionCriteria.iFiliationPointeOld}</div>
                  )}
                  {deletionCriteria.sessionId && (
                    <div>Session ID: {deletionCriteria.sessionId}</div>
                  )}
                  {deletionCriteria.operationKey && (
                    <div>Operation Key: {deletionCriteria.operationKey}</div>
                  )}
                  {deletionCriteria.fusionProcessId && (
                    <div>Fusion Process ID: {deletionCriteria.fusionProcessId}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete the history records matching the specified criteria? 
            This action cannot be undone and will be logged for audit purposes.
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Dialog>
    </ScreenLayout>
  )
}