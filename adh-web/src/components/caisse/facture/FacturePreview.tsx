import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  Badge,
  Button,
} from '@/components/ui';
import { FileText, Printer } from 'lucide-react';
import type { FacturePreviewProps } from './types';

const formatEUR = (value: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);

const formatDate = (dateStr: string) =>
  new Intl.DateTimeFormat('fr-FR').format(new Date(dateStr));

const statutVariant = (statut: string) => {
  switch (statut) {
    case 'brouillon': return 'secondary' as const;
    case 'emise': return 'default' as const;
    case 'payee': return 'outline' as const;
    case 'annulee': return 'destructive' as const;
    default: return 'secondary' as const;
  }
};

export function FacturePreview({
  open,
  facture,
  onClose,
  onPrint,
  isPrinting = false,
}: FacturePreviewProps) {
  if (!facture) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Apercu facture #{facture.reference}
          </DialogTitle>
          <DialogDescription>
            Apercu avant impression de la facture
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Header info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-on-surface-muted">Reference :</span>{' '}
              <span className="font-medium">{facture.reference}</span>
            </div>
            <div>
              <span className="text-on-surface-muted">Date :</span>{' '}
              <span className="font-medium">{formatDate(facture.dateEmission)}</span>
            </div>
            <div>
              <span className="text-on-surface-muted">Type :</span>{' '}
              <Badge variant={facture.type === 'facture' ? 'default' : 'secondary'}>
                {facture.type}
              </Badge>
            </div>
            <div>
              <span className="text-on-surface-muted">Statut :</span>{' '}
              <Badge variant={statutVariant(facture.statut)}>
                {facture.statut}
              </Badge>
            </div>
          </div>

          {/* Client */}
          <div className="rounded-md border border-border/50 p-3 text-sm">
            <p className="font-medium">{facture.nomAdherent}</p>
            <p className="text-on-surface-muted">
              Code : {facture.codeAdherent} | Filiation : {facture.filiation}
            </p>
          </div>

          {/* Lines table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-on-surface-muted py-2 px-3">Code</th>
                  <th className="text-left text-xs font-medium text-on-surface-muted py-2 px-3">Libelle</th>
                  <th className="text-right text-xs font-medium text-on-surface-muted py-2 px-3">Qte</th>
                  <th className="text-right text-xs font-medium text-on-surface-muted py-2 px-3">Prix HT</th>
                  <th className="text-right text-xs font-medium text-on-surface-muted py-2 px-3">TVA %</th>
                  <th className="text-right text-xs font-medium text-on-surface-muted py-2 px-3">Montant TTC</th>
                </tr>
              </thead>
              <tbody>
                {facture.lignes.map((ligne) => (
                  <tr key={ligne.id} className="border-b border-border/50">
                    <td className="text-sm py-2 px-3">{ligne.codeArticle}</td>
                    <td className="text-sm py-2 px-3">{ligne.libelle}</td>
                    <td className="text-sm py-2 px-3 text-right">{ligne.quantite}</td>
                    <td className="text-sm py-2 px-3 text-right">{formatEUR(ligne.prixUnitaireHT)}</td>
                    <td className="text-sm py-2 px-3 text-right">{ligne.tauxTVA}%</td>
                    <td className="text-sm py-2 px-3 text-right">{formatEUR(ligne.montantTTC)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="space-y-1 border-t border-border pt-3">
            <div className="flex justify-between text-sm">
              <span className="text-on-surface-muted">Total HT</span>
              <span className="font-medium">{formatEUR(facture.totalHT)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-on-surface-muted">Total TVA</span>
              <span className="font-medium">{formatEUR(facture.totalTVA)}</span>
            </div>
            <div className="flex justify-between rounded-md bg-primary/10 px-3 py-2 text-base font-bold text-primary">
              <span>Total TTC</span>
              <span>{formatEUR(facture.totalTTC)}</span>
            </div>
          </div>

          {/* Commentaire */}
          {facture.commentaire && (
            <div className="rounded-md border border-border/50 bg-surface-dim p-3 text-sm">
              <span className="text-on-surface-muted">Commentaire : </span>
              {facture.commentaire}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPrinting}>
            Fermer
          </Button>
          <Button onClick={onPrint} disabled={isPrinting}>
            <Printer className="mr-2 h-4 w-4" />
            {isPrinting ? 'Impression...' : 'Imprimer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
