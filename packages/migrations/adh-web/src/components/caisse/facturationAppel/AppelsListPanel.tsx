import { useState } from 'react';
import type { HistoriqueAppel, TypeCompte } from '@/types/facturationAppel';
import { DataGrid } from '@/components/ui';
import { Button, Dialog, Input } from '@/components/ui';
import { cn } from '@/lib/utils';

interface AppelsListPanelProps {
  appels: HistoriqueAppel[];
  isCloture: boolean;
  isLoading: boolean;
  onFacturer: (_appel: HistoriqueAppel, _numeroCompte: number, _filiation: number, _typeCompte: TypeCompte) => Promise<void>;
  onMarquerGratuit: (_appelId: number, _raison: string) => Promise<void>;
  className?: string;
}

export const AppelsListPanel = ({
  appels,
  isCloture,
  isLoading,
  onFacturer,
  onMarquerGratuit,
  className
}: AppelsListPanelProps) => {
  const [facturationDialogOpen, setFacturationDialogOpen] = useState(false);
  const [gratuitDialogOpen, setGratuitDialogOpen] = useState(false);
  const [selectedAppel, setSelectedAppel] = useState<HistoriqueAppel | null>(null);
  const [numeroCompte, setNumeroCompte] = useState('');
  const [filiation, setFiliation] = useState('');
  const [typeCompte, setTypeCompte] = useState<TypeCompte>('GO');
  const [raisonGratuite, setRaisonGratuite] = useState('');

  const handleFacturerClick = (appel: HistoriqueAppel) => {
    setSelectedAppel(appel);
    setNumeroCompte('');
    setFiliation('');
    setTypeCompte('GO');
    setFacturationDialogOpen(true);
  };

  const handleGratuitClick = (appel: HistoriqueAppel) => {
    setSelectedAppel(appel);
    setRaisonGratuite('');
    setGratuitDialogOpen(true);
  };

  const handleFacturerSubmit = async () => {
    if (!selectedAppel) return;
    const compte = parseInt(numeroCompte, 10);
    const fil = parseInt(filiation, 10);
    if (isNaN(compte) || isNaN(fil)) return;

    await onFacturer(selectedAppel, compte, fil, typeCompte);
    setFacturationDialogOpen(false);
    setSelectedAppel(null);
  };

  const handleGratuitSubmit = async () => {
    if (!selectedAppel || !selectedAppel.id || !raisonGratuite.trim()) return;
    await onMarquerGratuit(selectedAppel.id, raisonGratuite);
    setGratuitDialogOpen(false);
    setSelectedAppel(null);
  };

  const columns = [
    {
      key: 'dateAppel',
      label: 'Date',
      render: (row: HistoriqueAppel) => row.dateAppel.toLocaleDateString('fr-FR')
    },
    {
      key: 'heureAppel',
      label: 'Heure',
      render: (row: HistoriqueAppel) => row.heureAppel
    },
    {
      key: 'numeroTel',
      label: 'Numéro',
      render: (row: HistoriqueAppel) => row.numeroTel
    },
    {
      key: 'duree',
      label: 'Durée',
      render: (row: HistoriqueAppel) => row.duree
    },
    {
      key: 'montant',
      label: 'Montant',
      render: (row: HistoriqueAppel) => `${row.montant.toFixed(2)} €`
    },
    {
      key: 'qualite',
      label: 'Qualité',
      render: (row: HistoriqueAppel) => row.qualite || '-'
    },
    {
      key: 'gratuite',
      label: 'Gratuit',
      render: (row: HistoriqueAppel) => (
        <span className={cn(row.gratuite && 'text-green-600 font-semibold')}>
          {row.gratuite ? 'Oui' : 'Non'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row: HistoriqueAppel) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => handleFacturerClick(row)}
            disabled={row.facture || row.gratuite || isCloture || isLoading}
          >
            Facturer
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleGratuitClick(row)}
            disabled={row.facture || row.gratuite || isCloture || isLoading}
          >
            Gratuit
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className={cn('space-y-4', className)}>
      {isCloture && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded">
          Clôture en cours - Facturation désactivée
        </div>
      )}

      <DataGrid
        data={appels}
        columns={columns}
        emptyMessage="Aucun appel trouvé"
        className="border rounded"
      />

      <Dialog open={facturationDialogOpen} onOpenChange={setFacturationDialogOpen}>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Facturer l'appel</Dialog.Title>
          </Dialog.Header>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-1">Numéro de compte</label>
              <Input
                type="number"
                value={numeroCompte}
                onChange={(e) => setNumeroCompte(e.target.value)}
                placeholder="Ex: 12345"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Filiation</label>
              <Input
                type="number"
                value={filiation}
                onChange={(e) => setFiliation(e.target.value)}
                placeholder="Ex: 1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type de compte</label>
              <select
                value={typeCompte}
                onChange={(e) => setTypeCompte(e.target.value as TypeCompte)}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="GO">GO</option>
                <option value="GM">GM</option>
              </select>
            </div>
          </div>
          <Dialog.Footer>
            <Button variant="outline" onClick={() => setFacturationDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleFacturerSubmit} disabled={!numeroCompte || !filiation}>
              Facturer
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>

      <Dialog open={gratuitDialogOpen} onOpenChange={setGratuitDialogOpen}>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Marquer comme gratuit</Dialog.Title>
          </Dialog.Header>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-1">Raison</label>
              <Input
                value={raisonGratuite}
                onChange={(e) => setRaisonGratuite(e.target.value)}
                placeholder="Ex: Appel de service"
              />
            </div>
          </div>
          <Dialog.Footer>
            <Button variant="outline" onClick={() => setGratuitDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleGratuitSubmit} disabled={!raisonGratuite.trim()}>
              Marquer gratuit
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </div>
  );
};