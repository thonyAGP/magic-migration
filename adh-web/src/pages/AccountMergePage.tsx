import { useCallback, useEffect, useState } from "react";
import type { BusinessRulesResult } from "@/types/accountMerge";
import { useAccountMergeStore } from "@/stores/accountMergeStore";
import { ScreenLayout } from "@/components/layout";
import { Button, Input } from "@/components/ui";
import { cn } from "@/lib/utils";

const getValidationStepStatuses = (currentStep: string) => ({
  isValidated: currentStep === "validated" || currentStep === "transferring" || currentStep === "updating" || currentStep === "finalizing" || currentStep === "completed",
  isMergeInProgress: currentStep === "transferring" || currentStep === "updating" || currentStep === "finalizing",
  isMergeCompleted: currentStep === "completed"
});

const ValidationStatusIndicator = ({ isValid, label }: { isValid: boolean; label: string }) => (
  <div className="flex items-center gap-2">
    <div className={cn("h-3 w-3 rounded-full", isValid ? "bg-success" : "bg-destructive")} />
    <span className="text-sm">{label}</span>
  </div>
);

const ProgressBar = ({ progress }: { progress: number }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-sm">
      <span>Progress</span>
      <span>{progress}%</span>
    </div>
    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
      <div
        className="h-full bg-primary transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  </div>
);

const TaskProgressIndicator = ({ currentTask, totalTasks }: { currentTask: number; totalTasks: number }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-sm">
      <span>Task Progress</span>
      <span>{currentTask} / {totalTasks}</span>
    </div>
    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
      <div
        className="h-full bg-secondary transition-all duration-300"
        style={{ width: `${(currentTask / totalTasks) * 100}%` }}
      />
    </div>
  </div>
);


const ScreenManagementStatus = ({ currentScreen }: { currentScreen: number }) => (
  <div className="flex items-center gap-2 text-sm text-muted-foreground">
    <span>Screen:</span>
    <span className="font-mono">{currentScreen}/11</span>
    <span className="text-xs">(422x56 DLU MDI)</span>
  </div>
);

const RetryIndicator = ({ isRetrying, retryCount }: { isRetrying: boolean; retryCount: number }) => (
  isRetrying ? (
    <div className="flex items-center gap-2 text-sm">
      <div className="animate-spin h-4 w-4 border-2 border-destructive border-t-transparent rounded-full" />
      <span>Retry {retryCount}/3</span>
    </div>
  ) : null
);

const EntityMappingStatus = ({ 
  mappedTables, 
  totalTables = 60 
}: { 
  mappedTables: number; 
  totalTables?: number;
}) => (
  <div className="flex items-center gap-2 text-sm text-muted-foreground">
    <span>Entity Mappings:</span>
    <span className="font-mono">{mappedTables}/{totalTables}</span>
    <div className={cn("h-2 w-2 rounded-full", mappedTables === totalTables ? "bg-success" : "bg-warning")} />
  </div>
);

const BusinessRulesMatrix = ({ businessRulesResult }: { businessRulesResult: BusinessRulesResult | null }) => {
  if (!businessRulesResult) return null;

  const allRulesPassed = Object.values(businessRulesResult).every(rule => rule.passed);
  const totalRules = Object.keys(businessRulesResult).length;
  const passedRules = Object.values(businessRulesResult).filter(rule => rule.passed).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Rules Matrix</span>
        <div className="flex items-center gap-2">
          <span className="text-xs">{passedRules}/{totalRules}</span>
          <div className={cn("h-2 w-2 rounded-full", allRulesPassed ? "bg-success" : "bg-destructive")} />
        </div>
      </div>
      <div className="grid grid-cols-9 gap-1">
        {Object.entries(businessRulesResult).map(([ruleId, rule]) => (
          <div
            key={ruleId}
            className={cn(
              "h-6 w-6 rounded text-xs flex items-center justify-center text-white font-mono",
              rule.passed ? "bg-success" : "bg-destructive"
            )}
            title={`${ruleId.toUpperCase()}: ${rule.description}`}
          >
            {ruleId.replace('rm', '').padStart(2, '0')}
          </div>
        ))}
      </div>
    </div>
  );
};

