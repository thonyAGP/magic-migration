import type { MergeHistory } from "@/types/accountMerge";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

interface CompletionPanelProps {
  mergeHistory: MergeHistory;
  onPrintTicket: () => void;
  onClose: () => void;
  isLoading?: boolean;
  className?: string;
}

const formatDateTime = (date: Date): string => new Date(date).toLocaleString("fr-FR");

const getStatusConfig = (status: string) => {
  const isSuccess = status.toLowerCase() === "success";
  
  return {
    isSuccess,
    containerClasses: isSuccess 
      ? "bg-green-50 border border-green-200" 
      : "bg-red-50 border border-red-200",
    indicatorClasses: isSuccess ? "bg-green-500" : "bg-red-500",
    textClasses: isSuccess ? "text-green-900" : "text-red-900",
    label: isSuccess ? "Fusion réussie" : "Fusion échouée"
  };
};

const AccountMergeInfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-1">
    <span className="text-sm text-gray-600">{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);

export const CompletionPanel = ({
  mergeHistory,
  onPrintTicket,
  onClose,
  isLoading = false,
  className,
}: CompletionPanelProps) => {
  const statusConfig = getStatusConfig(mergeHistory.status);

  return (
    <div className={cn("flex flex-col gap-6 p-6 bg-white rounded-lg shadow", className)}>
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Résultat de la fusion</h2>
        
        <div className={cn(
          "flex items-center gap-2 p-4 rounded-lg",
          statusConfig.containerClasses
        )}>
          <div className={cn(
            "w-3 h-3 rounded-full",
            statusConfig.indicatorClasses
          )} />
          <span className={cn(
            "font-medium",
            statusConfig.textClasses
          )}>
            {statusConfig.label}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <AccountMergeInfoRow
            label="Compte source"
            value={mergeHistory.sourceAccount}
          />
          
          <AccountMergeInfoRow
            label="Compte cible"
            value={mergeHistory.targetAccount}
          />
          
          <AccountMergeInfoRow
            label="Date de fusion"
            value={formatDateTime(mergeHistory.mergeDate)}
          />
          
          <AccountMergeInfoRow
            label="Opérateur"
            value={mergeHistory.operator}
          />
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <Button
          onClick={onPrintTicket}
          disabled={isLoading}
          className="bg-gray-200 hover:bg-gray-300 text-gray-900"
        >
          Imprimer le ticket
        </Button>
        
        <Button
          onClick={onClose}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Fermer
        </Button>
      </div>
    </div>
  );
};