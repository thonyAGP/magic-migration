import type { ChangeEvent } from 'react';

export interface SaisieVersementsPanelProps {
  totalCaisse: number;
  totalMonnaie: number;
  totalProduits: number;
  totalCartes: number;
  totalCheques: number;
  totalOD: number;
  totalDevises: number;
  onUpdate: (values: {
    versementMonnaie: number;
    versementProduits: number;
    versementCartes: number;
    versementCheques: number;
    versementOD: number;
    versementDevises: number;
  }) => void;
  disabled?: boolean;
  className?: string;
}

export const SaisieVersementsPanel = ({
  totalCaisse,
  totalMonnaie,
  totalProduits,
  totalCartes,
  totalCheques,
  totalOD,
  totalDevises,
  onUpdate,
  disabled = false,
  className,
}: SaisieVersementsPanelProps) => {
  const handleChange = (field: string) => (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    onUpdate({
      versementMonnaie: field === 'monnaie' ? value : totalMonnaie,
      versementProduits: field === 'produits' ? value : totalProduits,
      versementCartes: field === 'cartes' ? value : totalCartes,
      versementCheques: field === 'cheques' ? value : totalCheques,
      versementOD: field === 'od' ? value : totalOD,
      versementDevises: field === 'devises' ? value : totalDevises,
    });
  };

  return (
    <div className={className}>
      <div className="mb-4 border-b border-gray-300 pb-2">
        <h3 className="text-sm font-semibold text-gray-700">
          Saisie des versements
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="versement-monnaie"
            className="text-xs font-medium text-gray-600"
          >
            Versement monnaie
          </label>
          <input
            id="versement-monnaie"
            type="number"
            step="0.01"
            value={totalMonnaie}
            onChange={handleChange('monnaie')}
            disabled={disabled}
            className="rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="versement-produits"
            className="text-xs font-medium text-gray-600"
          >
            Versement produits
          </label>
          <input
            id="versement-produits"
            type="number"
            step="0.01"
            value={totalProduits}
            onChange={handleChange('produits')}
            disabled={disabled}
            className="rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="versement-cartes"
            className="text-xs font-medium text-gray-600"
          >
            Versement cartes
          </label>
          <input
            id="versement-cartes"
            type="number"
            step="0.01"
            value={totalCartes}
            onChange={handleChange('cartes')}
            disabled={disabled}
            className="rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="versement-cheques"
            className="text-xs font-medium text-gray-600"
          >
            Versement chèques
          </label>
          <input
            id="versement-cheques"
            type="number"
            step="0.01"
            value={totalCheques}
            onChange={handleChange('cheques')}
            disabled={disabled}
            className="rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="versement-od"
            className="text-xs font-medium text-gray-600"
          >
            Versement OD
          </label>
          <input
            id="versement-od"
            type="number"
            step="0.01"
            value={totalOD}
            onChange={handleChange('od')}
            disabled={disabled}
            className="rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="versement-devises"
            className="text-xs font-medium text-gray-600"
          >
            Versement devises
          </label>
          <input
            id="versement-devises"
            type="number"
            step="0.01"
            value={totalDevises}
            onChange={handleChange('devises')}
            disabled={disabled}
            className="rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
          />
        </div>
      </div>

      <div className="mt-4 rounded bg-blue-50 px-3 py-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-gray-700">Total caisse:</span>
          <span className="font-bold text-blue-700">
            {totalCaisse.toFixed(2)} €
          </span>
        </div>
      </div>
    </div>
  );
};