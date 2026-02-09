import { useState, useCallback } from 'react';
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
