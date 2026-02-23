import { useEffect as _useEffect } from 'react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { RecapFermeture, MoyenPaiement } from '@/types/fermetureCaisse';

interface RecapPanelProps {
  societe: string;
  numeroSession: number;
  recap: RecapFermeture | null;
  ecartsDetectes: boolean;
  isLoading: boolean;
  onSaisie: (moyenPaiement: string) => void;
  onApportCoffre: () => void;
  onApportArticles: () => void;
  onRemise: () => void;
  onEcart: () => void;
  onValider: () => void;
  onLoadRecap: (societe: string, numeroSession: number) => void;
}

const MOYENS_PAIEMENT_COLUMNS = [
  { key: 'cash', label: 'Cash' },
  { key: 'cartes', label: 'Cartes' },
  { key: 'cheques', label: 'Chèques' },
  { key: 'produits', label: 'Produits' },
  { key: 'od', label: 'OD' },
  { key: 'devises', label: 'Devises' },
] as const;

const ROW_LABELS = [
  'Solde ouverture',
  'Montant compté',
  'Montant calculé',
  'Écart',
] as const;

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const getMoyenPaiementData = (recap: RecapFermeture | null, code: string): MoyenPaiement | undefined => {
  return recap?.moyensPaiement.find(mp => mp.code.toLowerCase() === code.toLowerCase());
};

export const RecapPanel = ({
  societe,
  numeroSession,
  recap,
  ecartsDetectes: _ecartsDetectes,
  isLoading,
  onSaisie,
  onApportCoffre,
  onApportArticles,
  onRemise,
  onEcart,
  onValider,
  onLoadRecap,
}: RecapPanelProps) => {
  useEffect(() => {
    onLoadRecap(societe, numeroSession);
  }, [societe, numeroSession, onLoadRecap]);

  const hasEcart = recap?.moyensPaiement.some(mp => mp.ecart !== 0) ?? false;
  const canValidate = recap !== null && !hasEcart;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-gray-600">Chargement...</div>
      </div>
    );
  }

  if (!recap) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-gray-600">Aucune donnée disponible</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                Type
              </th>
              {MOYENS_PAIEMENT_COLUMNS.map(col => (
                <th
                  key={col.key}
                  className="border border-gray-300 px-4 py-2 text-center font-semibold"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROW_LABELS.map((label, rowIndex) => (
              <tr key={label} className={rowIndex === 3 ? 'bg-yellow-50' : ''}>
                <td className="border border-gray-300 px-4 py-2 font-medium">
                  {label}
                </td>
                {MOYENS_PAIEMENT_COLUMNS.map(col => {
                  const mp = getMoyenPaiementData(recap, col.key);
                  let value = 0;

                  if (mp) {
                    if (rowIndex === 0) value = mp.soldeOuverture;
                    else if (rowIndex === 1) value = mp.montantCompte;
                    else if (rowIndex === 2) value = mp.montantCalcule;
                    else if (rowIndex === 3) value = mp.ecart;
                  }

                  const isEcart = rowIndex === 3 && value !== 0;

                  return (
                    <td
                      key={col.key}
                      className={cn(
                        'border border-gray-300 px-4 py-2 text-right',
                        isEcart && 'bg-red-100 font-bold text-red-700'
                      )}
                    >
                      {formatCurrency(value)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() => onSaisie('CASH')}
          variant="outline"
          disabled={isLoading}
        >
          Saisie
        </Button>
        <Button
          onClick={onApportCoffre}
          variant="outline"
          disabled={isLoading}
        >
          Apport coffre
        </Button>
        <Button
          onClick={onApportArticles}
          variant="outline"
          disabled={isLoading}
        >
          Apport articles
        </Button>
        <Button
          onClick={onRemise}
          variant="outline"
          disabled={isLoading}
        >
          Remise
        </Button>
        <Button
          onClick={onEcart}
          variant="outline"
          disabled={isLoading || !hasEcart}
        >
          Écart
        </Button>
        <Button
          onClick={onValider}
          variant="primary"
          disabled={isLoading || !canValidate}
        >
          Valider
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-300">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Solde final
          </label>
          <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded text-right font-semibold">
            {formatCurrency(recap.soldeFinal)}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Total versement coffre
          </label>
          <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded text-right font-semibold">
            {formatCurrency(recap.totalVersementCoffre)}
          </div>
        </div>
      </div>
    </div>
  );
};