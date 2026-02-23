import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenLayout } from '@/components/layout';
import { Button, Input, Dialog } from '@/components/ui';
import { useGestionChequeStore } from '@/stores/gestionChequeStore';
import { useAuthStore } from '@/stores';
import { cn } from '@/lib/utils';
import type { Cheque, ChequeOperationType } from '@/types/gestionCheque';

type Phase = 'form' | 'historique';

export function GestionChequePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const societe = 'ADH';
  const compte = user?.compte || '';
  const filiation = user?.filiation || '';

  const cheques = useGestionChequeStore((s) => s.cheques);
  const _selectedCheque = useGestionChequeStore((s) => s.selectedCheque);
  const isLoading = useGestionChequeStore((s) => s.isLoading);
  const error = useGestionChequeStore((s) => s.error);
  const filters = useGestionChequeStore((s) => s.filters);
  const totalDepots = useGestionChequeStore((s) => s.totalDepots);
  const totalRetraits = useGestionChequeStore((s) => s.totalRetraits);
  const setFilters = useGestionChequeStore((s) => s.setFilters);
  const enregistrerDepot = useGestionChequeStore((s) => s.enregistrerDepot);
  const enregistrerRetrait = useGestionChequeStore((s) => s.enregistrerRetrait);
  const validerCheque = useGestionChequeStore((s) => s.validerCheque);
  const listerChequesCompte = useGestionChequeStore((s) => s.listerChequesCompte);
  const calculerTotaux = useGestionChequeStore((s) => s.calculerTotaux);
  const reset = useGestionChequeStore((s) => s.reset);

  const [phase, setPhase] = useState<Phase>('form');
  const [numeroCheque, setNumeroCheque] = useState('');
  const [montant, setMontant] = useState('');
  const [dateEmission, setDateEmission] = useState('');
  const [banque, setBanque] = useState('');
  const [titulaire, setTitulaire] = useState('');
  const [typeOperation, setTypeOperation] = useState<ChequeOperationType>('depot');
  const [estPostdate, setEstPostdate] = useState(false);
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [filtrePostdates, setFiltrePostdates] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    return () => reset();
  }, [reset]);

  const loadHistorique = useCallback(async () => {
    if (!societe || !compte || !filiation) return;
    await listerChequesCompte(societe, compte, filiation, filters);
    await calculerTotaux(societe, compte, filiation);
  }, [societe, compte, filiation, filters, listerChequesCompte, calculerTotaux]);

  useEffect(() => {
    if (phase === 'historique') {
      loadHistorique();
    }
  }, [phase, filters, loadHistorique]);

  const handleValidation = useCallback(async () => {
    if (!numeroCheque || !dateEmission) return;
    
    const result = await validerCheque(numeroCheque, new Date(dateEmission));
    setEstPostdate(result.estPostdate);
    
    if (!result.valide && result.erreur) {
      alert(result.erreur);
    }
  }, [numeroCheque, dateEmission, validerCheque]);

  const handleSubmit = useCallback(async () => {
    if (!numeroCheque || !montant || !dateEmission) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const cheque: Cheque = {
      numeroCheque,
      montant: parseFloat(montant),
      dateEmission: new Date(dateEmission),
      banque: banque || null,
      titulaire: titulaire || null,
      estPostdate,
    };

    try {
      if (typeOperation === 'depot') {
        await enregistrerDepot(cheque, societe, compte, filiation);
      } else {
        await enregistrerRetrait(cheque, societe, compte, filiation);
      }

      setNumeroCheque('');
      setMontant('');
      setDateEmission('');
      setBanque('');
      setTitulaire('');
      setEstPostdate(false);
      setShowConfirmDialog(false);
      
      alert(`${typeOperation === 'depot' ? 'Dépôt' : 'Retrait'} enregistré avec succès`);
    } catch (err) {
      alert(`Erreur lors de l'enregistrement: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    }
  }, [numeroCheque, montant, dateEmission, banque, titulaire, estPostdate, typeOperation, enregistrerDepot, enregistrerRetrait, societe, compte, filiation]);

  const handleCancel = useCallback(() => {
    setNumeroCheque('');
    setMontant('');
    setDateEmission('');
    setBanque('');
    setTitulaire('');
    setEstPostdate(false);
  }, []);

  const handleApplyFilters = useCallback(() => {
    setFilters({
      dateDebut: dateDebut ? new Date(dateDebut) : undefined,
      dateFin: dateFin ? new Date(dateFin) : undefined,
      estPostdate: filtrePostdates ? true : undefined,
    });
  }, [dateDebut, dateFin, filtrePostdates, setFilters]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR').format(new Date(date));
  };

  return (
    <ScreenLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Gestion des Chèques</h2>
            <p className="text-on-surface-muted text-sm mt-1">
              {phase === 'form' ? 'Enregistrement de chèque' : 'Historique des chèques'}
            </p>
          </div>
          {user && (
            <span className="text-xs text-on-surface-muted">
              {user.prenom} {user.nom}
            </span>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-2 border-b border-border">
          <button
            onClick={() => setPhase('form')}
            className={cn(
              'px-4 py-2 border-b-2 transition-colors',
              phase === 'form'
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-on-surface-muted hover:text-on-surface'
            )}
          >
            Enregistrement
          </button>
          <button
            onClick={() => setPhase('historique')}
            className={cn(
              'px-4 py-2 border-b-2 transition-colors',
              phase === 'historique'
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-on-surface-muted hover:text-on-surface'
            )}
          >
            Historique
          </button>
        </div>

        {phase === 'form' && (
          <div className="space-y-6">
            <div className="bg-surface border border-border rounded-lg p-6 space-y-4">
              <h3 className="font-medium text-lg">Informations du chèque</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Numéro de chèque *</label>
                  <Input
                    value={numeroCheque}
                    onChange={(e) => setNumeroCheque(e.target.value)}
                    onBlur={handleValidation}
                    placeholder="CHQ-123456"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Montant *</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={montant}
                    onChange={(e) => setMontant(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Date d'émission *</label>
                  <Input
                    type="date"
                    value={dateEmission}
                    onChange={(e) => setDateEmission(e.target.value)}
                    onBlur={handleValidation}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Banque</label>
                  <Input
                    value={banque}
                    onChange={(e) => setBanque(e.target.value)}
                    placeholder="Nom de la banque"
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-medium">Titulaire</label>
                  <Input
                    value={titulaire}
                    onChange={(e) => setTitulaire(e.target.value)}
                    placeholder="Nom du titulaire"
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-medium">Statut</label>
                  <div className="flex items-center gap-2 px-3 py-2 bg-surface-hover border border-border rounded-md">
                    <input
                      type="checkbox"
                      checked={estPostdate}
                      disabled
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Chèque postdaté</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface border border-border rounded-lg p-6 space-y-4">
              <h3 className="font-medium text-lg">Type d'opération</h3>
              
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="typeOperation"
                    value="depot"
                    checked={typeOperation === 'depot'}
                    onChange={(e) => setTypeOperation(e.target.value as ChequeOperationType)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Dépôt</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="typeOperation"
                    value="retrait"
                    checked={typeOperation === 'retrait'}
                    onChange={(e) => setTypeOperation(e.target.value as ChequeOperationType)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Retrait</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setShowConfirmDialog(true)}
                  disabled={!numeroCheque || !montant || !dateEmission || isLoading}
                  className="bg-primary text-white hover:bg-primary-dark"
                >
                  {isLoading ? 'Enregistrement...' : 'Valider'}
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  disabled={isLoading}
                >
                  Annuler
                </Button>
              </div>
            </div>

            <div className="flex justify-start">
              <button
                onClick={() => navigate('/caisse/menu')}
                className="px-4 py-2 border border-border rounded-md text-on-surface hover:bg-surface-hover"
              >
                Retour au menu
              </button>
            </div>
          </div>
        )}

        {phase === 'historique' && (
          <div className="space-y-6">
            <div className="bg-surface border border-border rounded-lg p-6 space-y-4">
              <h3 className="font-medium text-lg">Filtres</h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date début</label>
                  <Input
                    type="date"
                    value={dateDebut}
                    onChange={(e) => setDateDebut(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Date fin</label>
                  <Input
                    type="date"
                    value={dateFin}
                    onChange={(e) => setDateFin(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium invisible">Action</label>
                  <Button onClick={handleApplyFilters} className="w-full">
                    Appliquer les filtres
                  </Button>
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filtrePostdates}
                  onChange={(e) => setFiltrePostdates(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm">Afficher uniquement les chèques postdatés</span>
              </label>
            </div>

            <div className="bg-surface border border-border rounded-lg overflow-hidden">
              {isLoading ? (
                <div className="p-8 text-center text-on-surface-muted">
                  Chargement de l'historique...
                </div>
              ) : cheques.length === 0 ? (
                <div className="p-8 text-center text-on-surface-muted">
                  Aucun chèque trouvé
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-surface-hover border-b border-border">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium">Numéro</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                        <th className="px-4 py-3 text-right text-sm font-medium">Montant</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Banque</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Titulaire</th>
                        <th className="px-4 py-3 text-center text-sm font-medium">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {cheques.map((cheque, idx) => (
                        <tr key={idx} className="hover:bg-surface-hover">
                          <td className="px-4 py-3 text-sm font-mono">{cheque.numeroCheque}</td>
                          <td className="px-4 py-3 text-sm">{formatDate(cheque.dateEmission)}</td>
                          <td className="px-4 py-3 text-sm text-right font-medium">
                            {formatCurrency(cheque.montant)}
                          </td>
                          <td className="px-4 py-3 text-sm">{cheque.banque || '-'}</td>
                          <td className="px-4 py-3 text-sm">{cheque.titulaire || '-'}</td>
                          <td className="px-4 py-3 text-center">
                            {cheque.estPostdate && (
                              <span className="inline-block px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                                Postdaté
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="bg-surface border border-border rounded-lg p-6">
              <h3 className="font-medium text-lg mb-4">Totaux</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-sm text-green-700 mb-1">Total dépôts</div>
                  <div className="text-2xl font-semibold text-green-900">
                    {formatCurrency(totalDepots)}
                  </div>
                </div>
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="text-sm text-red-700 mb-1">Total retraits</div>
                  <div className="text-2xl font-semibold text-red-900">
                    {formatCurrency(totalRetraits)}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-start">
              <button
                onClick={() => navigate('/caisse/menu')}
                className="px-4 py-2 border border-border rounded-md text-on-surface hover:bg-surface-hover"
              >
                Retour au menu
              </button>
            </div>
          </div>
        )}

        <Dialog
          open={showConfirmDialog}
          onClose={() => setShowConfirmDialog(false)}
          title={`Confirmer ${typeOperation === 'depot' ? 'le dépôt' : 'le retrait'}`}
        >
          <div className="space-y-4">
            <p className="text-sm text-on-surface-muted">
              Voulez-vous vraiment enregistrer ce {typeOperation === 'depot' ? 'dépôt' : 'retrait'} de chèque ?
            </p>
            <div className="bg-surface-hover p-4 rounded-lg space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-on-surface-muted">Numéro:</span>
                <span className="font-medium">{numeroCheque}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-muted">Montant:</span>
                <span className="font-medium">{formatCurrency(parseFloat(montant || '0'))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-muted">Date:</span>
                <span className="font-medium">{dateEmission ? formatDate(new Date(dateEmission)) : '-'}</span>
              </div>
              {estPostdate && (
                <div className="pt-2 border-t border-border">
                  <span className="inline-block px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                    ⚠️ Chèque postdaté
                  </span>
                </div>
              )}
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => setShowConfirmDialog(false)}
                variant="outline"
              >
                Annuler
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-primary text-white hover:bg-primary-dark"
              >
                {isLoading ? 'Enregistrement...' : 'Confirmer'}
              </Button>
            </div>
          </div>
        </Dialog>
      </div>
    </ScreenLayout>
  );
}

export default GestionChequePage;
