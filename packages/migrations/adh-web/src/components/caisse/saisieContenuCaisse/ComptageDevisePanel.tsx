import { useMemo } from 'react';
import type { DeviseComptage, Denomination } from '@/types/saisieContenuCaisse';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui';

interface ComptageDevisePanelProps {
  deviseCode: string;
  deviseLibelle: string;
  comptage: DeviseComptage;
  denominations: Denomination[];
  onQuantiteChange: (denominationId: number, quantite: number) => void;
  className?: string;
}

export const ComptageDevisePanel = ({
  deviseCode,
  deviseLibelle,
  comptage,
  denominations,
  onQuantiteChange,
  className,
}: ComptageDevisePanelProps) => {
  const totalSaisi = useMemo(() => {
    return comptage.denominations.reduce((sum, d) => sum + d.total, 0);
  }, [comptage.denominations]);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const handleQuantiteChange = (denominationId: number, value: string) => {
    const quantite = value === '' ? 0 : parseInt(value, 10);
    if (isNaN(quantite) || quantite < 0) return;
    onQuantiteChange(denominationId, quantite);
  };

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="flex items-center justify-between px-4 py-2 bg-blue-50 border border-blue-200 rounded">
        <h3 className="text-lg font-semibold text-blue-900">
          {deviseLibelle} ({deviseCode})
        </h3>
        <div className="text-right">
          <div className="text-xs text-blue-600 uppercase">Total saisi</div>
          <div className="text-xl font-bold text-blue-900">
            {formatCurrency(totalSaisi)} {deviseCode}
          </div>
        </div>
      </div>

      <div className="border border-gray-200 rounded overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-4 gap-4 px-4 py-2 text-sm font-semibold text-gray-700">
            <div>Dénomination</div>
            <div className="text-right">Valeur</div>
            <div className="text-right">Quantité</div>
            <div className="text-right">Total</div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {denominations.map((denom) => {
            const detail = comptage.denominations.find(
              (d) => d.denominationId === denom.id
            );
            const quantite = detail?.quantite || 0;
            const total = detail?.total || 0;

            return (
              <div
                key={denom.id}
                className="grid grid-cols-4 gap-4 px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center text-sm text-gray-900">
                  {denom.libelle}
                </div>
                <div className="flex items-center justify-end text-sm text-gray-600">
                  {formatCurrency(denom.valeur)}
                </div>
                <div className="flex items-center justify-end">
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={quantite === 0 ? '' : quantite.toString()}
                    onChange={(e) =>
                      handleQuantiteChange(denom.id, e.target.value)
                    }
                    className="w-24 text-right"
                    placeholder="0"
                  />
                </div>
                <div className="flex items-center justify-end text-sm font-semibold text-gray-900">
                  {formatCurrency(total)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {denominations.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Aucune dénomination disponible pour cette devise
        </div>
      )}
    </div>
  );
};