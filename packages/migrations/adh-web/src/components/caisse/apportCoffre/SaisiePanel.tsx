import type { Devise } from '@/types/apportCoffre';

interface SaisiePanelProps {
  devises: Devise[];
  deviseSelectionnee: string | null;
  montantSaisi: number;
  onDeviseChange: (code: string) => void;
  onMontantChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export const SaisiePanel = ({
  devises,
  deviseSelectionnee,
  montantSaisi,
  onDeviseChange,
  onMontantChange,
  disabled = false,
  className,
}: SaisiePanelProps) => {
  const formatterMontant = (montant: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: deviseSelectionnee || 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(montant);
  };

  const deviseLibelle =
    devises.find((d) => d.code === deviseSelectionnee)?.libelle || '';

  return (
    <div className={cn('space-y-4', className)}>
      <div className="space-y-2">
        <label
          htmlFor="devise-select"
          className="block text-sm font-medium text-gray-700"
        >
          Devise
        </label>
        <select
          id="devise-select"
          value={deviseSelectionnee || ''}
          onChange={(e) => onDeviseChange(e.target.value)}
          disabled={disabled || devises.length === 0}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
        >
          <option value="">Sélectionnez une devise</option>
          {devises.map((devise) => (
            <option key={devise.code} value={devise.code}>
              {devise.code} - {devise.libelle}
            </option>
          ))}
        </select>
        {deviseSelectionnee && deviseLibelle && (
          <p className="text-xs text-gray-500">{deviseLibelle}</p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="montant-input"
          className="block text-sm font-medium text-gray-700"
        >
          Montant
        </label>
        <Input
          id="montant-input"
          type="number"
          step="0.01"
          min="0.01"
          value={montantSaisi || ''}
          onChange={(e) => onMontantChange(e.target.value)}
          disabled={disabled || !deviseSelectionnee}
          placeholder="0.00"
          className="w-full"
        />
        {montantSaisi > 0 && deviseSelectionnee && (
          <p className="text-sm font-medium text-blue-600">
            {formatterMontant(montantSaisi)}
          </p>
        )}
      </div>
    </div>
  );
};