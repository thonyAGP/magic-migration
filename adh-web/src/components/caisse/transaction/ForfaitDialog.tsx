import { useState, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { Label } from '@/components/ui';
import type { ForfaitData } from '@/types/transaction-lot2';

interface ForfaitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  catalogForfaits: ForfaitData[];
  onValidate: (dateDebut: string, dateFin: string) => void;
}

/** Calculate the number of days between two date strings (inclusive). */
function calculateDays(dateDebut: string, dateFin: string): number {
  const start = new Date(dateDebut + 'T00:00:00');
  const end = new Date(dateFin + 'T00:00:00');
  const diffMs = end.getTime() - start.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);

export function ForfaitDialog({
  open,
  onOpenChange,
  catalogForfaits,
  onValidate,
}: ForfaitDialogProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [dateDebut, setDateDebut] = useState(today);
  const [dateFin, setDateFin] = useState('');
  const [selectedForfait, setSelectedForfait] = useState<string>('');

  const activeForfait = useMemo(
    () => catalogForfaits.find((f) => f.code === selectedForfait),
    [catalogForfaits, selectedForfait],
  );

  const forfaitCalc = useMemo(() => {
    if (!dateDebut || !dateFin || dateDebut > dateFin) return null;
    const nbJours = calculateDays(dateDebut, dateFin);
    const prixParJour = activeForfait?.prixParJour ?? 0;
    return {
      prixParJour,
      nbJours,
      total: Math.round(prixParJour * nbJours * 100) / 100,
    };
  }, [dateDebut, dateFin, activeForfait]);

  const handleForfaitSelect = useCallback(
    (code: string) => {
      setSelectedForfait(code);
      const forfait = catalogForfaits.find((f) => f.code === code);
      if (forfait) {
        setDateDebut(forfait.dateDebut);
        setDateFin(forfait.dateFin);
      }
    },
    [catalogForfaits],
  );

  const handleValidate = useCallback(() => {
    if (dateDebut && dateFin) {
      onValidate(dateDebut, dateFin);
    }
  }, [dateDebut, dateFin, onValidate]);

  const isValid = dateDebut && dateFin && dateDebut <= dateFin;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Dates forfait</DialogTitle>
          <DialogDescription>
            Definir les dates de debut et fin du forfait
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {catalogForfaits.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <Label>Forfait predifini</Label>
              <select
                value={selectedForfait}
                onChange={(e) => handleForfaitSelect(e.target.value)}
                className="h-9 rounded-md border border-border bg-surface px-3 text-sm"
              >
                <option value="">Manuel</option>
                {catalogForfaits.map((f) => (
                  <option key={f.code} value={f.code}>
                    {f.libelle}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label required>Date debut</Label>
              <Input
                type="date"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label required>Date fin</Label>
              <Input
                type="date"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
                min={dateDebut}
              />
            </div>
          </div>

          {dateDebut && dateFin && dateDebut > dateFin && (
            <div className="text-xs text-danger">
              La date de fin doit etre superieure ou egale a la date de debut
            </div>
          )}

          {/* Calcul forfait prix x jours */}
          {forfaitCalc && forfaitCalc.prixParJour > 0 && (
            <div className="rounded-md bg-surface-dim p-3 text-sm space-y-1" data-testid="forfait-calc">
              <div className="flex justify-between">
                <span className="text-on-surface-muted">Prix/jour</span>
                <span className="font-medium">{formatCurrency(forfaitCalc.prixParJour)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-muted">Nombre de jours</span>
                <span className="font-medium">{forfaitCalc.nbJours}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-1">
                <span className="font-medium">Total</span>
                <span className="font-bold">
                  {formatCurrency(forfaitCalc.prixParJour)} x {forfaitCalc.nbJours} = {formatCurrency(forfaitCalc.total)}
                </span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleValidate} disabled={!isValid}>
            Valider dates
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
