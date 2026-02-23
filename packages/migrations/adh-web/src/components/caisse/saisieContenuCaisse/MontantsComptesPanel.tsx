import type { ValidationResult } from '@/types/saisieContenuCaisse';
import { cn } from '@/lib/utils';

interface MontantsComptesPanelProps {
  validationResult: ValidationResult | null;
  className?: string;
}

export const MontantsComptesPanel = ({
  validationResult,
  className,
}: MontantsComptesPanelProps) => {
  const formatAmount = (value: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className={cn('space-y-3', className)}>
      <h3 className="text-sm font-semibold text-gray-700 mb-2">
        Montants comptés (lecture seule)
      </h3>

      <div className="grid grid-cols-[180px_1fr] gap-x-4 gap-y-2">
        <label className="text-sm text-gray-600 self-center">
          Monnaie comptée
        </label>
        <div className="bg-gray-50 border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-800 font-mono text-right">
          {validationResult ? formatAmount(validationResult.totalMonnaie) : '0.00'}
        </div>

        <label className="text-sm text-gray-600 self-center">
          Produits comptés
        </label>
        <div className="bg-gray-50 border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-800 font-mono text-right">
          {validationResult ? formatAmount(validationResult.totalProduits) : '0.00'}
        </div>

        <label className="text-sm text-gray-600 self-center">
          Cartes comptées
        </label>
        <div className="bg-gray-50 border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-800 font-mono text-right">
          {validationResult ? formatAmount(validationResult.totalCartes) : '0.00'}
        </div>

        <label className="text-sm text-gray-600 self-center">
          Chèques comptés
        </label>
        <div className="bg-gray-50 border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-800 font-mono text-right">
          {validationResult ? formatAmount(validationResult.totalCheques) : '0.00'}
        </div>

        <label className="text-sm text-gray-600 self-center">
          OD comptés
        </label>
        <div className="bg-gray-50 border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-800 font-mono text-right">
          {validationResult ? formatAmount(validationResult.totalOD) : '0.00'}
        </div>

        <label className="text-sm text-gray-600 self-center">
          Devises comptées
        </label>
        <div className="bg-gray-50 border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-800 font-mono text-right">
          {validationResult ? validationResult.nbreDevise : 0}
        </div>
      </div>
    </div>
  );
};