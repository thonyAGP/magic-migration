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
import type { VRLIdentity } from '@/types/transaction-lot2';

interface VRLIdentityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: VRLIdentity;
  onValidate: (identity: VRLIdentity) => void;
}

const DOCUMENT_TYPES = [
  { value: 'CNI', label: 'Carte nationale identite' },
  { value: 'PASSPORT', label: 'Passeport' },
  { value: 'PERMIS', label: 'Permis de conduire' },
  { value: 'AUTRE', label: 'Autre' },
];

export function VRLIdentityDialog({
  open,
  onOpenChange,
  initialData,
  onValidate,
}: VRLIdentityDialogProps) {
  const [nom, setNom] = useState(initialData?.nom ?? '');
  const [prenom, setPrenom] = useState(initialData?.prenom ?? '');
  const [typeDocument, setTypeDocument] = useState(initialData?.typeDocument ?? '');
  const [numeroDocument, setNumeroDocument] = useState(initialData?.numeroDocument ?? '');

  const isValid = nom.trim() && prenom.trim() && typeDocument && numeroDocument.trim();

  const handleValidate = useCallback(() => {
    if (!isValid) return;
    onValidate({
      nom: nom.trim(),
      prenom: prenom.trim(),
      typeDocument,
      numeroDocument: numeroDocument.trim(),
    });
  }, [nom, prenom, typeDocument, numeroDocument, isValid, onValidate]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Identite VRL</DialogTitle>
          <DialogDescription>
            Saisir les informations d'identite pour la VRL
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label required>Nom</Label>
              <Input
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Nom"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label required>Prenom</Label>
              <Input
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                placeholder="Prenom"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label required>Type de document</Label>
            <select
              value={typeDocument}
              onChange={(e) => setTypeDocument(e.target.value)}
              className="h-9 rounded-md border border-border bg-surface px-3 text-sm"
            >
              <option value="">Choisir...</option>
              {DOCUMENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label required>Numero de document</Label>
            <Input
              value={numeroDocument}
              onChange={(e) => setNumeroDocument(e.target.value)}
              placeholder="Numero"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleValidate} disabled={!isValid}>
            Valider identite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
