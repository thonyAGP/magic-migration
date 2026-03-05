import { useCallback, useEffect, useState } from "react";
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
    validateMergeConditions,
    executeMerge,
    printMergeTicket,
    reset,
  } = useAccountMergeStore();

  const [sourceAccountInput, setSourceAccountInput] = useState("");
  const [targetAccountInput, setTargetAccountInput] = useState("");

  const { isValidated, isMergeInProgress, isMergeCompleted } = getValidationStepStatuses(currentStep);

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  const handleValidateAccounts = useCallback(async () => {
    if (!sourceAccountInput || !targetAccountInput) {
      return;
    }
    try {
      await validateMergeConditions(sourceAccountInput, targetAccountInput);
    } catch (err) {
      console.error("Validation failed:", err);
    }
  }, [sourceAccountInput, targetAccountInput, validateMergeConditions]);

  const handleExecuteMerge = useCallback(async () => {
    if (!sourceAccount || !targetAccount) {
      return;
    }
    try {
      await executeMerge(sourceAccount.accountNumber, targetAccount.accountNumber);
    } catch (err) {
      console.error("Merge execution failed:", err);
    }
  }, [sourceAccount, targetAccount, executeMerge]);

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
  }, [reset]);

  return (
    <ScreenLayout className="p-6">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Account Merge</h1>
          <p className="text-muted-foreground mt-2">Merge source account into target account</p>
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 p-4 text-destructive border border-destructive/20">
            {error}
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
                  disabled={isLoading}
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
                  disabled={isLoading}
                />
              </div>
            </div>
            <Button
              onClick={handleValidateAccounts}
              disabled={!sourceAccountInput || !targetAccountInput || isLoading}
              className="w-full"
            >
              {isLoading ? "Validating..." : "Validate Accounts"}
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

        {isValidated && !isMergeCompleted && (
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <h2 className="text-xl font-semibold">Merge Execution</h2>
            {isMergeInProgress && (
              <div className="space-y-2">
                <ProgressBar progress={mergeProgress} />
                <div className="text-sm text-muted-foreground">
                  Current Step: {currentStep}
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <Button
                onClick={handleExecuteMerge}
                disabled={isMergeInProgress || isLoading || currentStep !== "validated"}
                className="flex-1"
              >
                {isMergeInProgress ? "Executing..." : "Execute Merge"}
              </Button>
              <Button
                variant="outline"
                onClick={handleClose}
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
            <div className="rounded-lg bg-success/10 p-4 border border-success/20">
              <div className="font-medium text-success">Merge completed successfully!</div>
              <div className="text-sm text-muted-foreground mt-2">
                Account {sourceAccount?.accountNumber} has been merged into {targetAccount?.accountNumber}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handlePrintTicket} className="flex-1">
                Print Ticket
              </Button>
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </ScreenLayout>
  );
};