const NetworkFailureHandler = ({ 
  onRetry, 
  isRetrying, 
  retryCount 
}: { 
  onRetry: () => void; 
  isRetrying: boolean; 
  retryCount: number; 
}) => (
  retryCount > 0 ? (
    <div className="rounded-lg bg-warning/10 p-4 border border-warning/20">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium text-warning">Network Issue Detected</div>
          <div className="text-sm text-muted-foreground">
            Retry attempt {retryCount}/3 in progress
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          disabled={isRetrying}
        >
          {isRetrying ? "Retrying..." : "Retry Now"}
        </Button>
      </div>
    </div>
  ) : null
);

const ClosureBlockingIndicator = ({ 
  hasClosureBlocking, 
  onResolve 
}: { 
  hasClosureBlocking: boolean; 
  onResolve: () => void; 
}) => (
  hasClosureBlocking ? (
    <div className="rounded-lg bg-destructive/10 p-4 border border-destructive/20">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium text-destructive">Closure Blocking Detected</div>
          <div className="text-sm text-muted-foreground">
            Account closure is preventing merge execution
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onResolve}
        >
          Resolve
        </Button>
      </div>
    </div>
  ) : null
);

export const AccountMergePage = () => {
  const {
    mergeHistories,
    sourceAccount,
    targetAccount,
    validationState,
    isLoading,
    error,
    mergeProgress,
    currentStep,
    currentTask,
    currentScreen,
    validateMergeConditions,
    executeMerge,
    printMergeTicket,
    reset,
    checkBusinessRules,
    validateNetworkStatus,
    validateClosureBlocking,
    evaluateBusinessRule005,
    evaluateBusinessRule006,
    evaluateBusinessRule007,
    evaluateBusinessRule008,
    evaluateBusinessRule009,
    evaluateBusinessRule010,
    evaluateBusinessRule011,
    evaluateBusinessRule012,
    evaluateBusinessRule013,
    validateAllBusinessRules,
    orchestrateTaskExecution,
    handleNetworkFailure,
    handleClosureBlocking,
    handleValidationError,
  } = useAccountMergeStore();

  const [sourceAccountInput, setSourceAccountInput] = useState("");
  const [targetAccountInput, setTargetAccountInput] = useState("");
  const [businessRulesResult, setBusinessRulesResult] = useState<BusinessRulesResult | null>(null);
  const [, setShowDetailedRules] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [hasClosureBlocking, setHasClosureBlocking] = useState(false);
  const [mappedTablesCount, setMappedTablesCount] = useState(0);

  const { isValidated, isMergeInProgress, isMergeCompleted } = getValidationStepStatuses(currentStep);

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  // RM-005: W0 chrono histo [BA] different de 'F'
  const executeRM005 = useCallback((account: unknown): boolean => {
    if (!account || typeof account !== 'object' || !('chronoHisto' in account)) {
      return false;
    }
    const chronoHisto = (account as { chronoHisto: string }).chronoHisto;
    return chronoHisto !== 'F';
  }, []);

  // RM-006: Negation de (W0 code LOG existe [BB]) (condition inversee)
  const executeRM006 = useCallback((account: unknown): boolean => {
    if (!account || typeof account !== 'object' || !('codeLog' in account)) {
      return true;
    }
    const codeLog = (account as { codeLog: string | null }).codeLog;
    return !codeLog || codeLog.trim() === '';
  }, []);

  // RM-007: Si W0 Filiation garantie ... [BF] alors IF (W0 reprise confirmee [BD] sinon 'RETRY','DONE'),'PASSED')
  const executeRM007 = useCallback((account: unknown): 'RETRY' | 'DONE' | 'PASSED' => {
    if (!account || typeof account !== 'object') {
      return 'RETRY';
    }
    
    const hasFilitionGarantie = 'filiationGarantie' in account && (account as { filiationGarantie: boolean }).filiationGarantie;
    
    if (!hasFilitionGarantie) {
      return 'PASSED';
    }
    
    const repriseConfirmee = 'repriseConfirmee' in account && (account as { repriseConfirmee: boolean }).repriseConfirmee;
    return repriseConfirmee ? 'DONE' : 'RETRY';
  }, []);

  // RM-008: Negation de (W0 reprise confirmee [BD]) (condition inversee)
  const executeRM008 = useCallback((account: unknown): boolean => {
    if (!account || typeof account !== 'object' || !('repriseConfirmee' in account)) {
      return true;
    }
    const repriseConfirmee = (account as { repriseConfirmee: boolean }).repriseConfirmee;
    return !repriseConfirmee;
  }, []);

  // RM-009: Negation de (W0 Compte remplace à l... [BI]) (condition inversee)
  const executeRM009 = useCallback((account: unknown): boolean => {
    if (!account || typeof account !== 'object' || !('compteRemplace' in account)) {
      return true;
    }
    const compteRemplace = (account as { compteRemplace: boolean }).compteRemplace;
    return !compteRemplace;
  }, []);

  // RM-010: Condition composite: [BK]=6 OR P0 Reprise Auto [I]
  const executeRM010 = useCallback((sourceAcc: unknown, targetAcc: unknown): boolean => {
    let bkCondition = false;
    let repriseAutoCondition = false;
    
    if (sourceAcc && typeof sourceAcc === 'object' && 'statusBK' in sourceAcc) {
      bkCondition = (sourceAcc as { statusBK: number }).statusBK === 6;
    }
    
    if (targetAcc && typeof targetAcc === 'object' && 'repriseAuto' in targetAcc) {
      repriseAutoCondition = (targetAcc as { repriseAuto: boolean }).repriseAuto;
    }
    
    return bkCondition || repriseAutoCondition;
  }, []);

  // RM-011: Condition toujours vraie (flag actif)
  const executeRM011 = useCallback((): boolean => {
    return true;
  }, []);

  // RM-012: Negation de P0.Sans interface [J] (condition inversee)
  const executeRM012 = useCallback((account: unknown): boolean => {
    if (!account || typeof account !== 'object' || !('sansInterface' in account)) {
      return true;
    }
    const sansInterface = (account as { sansInterface: boolean }).sansInterface;
    return !sansInterface;
  }, []);

  // RM-013: Negation de VG78 (condition inversee)
  const executeRM013 = useCallback((state: unknown): boolean => {
    if (!state || typeof state !== 'object' || !('vg78' in state)) {
      return true;
    }
    const vg78 = (state as { vg78: boolean }).vg78;
    return !vg78;
  }, []);

  const evaluateAllBusinessRules = useCallback((): BusinessRulesResult | null => {
    if (!sourceAccount || !targetAccount) {
      return null;
    }

    try {
      const rm005 = evaluateBusinessRule005 ? evaluateBusinessRule005(sourceAccount) : executeRM005(sourceAccount);
      const rm006 = evaluateBusinessRule006 ? evaluateBusinessRule006(sourceAccount) : executeRM006(sourceAccount);
      const rm007 = evaluateBusinessRule007 ? evaluateBusinessRule007(sourceAccount) : executeRM007(sourceAccount);
      const rm008 = evaluateBusinessRule008 ? evaluateBusinessRule008(sourceAccount) : executeRM008(sourceAccount);
      const rm009 = evaluateBusinessRule009 ? evaluateBusinessRule009(sourceAccount) : executeRM009(sourceAccount);
      const rm010 = evaluateBusinessRule010 ? evaluateBusinessRule010(sourceAccount, targetAccount) : executeRM010(sourceAccount, targetAccount);
      const rm011 = evaluateBusinessRule011 ? evaluateBusinessRule011() : executeRM011();
      const rm012 = evaluateBusinessRule012 ? evaluateBusinessRule012(targetAccount) : executeRM012(targetAccount);
      const rm013 = evaluateBusinessRule013 ? evaluateBusinessRule013(validationState) : executeRM013(validationState);

      return {
        rm005: { passed: rm005, description: "Chrono histo different de 'F'" },
        rm006: { passed: rm006, description: "Code LOG n'existe pas" },
        rm007: { passed: rm007 === 'PASSED' || rm007 === 'DONE', status: rm007, description: "Filiation garantie validation" },
        rm008: { passed: rm008, description: "Reprise non confirmee" },
        rm009: { passed: rm009, description: "Compte non remplace" },
        rm010: { passed: rm010, description: "Status BK=6 ou Reprise Auto" },
        rm011: { passed: rm011, description: "Flag actif" },
        rm012: { passed: rm012, description: "Interface disponible" },
        rm013: { passed: rm013, description: "VG78 non active" }
      };
    } catch (err) {
      console.error("Error evaluating business rules:", err);
      return null;
    }
  }, [
    sourceAccount,
    targetAccount,
    validationState,
    evaluateBusinessRule005,
    evaluateBusinessRule006,
    evaluateBusinessRule007,
    evaluateBusinessRule008,
    evaluateBusinessRule009,
    evaluateBusinessRule010,
    evaluateBusinessRule011,
    evaluateBusinessRule012,
    evaluateBusinessRule013,
    executeRM005,
    executeRM006,
    executeRM007,
    executeRM008,
    executeRM009,
    executeRM010,
    executeRM011,
    executeRM012,
    executeRM013
  ]);

  const handleNetworkError = useCallback(async (error: unknown) => {
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    
    try {
      if (handleNetworkFailure) {
        await handleNetworkFailure(error, retryCount);
      }
    } catch (retryError) {
      console.error("Network retry failed:", retryError);
    } finally {
      setIsRetrying(false);
    }
  }, [handleNetworkFailure, retryCount]);

  const handleClosureError = useCallback(async (error: unknown) => {
    setHasClosureBlocking(true);
    try {
      if (handleClosureBlocking) {
        await handleClosureBlocking(error);
        setHasClosureBlocking(false);
      }
    } catch (closureError) {
      console.error("Closure blocking handler failed:", closureError);
    }
  }, [handleClosureBlocking]);

  const handleRuleValidationError = useCallback(async (error: unknown) => {
    try {
      if (handleValidationError) {
        await handleValidationError(error);
      }
    } catch (validationError) {
      console.error("Validation error handler failed:", validationError);
    }
  }, [handleValidationError]);

  const validateBusinessRulesFlow = useCallback(async (sourceAccNum: string, targetAccNum: string) => {
    try {
      await validateNetworkStatus(sourceAccNum, targetAccNum);
      await validateClosureBlocking(sourceAccNum, targetAccNum);
      
      if (checkBusinessRules) {
        await checkBusinessRules(sourceAccNum, targetAccNum);
      }

      if (validateAllBusinessRules) {
        const storeResult = await validateAllBusinessRules(sourceAccNum, targetAccNum);
        setBusinessRulesResult(storeResult);
        return storeResult;
      }
      
      const rulesResult = evaluateAllBusinessRules();
      setBusinessRulesResult(rulesResult);
      
      return rulesResult;
    } catch (err) {
      console.error("Business rules validation failed:", err);
      
      if (err && typeof err === 'object' && 'type' in err) {
        switch ((err as { type: string }).type) {
          case 'NETWORK_ERROR':
            await handleNetworkError(err);
            break;
          case 'CLOSURE_BLOCKING':
            await handleClosureError(err);
            break;
          case 'VALIDATION_ERROR':
            await handleRuleValidationError(err);
            break;
          default:
            break;
        }
      }
      
      throw err;
    }
  }, [
    validateNetworkStatus,
    validateClosureBlocking,
    checkBusinessRules,
    validateAllBusinessRules,
    evaluateAllBusinessRules,
    handleNetworkError,
    handleClosureError,
    handleRuleValidationError
  ]);

  const handleValidateAccounts = useCallback(async () => {
    if (!sourceAccountInput || !targetAccountInput) {
      return;
    }
    try {
      await validateMergeConditions(sourceAccountInput, targetAccountInput);
      await validateBusinessRulesFlow(sourceAccountInput, targetAccountInput);
      setMappedTablesCount(60);
    } catch (err) {
      console.error("Validation failed:", err);
    }
  }, [sourceAccountInput, targetAccountInput, validateMergeConditions, validateBusinessRulesFlow]);

  const checkAllRulesPassed = useCallback((rulesResult: BusinessRulesResult): boolean => {
    return Object.values(rulesResult).every(rule => rule.passed);
  }, []);

  const executeOrchestrationWorkflow = useCallback(async () => {
    if (!orchestrateTaskExecution) {
      console.warn("Task orchestration not available");
      return;
    }

    try {
      await orchestrateTaskExecution({
        totalTasks: 192,
        sourceAccountId: sourceAccount?.accountNumber || '',
        targetAccountId: targetAccount?.accountNumber || '',
        businessRulesResult: businessRulesResult || undefined
      });
    } catch (err) {
      console.error("Task orchestration failed:", err);
      throw err;
    }
  }, [orchestrateTaskExecution, sourceAccount, targetAccount, businessRulesResult]);

  const handleExecuteMerge = useCallback(async () => {
    if (!sourceAccount || !targetAccount) {
      return;
    }

    const rulesResult = businessRulesResult || evaluateAllBusinessRules();
    if (!rulesResult) {
      return;
    }

    if (!checkAllRulesPassed(rulesResult)) {
      console.error("Business rules validation failed - cannot proceed with merge");
      return;
    }

    try {
      await executeOrchestrationWorkflow();
      await executeMerge(sourceAccount.accountNumber, targetAccount.accountNumber);
    } catch (err) {
      console.error("Merge execution failed:", err);
      
      if (err && typeof err === 'object' && 'type' in err) {
        switch ((err as { type: string }).type) {
          case 'NETWORK_ERROR':
            await handleNetworkError(err);
            break;
          case 'CLOSURE_BLOCKING':
            await handleClosureError(err);
            break;
          case 'VALIDATION_ERROR':
            await handleRuleValidationError(err);
            break;
          default:
            break;
        }
      }
    }
  }, [
    sourceAccount,
    targetAccount,
    businessRulesResult,
    evaluateAllBusinessRules,
    checkAllRulesPassed,
    executeOrchestrationWorkflow,
    executeMerge,
    handleNetworkError,
    handleClosureError,
    handleRuleValidationError
  ]);


  const handlePrintTicket = useCallback(async () => {
    if (mergeHistories.length === 0) {
      return;
    }
    const latestMerge = mergeHistories[mergeHistories.length - 1];
    try {
      await printMergeTicket(latestMerge.id);
    } catch (err) {
      console.error("Print ticket failed:", err);
    }
  }, [mergeHistories, printMergeTicket]);

  const handleClose = useCallback(() => {
    reset();
    setSourceAccountInput("");
    setTargetAccountInput("");
    setBusinessRulesResult(null);
    setShowDetailedRules(false);
    setRetryCount(0);
    setIsRetrying(false);
    setHasClosureBlocking(false);
    setMappedTablesCount(0);
  }, [reset]);

  const handleRetryNetwork = useCallback(() => {
    if (sourceAccountInput && targetAccountInput) {
      handleValidateAccounts();
    }
  }, [sourceAccountInput, targetAccountInput, handleValidateAccounts]);

  const handleResolveClosureBlocking = useCallback(async () => {
    try {
      if (handleClosureBlocking && sourceAccount) {
        await handleClosureBlocking({ type: 'CLOSURE_BLOCKING', accountId: sourceAccount.accountNumber });
        setHasClosureBlocking(false);
      }
    } catch (err) {
      console.error("Failed to resolve closure blocking:", err);
    }
  }, [handleClosureBlocking, sourceAccount]);

  useEffect(() => {
    if (sourceAccount && targetAccount) {
      const rulesResult = evaluateAllBusinessRules();
      setBusinessRulesResult(rulesResult);
    }
  }, [sourceAccount, targetAccount, evaluateAllBusinessRules]);

  return (
    <ScreenLayout className="p-6">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Account Merge</h1>
          <p className="text-muted-foreground mt-2">Merge source account into target account (192 task workflow)</p>
          <div className="flex items-center justify-center gap-4 mt-2">
            <ScreenManagementStatus currentScreen={currentScreen || 1} />
            <EntityMappingStatus mappedTables={mappedTablesCount} />
          </div>
        </div>

        <NetworkFailureHandler
          onRetry={handleRetryNetwork}
          isRetrying={isRetrying}
          retryCount={retryCount}
        />

        <ClosureBlockingIndicator
          hasClosureBlocking={hasClosureBlocking}
          onResolve={handleResolveClosureBlocking}
        />

        {error && (
          <div className="rounded-lg bg-destructive/10 p-4 text-destructive border border-destructive/20">
            <div className="flex items-center justify-between">
              <span>{error}</span>
              <RetryIndicator isRetrying={isRetrying} retryCount={retryCount} />
            </div>
          </div>
        )}

        {!isValidated && (
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <h2 className="text-xl font-semibold">Account Selection</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="sourceAccount" className="text-sm font-medium">
                  Source Account
                </label>
                <Input
                  id="sourceAccount"
                  value={sourceAccountInput}
                  onChange={(e) => setSourceAccountInput(e.target.value)}
                  placeholder="Enter source account number"
                  disabled={isLoading || isRetrying}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="targetAccount" className="text-sm font-medium">
                  Target Account
                </label>
                <Input
                  id="targetAccount"
                  value={targetAccountInput}
                  onChange={(e) => setTargetAccountInput(e.target.value)}
                  placeholder="Enter target account number"
                  disabled={isLoading || isRetrying}
                />
              </div>
            </div>
            <Button
              onClick={handleValidateAccounts}
              disabled={!sourceAccountInput || !targetAccountInput || isLoading || isRetrying}
              className="w-full"
            >
              {isLoading ? "Validating..." : isRetrying ? "Retrying..." : "Validate Accounts"}
            </Button>
          </div>
        )}

        {isValidated && !isMergeCompleted && (
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <h2 className="text-xl font-semibold">Validation Status</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="text-sm font-medium">Source Account</div>
                <div className="text-muted-foreground">
                  {sourceAccount?.accountNumber} - Balance: ${sourceAccount?.balance.toFixed(2)}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Target Account</div>
                <div className="text-muted-foreground">
                  {targetAccount?.accountNumber} - Balance: ${targetAccount?.balance.toFixed(2)}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <ValidationStatusIndicator
                isValid={!validationState?.isClosureInProgress}
                label={`Closure Status: ${validationState?.isClosureInProgress ? "In Progress" : "Not In Progress"}`}
              />
              <ValidationStatusIndicator
                isValid={validationState?.networkStatus !== "R"}
                label={`Network Status: ${validationState?.networkStatus}`}
              />
              <ValidationStatusIndicator
                isValid={validationState?.validationStatus === "PASSED"}
                label={`Validation Status: ${validationState?.validationStatus}`}
              />
            </div>
          </div>
        )}

        {businessRulesResult && isValidated && !isMergeCompleted && (
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Business Rules Validation</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetailedRules(true)}
              >
                View Details
              </Button>
            </div>
            
            <BusinessRulesMatrix businessRulesResult={businessRulesResult} />
            
            <div className="grid gap-2 md:grid-cols-2">
              <ValidationStatusIndicator
                isValid={businessRulesResult.rm005.passed}
                label={`RM-005: ${businessRulesResult.rm005.description}`}
              />
            </div>
          </div>
        )}

        {isValidated && !isMergeCompleted && (
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <h2 className="text-xl font-semibold">Merge Execution</h2>
            {isMergeInProgress && (
              <div className="space-y-3">
                <ProgressBar progress={mergeProgress} />
                <TaskProgressIndicator currentTask={currentTask} totalTasks={192} />
                <p className="text-sm text-muted-foreground">Current Step: {currentStep}</p>
              </div>
            )}
            <div className="flex gap-3">
              <Button
                onClick={handleExecuteMerge}
                disabled={isMergeInProgress || isLoading}
                className="flex-1"
              >
                {isMergeInProgress ? "Executing..." : "Execute Merge"}
              </Button>
              <Button
                variant="outline"
                onClick={reset}
                disabled={isMergeInProgress}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {isMergeCompleted && (
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <h2 className="text-xl font-semibold">Merge Completed</h2>
            <p>Merge completed successfully!</p>
            <p>Account {sourceAccount?.accountNumber} has been merged into {targetAccount?.accountNumber}</p>
            <div className="flex gap-3">
              <Button onClick={handlePrintTicket}>Print Ticket</Button>
              <Button variant="outline" onClick={handleClose}>Close</Button>
            </div>
          </div>
        )}
      </div>
    </ScreenLayout>
  )
}
