import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { ResortCreditResult } from '@/types/transaction-lot2';

const formatCurrency = (value: number, devise = 'EUR') =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: devise }).format(value);

interface ResortCreditCheckProps {
  result: ResortCreditResult | null;
  isChecking: boolean;
  onCheck: () => void;
  disabled?: boolean;
}

export function ResortCreditCheck({
  result,
  isChecking,
  onCheck,
  disabled = false,
}: ResortCreditCheckProps) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-border p-3">
      <div className="flex-1">
        <div className="text-sm font-medium">Resort Credit</div>
        {result ? (
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={result.available ? 'default' : 'secondary'}>
              {result.available ? 'Disponible' : 'Indisponible'}
            </Badge>
            <span className={cn('text-sm font-medium', result.available ? 'text-success' : 'text-on-surface-muted')}>
              {formatCurrency(result.balance, result.devise)}
            </span>
          </div>
        ) : (
          <span className="text-xs text-on-surface-muted">Non verifie</span>
        )}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onCheck}
        disabled={disabled || isChecking}
      >
        {isChecking ? 'Verification...' : 'Verifier'}
      </Button>
    </div>
  );
}
