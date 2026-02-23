import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenLayout } from '@/components/layout';
import { Button, Dialog, Input } from '@/components/ui';
import { useFacturationAppelStore } from '@/stores/facturationAppelStore';
import { useAuthStore } from '@/stores';
import type { FacturationRequest } from '@/types/facturationAppel';
import { cn } from '@/lib/utils';

export function FacturationAppelPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const historiqueAppels = useFacturationAppelStore((s) => s.historiqueAppels);
  const coefficientTelephone = useFacturationAppelStore((s) => s.coefficientTelephone);
  const cloture = useFacturationAppelStore((s) => s.cloture);
  const isLoading = useFacturationAppelStore((s) => s.isLoading);
  const error = useFacturationAppelStore((s) => s.error);
  const filterSociete = useFacturationAppelStore((s) => s.filterSociete);
  const filterDateDebut = useFacturationAppelStore((s) => s.filterDateDebut);
  const filterDateFin = useFacturationAppelStore((s) => s.filterDateFin);

  const chargerHistoriqueAppels = useFacturationAppelStore((s) => s.chargerHistoriqueAppels);
  const recupererCoefficient = useFacturationAppelStore((s) => s.recupererCoefficient);
  const facturerAppel = useFacturationAppelStore((s) => s.facturerAppel);
  const verifierCloture = useFacturationAppelStore((s) => s.verifierCloture);
  const debloquerCloture = useFacturationAppelStore((s) => s.debloquerCloture);
  const marquerGratuit = useFacturationAppelStore((s) => s.marquerGratuit);
  const annulerFacturation = useFacturationAppelStore((s) => s.annulerFacturation);
  const setFilterSociete = useFacturationAppelStore((s) => s.setFilterSociete);
  const setFilterDateDebut = useFacturationAppelStore((s) => s.setFilterDateDebut);
  const setFilterDateFin = useFacturationAppelStore((s) => s.setFilterDateFin);
  const resetFilters = useFacturationAppelStore((s) => s.resetFilters);
  const reset = useFacturationAppelStore((s) => s.reset);

  const [prefixeFilter, setPrefixeFilter] = useState('');
  const [selectedAppels, setSelectedAppels] = useState<number[]>([]);
  const [showFacturationDialog, setShowFacturationDialog] = useState(false);
  const [showGratuitDialog, setShowGratuitDialog] = useState(false);
  const [showClotureWarning, setShowClotureWarning] = useState(false);
  const [raisonGratuite, setRaisonGratuite] = useState('');
  const [numeroCompte, setNumeroCompte] = useState('');
  const [filiation, setFiliation] = useState('');

  useEffect(() => {
    recupererCoefficient();
    return () => reset();
  }, [recupererCoefficient, reset]);

  const handleSearch = useCallback(async () => {
    if (!filterSociete || !prefixeFilter) {
      return;
    }
    await chargerHistoriqueAppels(
      filterSociete,
      prefixeFilter,
      filterDateDebut || undefined,
      filterDateFin || undefined,
    );
  }, [filterSociete, prefixeFilter, filterDateDebut, filterDateFin, chargerHistoriqueAppels]);

  const handleFacturer = useCallback(async () => {
    if (selectedAppels.length === 0 || !numeroCompte || !filiation) {
      return;
    }

    const isCloture = await verifierCloture();
    if (isCloture) {
      setShowClotureWarning(true);
      return;
    }

    const appelsToFacture = historiqueAppels.filter((a) => a.id && selectedAppels.includes(a.id));

    for (const appel of appelsToFacture) {
      const request: FacturationRequest = {
        appel,
        numeroCompte: parseInt(numeroCompte, 10),
        filiation: parseInt(filiation, 10),
        typeCompte: 'GO',
      };
      await facturerAppel(request);
    }

    setSelectedAppels([]);
    setShowFacturationDialog(false);
    await handleSearch();
  }, [
    selectedAppels,
    numeroCompte,
    filiation,
    historiqueAppels,
    verifierCloture,
    facturerAppel,
    handleSearch,
  ]);

  const handleMarquerGratuit = useCallback(async () => {
    if (selectedAppels.length === 0 || !raisonGratuite.trim()) {
      return;
    }

    for (const appelId of selectedAppels) {
      await marquerGratuit(appelId, raisonGratuite);
    }

    setSelectedAppels([]);
    setRaisonGratuite('');
    setShowGratuitDialog(false);
    await handleSearch();
  }, [selectedAppels, raisonGratuite, marquerGratuit, handleSearch]);

  const handleAnnuler = useCallback(async () => {
    if (selectedAppels.length === 0) {
      return;
    }

    for (const appelId of selectedAppels) {
      await annulerFacturation(appelId);
    }

    setSelectedAppels([]);
    await handleSearch();
  }, [selectedAppels, annulerFacturation, handleSearch]);

  const handleDebloquer = useCallback(async () => {
    await debloquerCloture();
    setShowClotureWarning(false);
    await handleFacturer();
  }, [debloquerCloture, handleFacturer]);

  const toggleSelection = useCallback((id: number) => {
    setSelectedAppels((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }, []);

  const totalAppels = historiqueAppels.length;
  const totalMontant = historiqueAppels.reduce((sum, a) => sum + a.montant, 0);
  const _appelsFactures = historiqueAppels.filter((a) => a.facture).length;

  return (
    <ScreenLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Facturation Appels</h2>
            <p className="text-on-surface-muted text-sm mt-1">
              Gestion de la facturation des appels telephoniques
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

        <div className="bg-surface border border-border rounded-lg p-6 space-y-4">
          <h3 className="text-sm font-medium">Filtres</h3>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-on-surface-muted mb-1">Société</label>
              <Input
                value={filterSociete}
                onChange={(e) => setFilterSociete(e.target.value)}
                placeholder="SOC1"
              />
            </div>
            <div>
              <label className="block text-xs text-on-surface-muted mb-1">Préfixe</label>
              <Input
                value={prefixeFilter}
                onChange={(e) => setPrefixeFilter(e.target.value)}
                placeholder="CAI01"
              />
            </div>
            <div>
              <label className="block text-xs text-on-surface-muted mb-1">Date début</label>
              <Input
                type="date"
                value={filterDateDebut ? filterDateDebut.toISOString().split('T')[0] : ''}
                onChange={(e) => setFilterDateDebut(e.target.value ? new Date(e.target.value) : null)}
              />
            </div>
            <div>
              <label className="block text-xs text-on-surface-muted mb-1">Date fin</label>
              <Input
                type="date"
                value={filterDateFin ? filterDateFin.toISOString().split('T')[0] : ''}
                onChange={(e) => setFilterDateFin(e.target.value ? new Date(e.target.value) : null)}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleSearch} disabled={isLoading || !filterSociete || !prefixeFilter}>
              {isLoading ? 'Recherche...' : 'Rechercher'}
            </Button>
            <Button variant="outline" onClick={() => { resetFilters(); setPrefixeFilter(''); }}>
              Réinitialiser
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="bg-surface border border-border rounded-lg p-4">
            <div className="text-xs text-on-surface-muted">Total appels</div>
            <div className="text-2xl font-semibold mt-1">{totalAppels}</div>
          </div>
          <div className="bg-surface border border-border rounded-lg p-4">
            <div className="text-xs text-on-surface-muted">Montant total</div>
            <div className="text-2xl font-semibold mt-1">{totalMontant.toFixed(2)} €</div>
          </div>
          <div className="bg-surface border border-border rounded-lg p-4">
            <div className="text-xs text-on-surface-muted">Coefficient actuel</div>
            <div className="text-2xl font-semibold mt-1">
              {coefficientTelephone !== null ? coefficientTelephone.toFixed(4) : '-'}
            </div>
          </div>
          <div className="bg-surface border border-border rounded-lg p-4">
            <div className="text-xs text-on-surface-muted">Statut clôture</div>
            <div className="mt-2">
              {cloture?.cloture_enCours ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Clôturé
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Ouvert
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-surface-hover">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-on-surface-muted">
                    <input
                      type="checkbox"
                      checked={selectedAppels.length === historiqueAppels.filter((a) => a.id).length && historiqueAppels.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAppels(historiqueAppels.filter((a) => a.id).map((a) => a.id!));
                        } else {
                          setSelectedAppels([]);
                        }
                      }}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-on-surface-muted">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-on-surface-muted">Heure</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-on-surface-muted">Numéro</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-on-surface-muted">Durée</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-on-surface-muted">Montant</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-on-surface-muted">Qualité</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-on-surface-muted">Gratuite</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-on-surface-muted">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-on-surface-muted">
                      Chargement...
                    </td>
                  </tr>
                ) : historiqueAppels.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-on-surface-muted">
                      Aucun appel trouvé
                    </td>
                  </tr>
                ) : (
                  historiqueAppels.map((appel) => (
                    <tr key={appel.id} className="hover:bg-surface-hover">
                      <td className="px-4 py-3">
                        {appel.id && (
                          <input
                            type="checkbox"
                            checked={selectedAppels.includes(appel.id)}
                            onChange={() => toggleSelection(appel.id!)}
                          />
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {appel.dateAppel.toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-4 py-3 text-sm">{appel.heureAppel}</td>
                      <td className="px-4 py-3 text-sm font-mono">{appel.numeroTel}</td>
                      <td className="px-4 py-3 text-sm font-mono">{appel.duree}</td>
                      <td className="px-4 py-3 text-sm text-right font-mono">
                        {appel.montant.toFixed(2)} €
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={cn(
                            'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                            appel.qualite === 'OK' && 'bg-green-100 text-green-800',
                            appel.qualite === 'Mauvaise' && 'bg-orange-100 text-orange-800',
                            appel.qualite === 'Interruption' && 'bg-red-100 text-red-800',
                          )}
                        >
                          {appel.qualite || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {appel.gratuite ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            Gratuit
                          </span>
                        ) : (
                          <span className="text-on-surface-muted">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {appel.facture ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            Facturé
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            En attente
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex gap-3 justify-between">
          <Button variant="outline" onClick={() => navigate('/caisse/menu')}>
            Retour au menu
          </Button>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowGratuitDialog(true)}
              disabled={selectedAppels.length === 0}
            >
              Marquer gratuit
            </Button>
            <Button
              variant="outline"
              onClick={handleAnnuler}
              disabled={selectedAppels.length === 0}
            >
              Annuler facturation
            </Button>
            <Button
              onClick={() => setShowFacturationDialog(true)}
              disabled={selectedAppels.length === 0}
            >
              Facturer ({selectedAppels.length})
            </Button>
          </div>
        </div>

        <Dialog open={showFacturationDialog} onClose={() => setShowFacturationDialog(false)}>
          <div className="p-6 space-y-4">
            <h3 className="text-lg font-semibold">Facturer les appels sélectionnés</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-on-surface-muted mb-1">Numéro de compte</label>
                <Input
                  value={numeroCompte}
                  onChange={(e) => setNumeroCompte(e.target.value)}
                  placeholder="12345"
                />
              </div>
              <div>
                <label className="block text-sm text-on-surface-muted mb-1">Filiation</label>
                <Input
                  value={filiation}
                  onChange={(e) => setFiliation(e.target.value)}
                  placeholder="1"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowFacturationDialog(false)}>
                Annuler
              </Button>
              <Button onClick={handleFacturer} disabled={!numeroCompte || !filiation}>
                Confirmer
              </Button>
            </div>
          </div>
        </Dialog>

        <Dialog open={showGratuitDialog} onClose={() => setShowGratuitDialog(false)}>
          <div className="p-6 space-y-4">
            <h3 className="text-lg font-semibold">Marquer comme gratuit</h3>
            <div>
              <label className="block text-sm text-on-surface-muted mb-1">Raison</label>
              <Input
                value={raisonGratuite}
                onChange={(e) => setRaisonGratuite(e.target.value)}
                placeholder="Appel urgence médicale"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowGratuitDialog(false)}>
                Annuler
              </Button>
              <Button onClick={handleMarquerGratuit} disabled={!raisonGratuite.trim()}>
                Confirmer
              </Button>
            </div>
          </div>
        </Dialog>

        <Dialog open={showClotureWarning} onClose={() => setShowClotureWarning(false)}>
          <div className="p-6 space-y-4">
            <h3 className="text-lg font-semibold text-orange-700">Réseau clôturé</h3>
            <p className="text-sm text-on-surface-muted">
              Le réseau est actuellement clôturé. Voulez-vous débloquer la clôture pour continuer ?
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowClotureWarning(false)}>
                Annuler
              </Button>
              <Button onClick={handleDebloquer}>
                Débloquer et continuer
              </Button>
            </div>
          </div>
        </Dialog>
      </div>
    </ScreenLayout>
  );
}

export default FacturationAppelPage;
