import type { Account, MergeValidation } from "@/types/accountMerge";
import { Button, Input } from "@/components/ui";
import { cn } from "@/lib/utils";

interface AccountSelectionPanelProps {
  sourceAccountInput: string;
  targetAccountInput: string;
  onSourceAccountChange: (value: string) => void;
  onTargetAccountChange: (value: string) => void;
  onValidate: () => void;
  isLoading?: boolean;
  error?: string | null;
  sourceAccount?: Account | null;
  targetAccount?: Account | null;
  validationState?: MergeValidation | null;
  className?: string;
}

const formatDate = (date: Date): string => new Date(date).toLocaleDateString();

const formatBalance = (balance: number): string => `${balance.toFixed(2)} €`;

const AccountDetailsRow = ({ label, value }: { label: string; value: string }) => (
  <>
    <dt className="text-gray-600">{label}:</dt>
    <dd className="font-medium">{value}</dd>
  </>
);

const renderAccountDetails = (account: Account, title: string) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h3 className="text-md font-semibold mb-3">{title}</h3>
    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
      <AccountDetailsRow label="Numéro de compte" value={account.accountNumber} />
      <AccountDetailsRow label="Solde" value={formatBalance(account.balance)} />
      <AccountDetailsRow label="Statut" value={account.status} />
      <AccountDetailsRow label="Date de création" value={formatDate(account.createdDate)} />
    </dl>
  </div>
);

const ValidationDetailsRow = ({ label, value, isStatus = false }: { 
  label: string; 
  value: string | boolean; 
  isStatus?: boolean; 
}) => (
  <>
    <dt className="text-gray-600">{label}:</dt>
    <dd className={cn(
      "font-medium",
      isStatus && value === "OK" ? "text-green-600" : 
      isStatus && value !== "OK" ? "text-red-600" : ""
    )}>
      {typeof value === 'boolean' ? (value ? "Oui" : "Non") : value}
    </dd>
  </>
);

export const AccountSelectionPanel = ({
  sourceAccountInput,
  targetAccountInput,
  onSourceAccountChange,
  onTargetAccountChange,
  onValidate,
  isLoading = false,
  error = null,
  sourceAccount = null,
  targetAccount = null,
  validationState = null,
  className,
}: AccountSelectionPanelProps) => {
  const isValidationDisabled = !sourceAccountInput || !targetAccountInput || isLoading;

  return (
    <div className={cn("space-y-6", className)}>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Sélection des comptes</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="source-account" className="block text-sm font-medium text-gray-700 mb-1">
              Compte source
            </label>
            <Input
              id="source-account"
              type="text"
              value={sourceAccountInput}
              onChange={(e) => onSourceAccountChange(e.target.value)}
              placeholder="Numéro de compte source"
              disabled={isLoading}
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="target-account" className="block text-sm font-medium text-gray-700 mb-1">
              Compte cible
            </label>
            <Input
              id="target-account"
              type="text"
              value={targetAccountInput}
              onChange={(e) => onTargetAccountChange(e.target.value)}
              placeholder="Numéro de compte cible"
              disabled={isLoading}
              className="w-full"
            />
          </div>

          <Button
            onClick={onValidate}
            disabled={isValidationDisabled}
            className="w-full"
          >
            {isLoading ? "Validation en cours..." : "Valider les comptes"}
          </Button>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>
      </div>

      {sourceAccount && renderAccountDetails(sourceAccount, "Compte source")}

      {targetAccount && renderAccountDetails(targetAccount, "Compte cible")}

      {validationState && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-md font-semibold mb-3">État de validation</h3>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <ValidationDetailsRow 
              label="Clôture en cours" 
              value={validationState.isClosureInProgress} 
            />
            <ValidationDetailsRow 
              label="Statut réseau" 
              value={validationState.networkStatus} 
            />
            <ValidationDetailsRow 
              label="Statut de validation" 
              value={validationState.validationStatus}
              isStatus={true}
            />
          </dl>
        </div>
      )}
    </div>
  );
};