import { useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenLayout } from '@/components/layout';
import { Button } from '@/components/ui';
import { useGestionCaisseStore } from '@/stores/gestionCaisseStore';
import { useAuthStore } from '@/stores';
import {
  HeaderSectionPanel,
  MontantsSectionPanel,
  AlertesSectionPanel,
  ActionsSectionPanel,
  MouvementsSectionPanel,
} from '@/components/caisse/gestionCaisse';

export function GestionCaissePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const sessionActive = useGestionCaisseStore((s) => s.sessionActive);
  const parametres = useGestionCaisseStore((s) => s.parametres);
  const mouvements = useGestionCaisseStore((s) => s.mouvements);
  const isLoading = useGestionCaisseStore((s) => s.isLoading);
  const error = useGestionCaisseStore((s) => s.error);

  const chargerParametres = useGestionCaisseStore((s) => s.chargerParametres);
  const chargerSessionActive = useGestionCaisseStore((s) => s.chargerSessionActive);
  const verifierDateComptable = useGestionCaisseStore((s) => s.verifierDateComptable);
  const controlerCoffre = useGestionCaisseStore((s) => s.controlerCoffre);
  const detecterSessionsConcurrentes = useGestionCaisseStore((s) => s.detecterSessionsConcurrentes);
  const ouvrirSession = useGestionCaisseStore((s) => s.ouvrirSession);
  const apportCoffre = useGestionCaisseStore((s) => s.apportCoffre);
  const apportProduit = useGestionCaisseStore((s) => s.apportProduit);
  const remiseCoffre = useGestionCaisseStore((s) => s.remiseCoffre);
  const fermerSession = useGestionCaisseStore((s) => s.fermerSession);
  const reimprimerTickets = useGestionCaisseStore((s) => s.reimprimerTickets);
  const consulterHistorique = useGestionCaisseStore((s) => s.consulterHistorique);
  const setError = useGestionCaisseStore((s) => s.setError);
  const reset = useGestionCaisseStore((s) => s.reset);

  const [montantApport, setMontantApport] = useState('');
  const [deviseApport, setDeviseApport] = useState('EUR');
  const [montantRemise, setMontantRemise] = useState('');
  const [deviseRemise, setDeviseRemise] = useState('EUR');

  useEffect(() => {
    const init = async () => {
      await chargerParametres();
      await chargerSessionActive();
      await verifierDateComptable();
      await controlerCoffre();
      await detecterSessionsConcurrentes();
    };
    init();
    return () => reset();
  }, [chargerParametres, chargerSessionActive, verifierDateComptable, controlerCoffre, detecterSessionsConcurrentes, reset]);

  const handleOuvrirSession = useCallback(async () => { await ouvrirSession(); }, [ouvrirSession]);
  const handleFermerSession = useCallback(async () => { await fermerSession(); }, [fermerSession]);

  const handleApportCoffre = useCallback(async () => {
    const montant = parseFloat(montantApport);
    if (!montant || montant <= 0) { setError('Montant invalide'); return; }
    await apportCoffre(montant, deviseApport);
    setMontantApport('');
  }, [montantApport, deviseApport, apportCoffre, setError]);

  const handleRemiseCoffre = useCallback(async () => {
    const montant = parseFloat(montantRemise);
    if (!montant || montant <= 0) { setError('Montant invalide'); return; }
    await remiseCoffre(montant, deviseRemise);
    setMontantRemise('');
  }, [montantRemise, deviseRemise, remiseCoffre, setError]);

  const handleApportProduit = useCallback(async () => { await apportProduit(1, 1); }, [apportProduit]);
  const handleHistorique = useCallback(async () => { await consulterHistorique(); }, [consulterHistorique]);
  const handleReimprimer = useCallback(async () => {
    if (!sessionActive) return;
    await reimprimerTickets(sessionActive.sessionId);
  }, [sessionActive, reimprimerTickets]);

  const montantActuel = sessionActive
    ? sessionActive.montantOuverture +
      mouvements
        .filter((m) => m.sessionId === sessionActive.sessionId)
        .reduce((sum, m) => {
          if (m.type === 'apport_coffre' || m.type === 'apport_produit') return sum + m.montant;
          if (m.type === 'remise_coffre' || m.type === 'retrait_produit') return sum - m.montant;
          return sum;
        }, 0)
    : 0;

  if (isLoading && !sessionActive && !parametres) {
    return (
      <ScreenLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-on-surface-muted">Chargement...</div>
        </div>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Gestion de la caisse</h2>
            <p className="text-on-surface-muted text-sm mt-1">
              {sessionActive
                ? `Session ${sessionActive.sessionId} - ${sessionActive.operateurNom}`
                : 'Aucune session active'}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <HeaderSectionPanel
            operateurNom={sessionActive?.operateurNom}
            dateComptable={sessionActive?.dateOuverture}
            sessionStatut={sessionActive ? 'Ouverte' : 'Fermée'}
          />

          <MontantsSectionPanel
            montantOuverture={sessionActive?.montantOuverture ?? 0}
            montantActuel={montantActuel}
            montantFermeture={0}
            ecart={sessionActive?.ecart ?? 0}
          />
        </div>

        <AlertesSectionPanel />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="border border-border rounded-lg p-4 space-y-4">
            <h3 className="font-medium">Apport coffre</h3>
            <div className="flex gap-3">
              <input
                type="number"
                value={montantApport}
                onChange={(e) => setMontantApport(e.target.value)}
                placeholder="Montant"
                className="flex-1 px-3 py-2 border border-border rounded-md"
              />
              <select
                value={deviseApport}
                onChange={(e) => setDeviseApport(e.target.value)}
                className="px-3 py-2 border border-border rounded-md"
              >
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
              </select>
              <Button onClick={handleApportCoffre} disabled={!sessionActive || isLoading}>
                Valider
              </Button>
            </div>
          </div>

          <div className="border border-border rounded-lg p-4 space-y-4">
            <h3 className="font-medium">Remise coffre</h3>
            <div className="flex gap-3">
              <input
                type="number"
                value={montantRemise}
                onChange={(e) => setMontantRemise(e.target.value)}
                placeholder="Montant"
                className="flex-1 px-3 py-2 border border-border rounded-md"
              />
              <select
                value={deviseRemise}
                onChange={(e) => setDeviseRemise(e.target.value)}
                className="px-3 py-2 border border-border rounded-md"
              >
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
              </select>
              <Button onClick={handleRemiseCoffre} disabled={!sessionActive || isLoading}>
                Valider
              </Button>
            </div>
          </div>
        </div>

        <ActionsSectionPanel
          onOuvrirSession={handleOuvrirSession}
          onFermerSession={handleFermerSession}
          onApportProduit={handleApportProduit}
          onHistorique={handleHistorique}
          onReimprimer={handleReimprimer}
          disabled={isLoading}
        />

        <MouvementsSectionPanel />

        <div className="flex justify-start">
          <Button onClick={() => navigate('/caisse/menu')} variant="secondary">
            Retour au menu
          </Button>
        </div>
      </div>
    </ScreenLayout>
  );
}

export default GestionCaissePage;
