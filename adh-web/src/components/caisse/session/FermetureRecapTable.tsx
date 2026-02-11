import { cn } from '@/lib/utils';

const FERMETURE_COLUMN_TYPE = {
  cash: 'cash',
  cartes: 'cartes',
  cheques: 'cheques',
  produits: 'produits',
  od: 'od',
  devises: 'devises',
} as const;

type FermetureColumnType = (typeof FERMETURE_COLUMN_TYPE)[keyof typeof FERMETURE_COLUMN_TYPE];

interface FermetureRecapColumn {
  type: FermetureColumnType;
  label: string;
  montantAttendu: number;
  montantCompte: number;
  ecart: number;
}

interface FermetureRecapTableProps {
  columns: FermetureRecapColumn[];
  totalAttendu: number;
  totalCompte: number;
  totalEcart: number;
  deviseCode: string;
}

const ECART_THRESHOLD = 5;

function formatCurrency(value: number, devise: string): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: devise,
  }).format(value);
}

function getEcartColor(ecart: number): string {
  const abs = Math.abs(ecart);
  if (abs === 0) return 'text-green-600';
  if (abs > ECART_THRESHOLD) return 'text-red-600 font-semibold';
  return 'text-orange-600';
}

function getEcartBgColor(ecart: number): string {
  const abs = Math.abs(ecart);
  if (abs === 0) return '';
  if (abs > ECART_THRESHOLD) return 'bg-red-50';
  return 'bg-orange-50';
}

export function FermetureRecapTable({
  columns,
  totalAttendu,
  totalCompte,
  totalEcart,
  deviseCode,
}: FermetureRecapTableProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-on-surface">Recap par type de paiement</h3>

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm border border-border rounded-md">
          <thead>
            <tr className="bg-surface-dim">
              <th className="text-left px-3 py-2 font-medium text-on-surface-muted">Type</th>
              <th className="text-right px-3 py-2 font-medium text-on-surface-muted">Attendu</th>
              <th className="text-right px-3 py-2 font-medium text-on-surface-muted">Compte</th>
              <th className="text-right px-3 py-2 font-medium text-on-surface-muted">Ecart</th>
            </tr>
          </thead>
          <tbody>
            {columns.map((col) => (
              <tr
                key={col.type}
                className={cn(
                  'border-t border-border',
                  getEcartBgColor(col.ecart),
                )}
              >
                <td className="px-3 py-2 font-medium">{col.label}</td>
                <td className="text-right px-3 py-2">{formatCurrency(col.montantAttendu, deviseCode)}</td>
                <td className="text-right px-3 py-2">{formatCurrency(col.montantCompte, deviseCode)}</td>
                <td className={cn('text-right px-3 py-2', getEcartColor(col.ecart))}>
                  {formatCurrency(col.ecart, deviseCode)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className={cn('border-t-2 border-border font-bold', getEcartBgColor(totalEcart))}>
              <td className="px-3 py-2">Total</td>
              <td className="text-right px-3 py-2">{formatCurrency(totalAttendu, deviseCode)}</td>
              <td className="text-right px-3 py-2">{formatCurrency(totalCompte, deviseCode)}</td>
              <td className={cn('text-right px-3 py-2', getEcartColor(totalEcart))}>
                {formatCurrency(totalEcart, deviseCode)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Mobile stacked layout */}
      <div className="sm:hidden space-y-2">
        {columns.map((col) => (
          <div
            key={col.type}
            className={cn(
              'rounded-md border border-border p-3 space-y-1',
              getEcartBgColor(col.ecart),
            )}
          >
            <div className="font-medium text-sm">{col.label}</div>
            <div className="flex justify-between text-xs">
              <span className="text-on-surface-muted">Attendu</span>
              <span>{formatCurrency(col.montantAttendu, deviseCode)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-on-surface-muted">Compte</span>
              <span>{formatCurrency(col.montantCompte, deviseCode)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-on-surface-muted">Ecart</span>
              <span className={getEcartColor(col.ecart)}>
                {formatCurrency(col.ecart, deviseCode)}
              </span>
            </div>
          </div>
        ))}

        {/* Total card */}
        <div className={cn(
          'rounded-md border-2 border-border p-3 space-y-1 font-bold',
          getEcartBgColor(totalEcart),
        )}>
          <div className="text-sm">Total</div>
          <div className="flex justify-between text-xs">
            <span className="text-on-surface-muted font-medium">Attendu</span>
            <span>{formatCurrency(totalAttendu, deviseCode)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-on-surface-muted font-medium">Compte</span>
            <span>{formatCurrency(totalCompte, deviseCode)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-on-surface-muted font-medium">Ecart</span>
            <span className={getEcartColor(totalEcart)}>
              {formatCurrency(totalEcart, deviseCode)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export { FERMETURE_COLUMN_TYPE };
export type { FermetureRecapColumn, FermetureRecapTableProps, FermetureColumnType };
