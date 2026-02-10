import { useState, useMemo, useCallback } from 'react';
import { Button, Input } from '@/components/ui';
import { Plus, X } from 'lucide-react';
import { factureLigneSchema } from './schemas';
import type { FactureLigneGridProps } from './types';

const TAUX_TVA_OPTIONS = [
  { value: 0, label: '0%' },
  { value: 5.5, label: '5,5%' },
  { value: 10, label: '10%' },
  { value: 20, label: '20%' },
];

const formatEUR = (value: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);

const round2 = (x: number) => Math.round(x * 100) / 100;

export function FactureLigneGrid({
  lignes,
  onAddLigne,
  onRemoveLigne,
  isEditable = true,
}: FactureLigneGridProps) {
  const [codeArticle, setCodeArticle] = useState('');
  const [libelle, setLibelle] = useState('');
  const [quantite, setQuantite] = useState<number>(1);
  const [prixUnitaireHT, setPrixUnitaireHT] = useState<number>(0);
  const [tauxTVA, setTauxTVA] = useState<number>(20);
  const [error, setError] = useState('');

  const totals = useMemo(() => {
    const totalHT = lignes.reduce((sum, l) => sum + l.montantHT, 0);
    const totalTTC = lignes.reduce((sum, l) => sum + l.montantTTC, 0);
    return { totalHT: round2(totalHT), totalTTC: round2(totalTTC) };
  }, [lignes]);

  const handleAdd = useCallback(() => {
    const data = {
      codeArticle,
      libelle,
      quantite,
      prixUnitaireHT,
      tauxTVA,
    };

    const result = factureLigneSchema.safeParse(data);
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    setError('');
    onAddLigne(result.data);
    setCodeArticle('');
    setLibelle('');
    setQuantite(1);
    setPrixUnitaireHT(0);
    setTauxTVA(20);
  }, [codeArticle, libelle, quantite, prixUnitaireHT, tauxTVA, onAddLigne]);

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs font-medium text-on-surface-muted py-2 px-3">Code</th>
              <th className="text-left text-xs font-medium text-on-surface-muted py-2 px-3">Libelle</th>
              <th className="text-right text-xs font-medium text-on-surface-muted py-2 px-3">Qte</th>
              <th className="text-right text-xs font-medium text-on-surface-muted py-2 px-3">Prix HT</th>
              <th className="text-right text-xs font-medium text-on-surface-muted py-2 px-3">TVA %</th>
              <th className="text-right text-xs font-medium text-on-surface-muted py-2 px-3">Montant HT</th>
              <th className="text-right text-xs font-medium text-on-surface-muted py-2 px-3">Montant TTC</th>
              {isEditable && (
                <th className="text-center text-xs font-medium text-on-surface-muted py-2 px-3" />
              )}
            </tr>
          </thead>
          <tbody>
            {lignes.length === 0 ? (
              <tr>
                <td
                  colSpan={isEditable ? 8 : 7}
                  className="text-center text-sm text-on-surface-muted py-6"
                >
                  Aucune ligne
                </td>
              </tr>
            ) : (
              lignes.map((ligne, index) => (
                <tr key={ligne.id || index} className="border-b border-border/50">
                  <td className="text-sm py-2 px-3">{ligne.codeArticle}</td>
                  <td className="text-sm py-2 px-3">{ligne.libelle}</td>
                  <td className="text-sm py-2 px-3 text-right">{ligne.quantite}</td>
                  <td className="text-sm py-2 px-3 text-right">{formatEUR(ligne.prixUnitaireHT)}</td>
                  <td className="text-sm py-2 px-3 text-right">{ligne.tauxTVA}%</td>
                  <td className="text-sm py-2 px-3 text-right">{formatEUR(ligne.montantHT)}</td>
                  <td className="text-sm py-2 px-3 text-right">{formatEUR(ligne.montantTTC)}</td>
                  {isEditable && (
                    <td className="text-center py-2 px-3">
                      <button
                        type="button"
                        onClick={() => onRemoveLigne(index)}
                        className="text-danger hover:text-danger/80"
                        aria-label="Supprimer la ligne"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
          {lignes.length > 0 && (
            <tfoot>
              <tr className="border-t border-border">
                <td colSpan={5} className="text-sm py-2 px-3 font-semibold text-right">
                  Total
                </td>
                <td className="text-sm py-2 px-3 text-right font-semibold">
                  {formatEUR(totals.totalHT)}
                </td>
                <td className="text-sm py-2 px-3 text-right font-semibold">
                  {formatEUR(totals.totalTTC)}
                </td>
                {isEditable && <td />}
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Add line form */}
      {isEditable && (
        <div className="space-y-2 rounded-md border border-border/50 bg-surface-dim p-3">
          <div className="grid grid-cols-5 gap-2">
            <Input
              value={codeArticle}
              onChange={(e) => setCodeArticle(e.target.value)}
              placeholder="Code article"
              className="text-sm"
            />
            <Input
              value={libelle}
              onChange={(e) => setLibelle(e.target.value)}
              placeholder="Libelle"
              className="text-sm"
            />
            <Input
              type="number"
              min={1}
              value={quantite || ''}
              onChange={(e) => setQuantite(Number(e.target.value) || 0)}
              placeholder="Qte"
              className="text-sm text-right"
            />
            <Input
              type="number"
              min={0}
              step={0.01}
              value={prixUnitaireHT || ''}
              onChange={(e) => setPrixUnitaireHT(Number(e.target.value) || 0)}
              placeholder="Prix HT"
              className="text-sm text-right"
            />
            <div className="flex gap-2">
              <select
                value={tauxTVA}
                onChange={(e) => setTauxTVA(Number(e.target.value))}
                className="h-9 flex-1 rounded-md border border-border bg-surface px-2 text-sm"
              >
                {TAUX_TVA_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <Button size="sm" onClick={handleAdd} aria-label="Ajouter une ligne">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {error && <p className="text-xs text-danger">{error}</p>}
        </div>
      )}
    </div>
  );
}
