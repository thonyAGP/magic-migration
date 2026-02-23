import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenLayout } from '@/components/layout';
import { Button } from '@/components/ui';
import { useFermetureCaisseStore } from '@/stores/fermetureCaisseStore';
import { useAuthStore } from '@/stores';
import { cn } from '@/lib/utils';
import type { MoyenPaiement } from '@/types/fermetureCaisse';

type Tab = 'recap' | 'validation' | 'tickets' | 'detail-devises';

export const FermetureCaissePage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const societe = 'ADH';
  const numeroSession = 1001;

  const recapFermeture = useFermetureCaisseStore((s) => s.recapFermeture);
  const pointagesDevise = useFermetureCaisseStore((s) => s.pointagesDevise);
  const _pointagesArticle = useFermetureCaisseStore((s) => s.pointagesArticle);
  const pointagesApproRemise = useFermetureCaisseStore((s) => s.pointagesApproRemise);
  const ecartsDetectes = useFermetureCaisseStore((s) => s.ecartsDetectes);
  const ecartsJustifies = useFermetureCaisseStore((s) => s.ecartsJustifies);
  const tousPointes = useFermetureCaisseStore((s) => s.tousPointes);
  const fermetureValidee = useFermetureCaisseStore((s) => s.fermetureValidee);
  const isLoading = useFermetureCaisseStore((s) => s.isLoading);
  const error = useFermetureCaisseStore((s) => s.error);
  const _currentView = useFermetureCaisseStore((s) => s.currentView);

  const chargerRecapFermeture = useFermetureCaisseStore((s) => s.chargerRecapFermeture);
  const saisirMontantsComptes = useFermetureCaisseStore((s) => s.saisirMontantsComptes);
  const _calculerEcarts = useFermetureCaisseStore((s) => s.calculerEcarts);
  const justifierEcart = useFermetureCaisseStore((s) => s.justifierEcart);
  const effectuerApportCoffre = useFermetureCaisseStore((s) => s.effectuerApportCoffre);
  const effectuerApportArticles = useFermetureCaisseStore((s) => s.effectuerApportArticles);
  const effectuerRemiseCaisse = useFermetureCaisseStore((s) => s.effectuerRemiseCaisse);
  const validerFermeture = useFermetureCaisseStore((s) => s.validerFermeture);
  const genererTickets = useFermetureCaisseStore((s) => s.genererTickets);
  const afficherDetailDevises = useFermetureCaisseStore((s) => s.afficherDetailDevises);
  const _setCurrentView = useFermetureCaisseStore((s) => s.setCurrentView);
  const reset = useFermetureCaisseStore((s) => s.reset);

  const [activeTab, setActiveTab] = useState<Tab>('recap');
  const [selectedMoyenPaiement, setSelectedMoyenPaiement] = useState<string | null>(null);

  useEffect(() => {
    chargerRecapFermeture(societe, numeroSession);
    return () => reset();
  }, [chargerRecapFermeture, reset, societe, numeroSession]);

  const handleSaisie = useCallback(
    (moyenCode: string) => {
      setSelectedMoyenPaiement(moyenCode);
      saisirMontantsComptes(moyenCode);
    },
    [saisirMontantsComptes],
  );

  const handleApportCoffre = useCallback(() => {
    effectuerApportCoffre(800);
  }, [effectuerApportCoffre]);

  const handleApportArticles = useCallback(() => {
    effectuerApportArticles('ART001', 10);
  }, [effectuerApportArticles]);

  const handleRemise = useCallback(() => {
    effectuerRemiseCaisse(500);
  }, [effectuerRemiseCaisse]);

  const handleJustifierEcart = useCallback(
    (moyenCode: string) => {
      justifierEcart(moyenCode, 'Ecart justifie par operateur');
    },
    [justifierEcart],
  );

  const handleValider = useCallback(() => {
    validerFermeture(societe, numeroSession);
  }, [validerFermeture, societe, numeroSession]);

  const handleGenererTickets = useCallback(() => {
    genererTickets(societe, numeroSession);
  }, [genererTickets, societe, numeroSession]);

  const handleDetailDevises = useCallback(() => {
    afficherDetailDevises();
    setActiveTab('detail-devises');
  }, [afficherDetailDevises]);

  const handleBack = useCallback(() => {
    navigate('/caisse/menu');
  }, [navigate]);

  const validationReady =
    tousPointes && (!ecartsDetectes || ecartsJustifies) && !fermetureValidee;
  const ticketsReady = fermetureValidee;

  const moyensPaiement = recapFermeture?.moyensPaiement || [];
  const totalVersementCoffre = recapFermeture?.totalVersementCoffre || 0;
  const soldeFinal = recapFermeture?.soldeFinal || 0;

  return (
    <ScreenLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Fermeture de caisse</h2>
            <p className="text-on-surface-muted text-sm mt-1">
              Session #{numeroSession} - {societe}
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

        <div className="border-b border-border">
          <nav className="flex gap-4">
            <button
              onClick={() => setActiveTab('recap')}
              className={cn(
                'px-4 py-2 border-b-2 font-medium text-sm',
                activeTab === 'recap'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-muted hover:text-on-surface',
              )}
            >
              Recapitulatif
            </button>
            <button
              onClick={() => setActiveTab('validation')}
              className={cn(
                'px-4 py-2 border-b-2 font-medium text-sm',
                activeTab === 'validation'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-muted hover:text-on-surface',
              )}
            >
              Validation
            </button>
            <button
              onClick={() => setActiveTab('tickets')}
              className={cn(
                'px-4 py-2 border-b-2 font-medium text-sm',
                activeTab === 'tickets'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-muted hover:text-on-surface',
              )}
            >
              Tickets
            </button>
            <button
              onClick={handleDetailDevises}
              className={cn(
                'px-4 py-2 border-b-2 font-medium text-sm',
                activeTab === 'detail-devises'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-muted hover:text-on-surface',
              )}
            >
              Detail devises
            </button>
          </nav>
        </div>

        {isLoading && (
          <div className="text-center py-8 text-on-surface-muted">Chargement...</div>
        )}

        {!isLoading && activeTab === 'recap' && (
          <div className="space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border">
                <thead>
                  <tr className="bg-surface-hover">
                    <th className="border border-border px-4 py-2 text-left">Moyen</th>
                    <th className="border border-border px-4 py-2 text-right">
                      Solde ouverture
                    </th>
                    <th className="border border-border px-4 py-2 text-right">
                      Montant compte
                    </th>
                    <th className="border border-border px-4 py-2 text-right">
                      Montant calcule
                    </th>
                    <th className="border border-border px-4 py-2 text-right">Ecart</th>
                    <th className="border border-border px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {moyensPaiement.map((moyen: MoyenPaiement) => (
                    <tr key={moyen.code}>
                      <td className="border border-border px-4 py-2">{moyen.libelle}</td>
                      <td className="border border-border px-4 py-2 text-right">
                        {moyen.soldeOuverture.toFixed(2)}
                      </td>
                      <td className="border border-border px-4 py-2 text-right">
                        {moyen.montantCompte.toFixed(2)}
                      </td>
                      <td className="border border-border px-4 py-2 text-right">
                        {moyen.montantCalcule.toFixed(2)}
                      </td>
                      <td
                        className={cn(
                          'border border-border px-4 py-2 text-right font-semibold',
                          moyen.ecart !== 0 && 'bg-yellow-100 text-yellow-900',
                        )}
                      >
                        {moyen.ecart.toFixed(2)}
                      </td>
                      <td className="border border-border px-4 py-2">
                        <button
                          onClick={() => handleSaisie(moyen.code)}
                          className="text-xs px-2 py-1 border border-border rounded-md hover:bg-surface-hover"
                        >
                          Saisir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-3 flex-wrap">
              <Button onClick={handleApportCoffre}>Apport coffre</Button>
              <Button onClick={handleApportArticles}>Apport articles</Button>
              <Button onClick={handleRemise}>Remise</Button>
              <Button
                onClick={() => selectedMoyenPaiement && handleJustifierEcart(selectedMoyenPaiement)}
                disabled={!ecartsDetectes}
              >
                Justifier ecart
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="border border-border rounded-md p-4">
                <label className="block text-sm font-medium mb-1">Solde final</label>
                <input
                  type="text"
                  value={soldeFinal.toFixed(2)}
                  readOnly
                  className="w-full px-3 py-2 border border-border rounded-md bg-surface-hover"
                />
              </div>
              <div className="border border-border rounded-md p-4">
                <label className="block text-sm font-medium mb-1">
                  Total versement coffre
                </label>
                <input
                  type="text"
                  value={totalVersementCoffre.toFixed(2)}
                  readOnly
                  className="w-full px-3 py-2 border border-border rounded-md bg-surface-hover"
                />
              </div>
            </div>
          </div>
        )}

        {!isLoading && activeTab === 'validation' && (
          <div className="space-y-4">
            <div
              className={cn(
                'border rounded-md p-4 flex items-center gap-3',
                tousPointes
                  ? 'border-green-300 bg-green-50'
                  : 'border-yellow-300 bg-yellow-50',
              )}
            >
              <span className="text-2xl">{tousPointes ? '✓' : '⚠'}</span>
              <span className="font-medium">
                {tousPointes
                  ? 'Tous les moyens ont ete pointes'
                  : 'Certains moyens ne sont pas pointes'}
              </span>
            </div>

            <div
              className={cn(
                'border rounded-md p-4 flex items-center gap-3',
                !ecartsDetectes || ecartsJustifies
                  ? 'border-green-300 bg-green-50'
                  : 'border-yellow-300 bg-yellow-50',
              )}
            >
              <span className="text-2xl">
                {!ecartsDetectes || ecartsJustifies ? '✓' : '⚠'}
              </span>
              <span className="font-medium">
                {!ecartsDetectes
                  ? 'Aucun ecart detecte'
                  : ecartsJustifies
                    ? 'Tous les ecarts sont justifies'
                    : 'Des ecarts existent et ne sont pas justifies'}
              </span>
            </div>

            <div className="pt-4">
              <Button onClick={handleValider} disabled={!validationReady}>
                Valider fermeture
              </Button>
            </div>

            {fermetureValidee && (
              <div className="border border-green-300 bg-green-50 rounded-md p-4 text-green-900 font-semibold">
                Fermeture validee avec succes
              </div>
            )}
          </div>
        )}

        {!isLoading && activeTab === 'tickets' && (
          <div className="space-y-4">
            <Button onClick={handleGenererTickets} disabled={!ticketsReady}>
              Generer tickets
            </Button>

            {ticketsReady && pointagesApproRemise.length > 0 && (
              <div className="border border-border rounded-md p-4">
                <h3 className="font-semibold mb-2">Tickets generes</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {pointagesApproRemise.map((p, idx) => (
                    <li key={idx}>
                      {p.type === 'APPORT' ? 'Apport' : 'Remise'} - {p.montant.toFixed(2)} EUR
                      {p.ticketEdite && ' (Ticket edite)'}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {!isLoading && activeTab === 'detail-devises' && (
          <div className="space-y-4">
            {pointagesDevise.length === 0 ? (
              <div className="text-center py-8 text-on-surface-muted">
                Aucun pointage de devise disponible
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border">
                  <thead>
                    <tr className="bg-surface-hover">
                      <th className="border border-border px-4 py-2 text-left">Code devise</th>
                      <th className="border border-border px-4 py-2 text-right">
                        Montant ouverture
                      </th>
                      <th className="border border-border px-4 py-2 text-right">
                        Montant compte
                      </th>
                      <th className="border border-border px-4 py-2 text-right">
                        Montant calcule
                      </th>
                      <th className="border border-border px-4 py-2 text-right">Ecart</th>
                      <th className="border border-border px-4 py-2">Commentaire</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pointagesDevise.map((pd, idx) => (
                      <tr key={idx}>
                        <td className="border border-border px-4 py-2">{pd.codeDevise}</td>
                        <td className="border border-border px-4 py-2 text-right">
                          {pd.montantOuverture.toFixed(2)}
                        </td>
                        <td className="border border-border px-4 py-2 text-right">
                          {pd.montantCompte.toFixed(2)}
                        </td>
                        <td className="border border-border px-4 py-2 text-right">
                          {pd.montantCalcule.toFixed(2)}
                        </td>
                        <td
                          className={cn(
                            'border border-border px-4 py-2 text-right font-semibold',
                            pd.ecart !== 0 && 'bg-yellow-100 text-yellow-900',
                          )}
                        >
                          {pd.ecart.toFixed(2)}
                        </td>
                        <td className="border border-border px-4 py-2 text-sm">
                          {pd.commentaireEcart || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-start pt-4">
          <Button onClick={handleBack} variant="outline">
            Retour au menu
          </Button>
        </div>
      </div>
    </ScreenLayout>
  );
};