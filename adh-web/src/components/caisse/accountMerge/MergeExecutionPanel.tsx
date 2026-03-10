import { useCallback } from "react";
import { useAccountMergeStore } from "@/stores/accountMergeStore";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

interface MergeExecutionPanelProps {
  className?: string;
}

export const MergeExecutionPanel = ({ className }: MergeExecutionPanelProps) => {
  const {
    sourceAccount,
    targetAccount,
    mergeProgress,
    currentStep,
    isLoading,
    error,
    executeMerge,
    reset,
  } = useAccountMergeStore();

  const handleExecuteAccountMerge = useCallback(async () => {
    if (!sourceAccount || !targetAccount) {
      return;
    }
    try {
      await executeMerge(sourceAccount.accountNumber, targetAccount.accountNumber);
    } catch (err) {
      console.error("Merge execution failed:", err);
    }
  }, [sourceAccount, targetAccount, executeMerge]);

  const handleCancelAccountMerge = useCallback(() => {
    reset();
  }, [reset]);

  const canExecuteAccountMerge = sourceAccount && targetAccount && !isLoading;

  return (
    <div className={cn("space-y-6", className)}>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Progression</span>
          <span className="text-muted-foreground">{mergeProgress}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${mergeProgress}%` }}
          />
        </div>
      </div>

      {currentStep && (
        <div className="rounded-md border border-border bg-card p-4">
          <div className="text-sm font-medium">Étape actuelle</div>
          <div className="mt-1 text-sm text-muted-foreground">{currentStep}</div>
        </div>
      )}

      {error && (
        <div className="rounded-md border border-destructive bg-destructive/10 p-4">
          <div className="text-sm font-medium text-destructive">Erreur</div>
          <div className="mt-1 text-sm text-destructive">{error}</div>
        </div>
      )}

      <div className="flex gap-3">
        <Button
          onClick={handleExecuteAccountMerge}
          disabled={!canExecuteAccountMerge}
          className="flex-1"
        >
          {isLoading ? "Fusion en cours..." : "Exécuter la fusion"}
        </Button>
        <Button
          onClick={handleCancelAccountMerge}
          variant="outline"
          disabled={isLoading}
        >
          Annuler
        </Button>
      </div>
    </div>
  );
};