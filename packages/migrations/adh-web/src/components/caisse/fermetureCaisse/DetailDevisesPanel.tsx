import { useMemo } from 'react';
import { useFermetureCaisseStore } from '@/stores/fermetureCaisseStore';
import { cn } from '@/lib/utils';

interface DetailDevisesPanelProps {
  className?: string;
}

interface DetailDeviseRow {
  codeDevise: string;
  libelle: string;
  montantOuverture: number;
  montantCompte: number;
  montantCalcule: number;
  ecart: number;
}

const DEVISE_LABELS: Record<string, string> = {
  'EUR': 'Euro',
  'USD': 'Dollar US',
  'GBP': 'Livre Sterling',
  'CHF': 'Franc Suisse',
  'JPY': 'Yen',
  'CAD': 'Dollar Canadien',
  'AUD': 'Dollar Australien',
} as const;

export const DetailDevisesPanel = ({ className }: DetailDevisesPanelProps) => {
  const pointagesDevise = useFermetureCaisseStore((s) => s.pointagesDevise);
  const recapFermeture = useFermetureCaisseStore((s) => s.recapFermeture);

  const rows = useMemo<DetailDeviseRow[]>(() => {
    const deviseMap = new Map<string, DetailDeviseRow>();

    pointagesDevise.forEach((p) => {
      deviseMap.set(p.codeDevise, {
        codeDevise: p.codeDevise,
        libelle: DEVISE_LABELS[p.codeDevise] || p.codeDevise,
        montantOuverture: p.montantOuverture,
        montantCompte: p.montantCompte,
        montantCalcule: p.montantCalcule,
        ecart: p.ecart,
      });
    });

    recapFermeture?.moyensPaiement.forEach((mp) => {
      if (!deviseMap.has(mp.code) && mp.code.length === 3 && mp.code.toUpperCase() === mp.code) {
        deviseMap.set(mp.code, {
          codeDevise: mp.code,
          libelle: DEVISE_LABELS[mp.code] || mp.code,
          montantOuverture: mp.soldeOuverture,
          montantCompte: mp.montantCompte,
          montantCalcule: mp.montantCalcule,
          ecart: mp.ecart,
        });
      }
    });

    return Array.from(deviseMap.values()).sort((a, b) => 
      a.codeDevise.localeCompare(b.codeDevise)
    );
  }, [pointagesDevise, recapFermeture]);

  const formatMontant = (value: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const getEcartClass = (ecart: number): string => {
    if (ecart === 0) return 'text-green-600';
    if (Math.abs(ecart) < 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Détail des devises comptées</h2>
        <span className="text-sm text-gray-600">
          {rows.length} devise{rows.length > 1 ? 's' : ''}
        </span>
      </div>

      {rows.length === 0 ? (
        <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500">Aucune devise comptée</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-300 rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b border-gray-300">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Code devise</th>
                <th className="px-4 py-2 text-left font-semibold">Libellé</th>
                <th className="px-4 py-2 text-right font-semibold">Montant ouverture</th>
                <th className="px-4 py-2 text-right font-semibold">Montant compté</th>
                <th className="px-4 py-2 text-right font-semibold">Montant calculé</th>
                <th className="px-4 py-2 text-right font-semibold">Écart</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr 
                  key={row.codeDevise}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="px-4 py-2 font-mono">{row.codeDevise}</td>
                  <td className="px-4 py-2">{row.libelle}</td>
                  <td className="px-4 py-2 text-right font-mono">
                    {formatMontant(row.montantOuverture)}
                  </td>
                  <td className="px-4 py-2 text-right font-mono">
                    {formatMontant(row.montantCompte)}
                  </td>
                  <td className="px-4 py-2 text-right font-mono">
                    {formatMontant(row.montantCalcule)}
                  </td>
                  <td className={cn(
                    'px-4 py-2 text-right font-mono font-semibold',
                    getEcartClass(row.ecart)
                  )}>
                    {row.ecart >= 0 ? '+' : ''}{formatMontant(row.ecart)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-100 border-t-2 border-gray-300">
              <tr>
                <td colSpan={2} className="px-4 py-2 font-semibold">Total</td>
                <td className="px-4 py-2 text-right font-mono font-semibold">
                  {formatMontant(rows.reduce((sum, r) => sum + r.montantOuverture, 0))}
                </td>
                <td className="px-4 py-2 text-right font-mono font-semibold">
                  {formatMontant(rows.reduce((sum, r) => sum + r.montantCompte, 0))}
                </td>
                <td className="px-4 py-2 text-right font-mono font-semibold">
                  {formatMontant(rows.reduce((sum, r) => sum + r.montantCalcule, 0))}
                </td>
                <td className={cn(
                  'px-4 py-2 text-right font-mono font-semibold',
                  getEcartClass(rows.reduce((sum, r) => sum + r.ecart, 0))
                )}>
                  {(() => {
                    const totalEcart = rows.reduce((sum, r) => sum + r.ecart, 0);
                    return `${totalEcart >= 0 ? '+' : ''}${formatMontant(totalEcart)}`;
                  })()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
};