import { useState } from 'react';
import { Button, Dialog, Input } from '@/components/ui';
import { useFacturationAppelStore } from '@/stores/facturationAppelStore';
import type { HistoriqueAppel, FacturationRequest } from '@/types/facturationAppel';
import { cn } from '@/lib/utils';

interface FacturationPanelProps {
  className?: string;
}

export const FacturationPanel = ({ className }: FacturationPanelProps) => {
  const [showFacturationDialog, setShowFacturationDialog] = useState(false);
  const [showGratuitDialog, setShowGratuitDialog] = useState(false);
  const [selectedAppel, setSelectedAppel] = useState<HistoriqueAppel | null>(null);
  const [numeroCompte, setNumeroCompte] = useState('');
  const [filiation, setFiliation] = useState('');
  const [typeCompte, setTypeCompte] = useState<'GO' | 'GM'>('GO');
  const [raisonGratuite, setRaisonGratuite] = useState('');

  const facturerAppel = useFacturationAppelStore((s) => s.facturerAppel);
  const marquerGratuit = useFacturationAppelStore((s) => s.marquerGratuit);
  const annulerFacturation = useFacturationAppelStore((s) => s.annulerFacturation);
  const verifierCloture = useFacturationAppelStore((s) => s.verifierCloture);
  const isLoading = useFacturationAppelStore((s) => s.isLoading);

  const _handleFacturer = async (appel: HistoriqueAppel) => {
    const estCloture = await verifierCloture();
    if (estCloture) {
      alert('Impossible de facturer : le réseau est clôturé');
      return;
    }

    setSelectedAppel(appel);
    setShowFacturationDialog(true);
  };

  const _handleMarquerGratuit = (appel: HistoriqueAppel) => {
    setSelectedAppel(appel);
    setShowGratuitDialog(true);
  };

  const _handleAnnuler = async (appel: HistoriqueAppel) => {
    if (!appel.id) return;
    
    if (!confirm('Confirmer l\'annulation de la facturation ?')) return;

    await annulerFacturation(appel.id);
  };

  const confirmerFacturation = async () => {
    if (!selectedAppel || !numeroCompte || !filiation) return;

    const request: FacturationRequest = {
      appel: selectedAppel,
      numeroCompte: parseInt(numeroCompte, 10),
      filiation: parseInt(filiation, 10),
      typeCompte,
    };

    await facturerAppel(request);
    setShowFacturationDialog(false);
    resetFacturationForm();
  };

  const confirmerGratuit = async () => {
    if (!selectedAppel?.id || !raisonGratuite.trim()) return;

    await marquerGratuit(selectedAppel.id, raisonGratuite);
    setShowGratuitDialog(false);
    resetGratuitForm();
  };

  const resetFacturationForm = () => {
    setSelectedAppel(null);
    setNumeroCompte('');
    setFiliation('');
    setTypeCompte('GO');
  };

  const resetGratuitForm = () => {
    setSelectedAppel(null);
    setRaisonGratuite('');
  };

  return (
    <>
      <div className={cn('space-y-4', className)}>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="mb-2 text-sm font-semibold text-gray-900">
            Actions de facturation
          </h3>
          <p className="text-xs text-gray-600">
            Sélectionnez un appel dans l'historique pour le facturer, le marquer gratuit ou annuler sa facturation.
          </p>
        </div>
      </div>

      <Dialog
        isOpen={showFacturationDialog}
        onClose={() => {
          setShowFacturationDialog(false);
          resetFacturationForm();
        }}
        title="Facturer un appel"
      >
        <div className="space-y-4">
          {selectedAppel && (
            <div className="rounded bg-gray-50 p-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="font-medium">Date :</span>{' '}
                  {new Date(selectedAppel.dateAppel).toLocaleDateString('fr-FR')}
                </div>
                <div>
                  <span className="font-medium">Heure :</span> {selectedAppel.heureAppel}
                </div>
                <div>
                  <span className="font-medium">Numéro :</span> {selectedAppel.numeroTel}
                </div>
                <div>
                  <span className="font-medium">Durée :</span> {selectedAppel.duree}
                </div>
                <div className="col-span-2">
                  <span className="font-medium">Montant :</span> {selectedAppel.montant.toFixed(2)} €
                </div>
              </div>
            </div>
          )}

          <Input
            label="Numéro de compte"
            type="number"
            value={numeroCompte}
            onChange={(e) => setNumeroCompte(e.target.value)}
            placeholder="Ex: 12345"
          />

          <Input
            label="Filiation"
            type="number"
            value={filiation}
            onChange={(e) => setFiliation(e.target.value)}
            placeholder="Ex: 1"
          />

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Type de compte
            </label>
            <select
              value={typeCompte}
              onChange={(e) => setTypeCompte(e.target.value as 'GO' | 'GM')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="GO">GO - Guest</option>
              <option value="GM" >GM - Member</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setShowFacturationDialog(false);
                resetFacturationForm();
              }}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              onClick={confirmerFacturation}
              disabled={!numeroCompte || !filiation || isLoading}
            >
              {isLoading ? 'Facturation...' : 'Facturer'}
            </Button>
          </div>
        </div>
      </Dialog>

      <Dialog
        isOpen={showGratuitDialog}
        onClose={() => {
          setShowGratuitDialog(false);
          resetGratuitForm();
        }}
        title="Marquer un appel gratuit"
      >
        <div className="space-y-4">
          {selectedAppel && (
            <div className="rounded bg-gray-50 p-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="font-medium">Date :</span>{' '}
                  {new Date(selectedAppel.dateAppel).toLocaleDateString('fr-FR')}
                </div>
                <div>
                  <span className="font-medium">Numéro :</span> {selectedAppel.numeroTel}
                </div>
                <div className="col-span-2">
                  <span className="font-medium">Montant :</span> {selectedAppel.montant.toFixed(2)} €
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Raison de la gratuité
            </label>
            <textarea
              value={raisonGratuite}
              onChange={(e) => setRaisonGratuite(e.target.value)}
              placeholder="Ex: Problème de qualité, interruption..."
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setShowGratuitDialog(false);
                resetGratuitForm();
              }}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              onClick={confirmerGratuit}
              disabled={!raisonGratuite.trim() || isLoading}
            >
              {isLoading ? 'Enregistrement...' : 'Confirmer'}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
};