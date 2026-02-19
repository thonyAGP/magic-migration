import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenLayout } from '@/components/layout';
import {
  DenominationGrid,
  DenominationSummary,
  EcartDisplay,
} from '@/components/caisse/denomination';
import {
  EcartJustificationDialog,
  FermetureRecapTable,
  DeviseTabSelector,
  ApportSupplementaireDialog,
} from '@/components/caisse/session';
import { PrinterChoiceDialog } from '@/components/ui';
import { useSessionStore, useCaisseStore, useAuthStore } from '@/stores';
import { executePrint, TicketType } from '@/services/printer';
import type { PrinterChoice } from '@/services/printer';
import type { DenominationCatalog, CountingResult } from '@/types/denomination';
import type { SessionEcart, FermetureRecapColumn, SoldeParMOP } from '@/types/session';
import { createEmptySoldeParMOP } from '@/types/session';
import { Printer, Plus } from 'lucide-react';

type Step = 'comptage' | 'ecarts' | 'justification' | 'fermeture' | 'succes';

const SEUIL_ALERTE = 5; // Ecart > 5 EUR requires justification

export function SessionFermeturePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const currentSession = useSessionStore((s) => s.currentSession);
  const closeSession = useSessionStore((s) => s.closeSession);
  const status = useSessionStore((s) => s.status);
  const calculateMopFromResults = useSessionStore((s) => s.calculateMopFromResults);
  const lastMopSoldeInitial = useSessionStore((s) => s.lastMopSoldeInitial);
  const config = useCaisseStore((s) => s.config);
  const denominations = useCaisseStore((s) => s.denominations);
  const loadDenominations = useCaisseStore((s) => s.loadDenominations);
  const isLoadingDenominations = useCaisseStore((s) => s.isLoadingDenominations);
  const resetCounting = useCaisseStore((s) => s.resetCounting);

  const [step, setStep] = useState<Step>('comptage');
  const [counting, setCounting] = useState<Map<number, number>>(new Map());
  const [ecart, setEcart] = useState<SessionEcart | null>(null);
  const [justificationOpen, setJustificationOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);

  // T4-A2: Multi-devises + apport + auto-print state
  const devisesAutorisees = config?.devisesAutorisees ?? [config?.devisePrincipale ?? 'EUR'];
  const [activeDevise, setActiveDevise] = useState(config?.devisePrincipale ?? 'EUR');
  const [showApportDialog, setShowApportDialog] = useState(false);
  const [apports, setApports] = useState<Array<{ type: 'coffre' | 'produits'; montant: number; motif: string; devise: string }>>([]);
  const autoPrintDone = useRef(false);

  const deviseCode = config?.devisePrincipale ?? 'EUR';

  // T4-A2: Load denominations for all authorized devises
  useEffect(() => {
    for (const devise of devisesAutorisees) {
      loadDenominations(devise);
    }
    resetCounting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [devisesAutorisees.join(','), loadDenominations, resetCounting]);

  // Redirect if no session
  useEffect(() => {
    if (status === 'closed') {
      navigate('/caisse/menu');
    }
  }, [status, navigate]);

  // T4-A2: Auto-print on success step
  useEffect(() => {
    if (step === 'succes' && !autoPrintDone.current) {
      autoPrintDone.current = true;
      handlePrint('pdf-browser');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // T4-A2: Handle apport supplementaire
  const handleApportValidate = (type: 'coffre' | 'produits', montant: number, motif: string) => {
    setApports((prev) => [...prev, { type, montant, motif, devise: activeDevise }]);
    setShowApportDialog(false);
  };

  const handleCountChange = useCallback((denominationId: number, quantite: number) => {
    setCounting((prev) => {
      const next = new Map(prev);
      next.set(denominationId, quantite);
      return next;
    });
  }, []);

  const catalogDenominations: DenominationCatalog[] = denominations.map((d, i) => ({
    id: d.id,
    deviseCode: d.deviseCode,
    valeur: d.valeur,
    type: d.type,
    libelle: d.libelle,
    ordre: i,
  }));

  // T4-A2: Compute totals per devise for tab badges
  const deviseTotals: Record<string, number> = {};
  for (const devise of devisesAutorisees) {
    let total = 0;
    for (const denom of denominations) {
      if (denom.deviseCode === devise) {
        const qty = counting.get(denom.id) ?? 0;
        total += qty * denom.valeur;
      }
    }
    // Include apports for this devise
    const deviseApports = apports.filter((a) => a.devise === devise).reduce((sum, a) => sum + a.montant, 0);
    deviseTotals[devise] = total + deviseApports;
  }

  // T4-A2: Multi-devises computeResults with apports
  const computeResults = (): CountingResult[] => {
    return devisesAutorisees.map((devise) => {
      const details = Array.from(counting.entries())
        .filter(([, qty]) => qty > 0)
        .map(([denomId, qty]) => {
          const denom = denominations.find((d) => d.id === denomId);
          if (!denom || denom.deviseCode !== devise) return null;
          return {
            denominationId: denomId,
            quantite: qty,
            total: qty * denom.valeur,
          };
        })
        .filter((d): d is NonNullable<typeof d> => d !== null);

      const denomTotal = details.reduce((sum, d) => sum + d.total, 0);
      const deviseApports = apports.filter((a) => a.devise === devise).reduce((sum, a) => sum + a.montant, 0);
      const totalCompte = denomTotal + deviseApports;
      const totalAttendu = currentSession?.devises
        .filter((d) => d.deviseCode === devise)
        .reduce((sum, d) => sum + d.fondCaisse + d.totalEncaissements, 0) ?? 0;

      return {
        deviseCode: devise,
        totalCompte,
        totalAttendu,
        ecart: totalCompte - totalAttendu,
        details,
      };
    }).filter((r) => r.details.length > 0 || r.totalAttendu > 0);
  };

  const computeEcart = (): SessionEcart => {
    const results = computeResults();
    const totalCompte = results.reduce((sum, r) => sum + r.totalCompte, 0);
    const totalAttendu = results.reduce((sum, r) => sum + r.totalAttendu, 0);
    const ecartValue = totalCompte - totalAttendu;

    let statut: SessionEcart['statut'] = 'equilibre';
    if (Math.abs(ecartValue) > SEUIL_ALERTE) {
      statut = 'alerte';
    } else if (ecartValue > 0) {
      statut = 'positif';
    } else if (ecartValue < 0) {
      statut = 'negatif';
    }

    return {
      attendu: totalAttendu,
      compte: totalCompte,
      ecart: ecartValue,
      estEquilibre: ecartValue === 0,
      statut,
      ecartsDevises: results.map((r) => ({
        deviseCode: r.deviseCode,
        attendu: r.totalAttendu,
        compte: r.totalCompte,
        ecart: r.ecart,
      })),
    };
  };

  // B1: Compute 6-column recap using MOP breakdown from counting results
  const computeFermetureRecap = (): FermetureRecapColumn[] => {
    const results = computeResults();
    const mopComptee = calculateMopFromResults(results);
    // Solde initial from last opening (attendu), fallback to empty
    const mopAttendu = lastMopSoldeInitial ?? createEmptySoldeParMOP();

    const columns: Array<{ type: FermetureRecapColumn['type']; label: string; key: keyof Omit<SoldeParMOP, 'total'> }> = [
      { type: 'cash', label: 'Cash', key: 'monnaie' },
      { type: 'cartes', label: 'Cartes', key: 'cartes' },
      { type: 'cheques', label: 'Cheques', key: 'cheques' },
      { type: 'produits', label: 'Produits', key: 'produits' },
      { type: 'od', label: 'OD', key: 'od' },
    ];

    return columns.map((col) => ({
      type: col.type,
      label: col.label,
      montantAttendu: mopAttendu[col.key],
      montantCompte: mopComptee[col.key],
      ecart: Math.round((mopComptee[col.key] - mopAttendu[col.key]) * 100) / 100,
    }));
  };

  const handleValidate = () => {
    const hasAnyCount = Array.from(counting.values()).some((v) => v > 0);
    if (!hasAnyCount) {
      setError('Veuillez saisir au moins une denomination');
      return;
    }
    setError(null);

    const computed = computeEcart();
    setEcart(computed);
    setStep('ecarts');
  };

  const handleProceedToClose = () => {
    if (ecart && Math.abs(ecart.ecart) > SEUIL_ALERTE) {
      setJustificationOpen(true);
      setStep('justification');
    } else {
      submitClose();
    }
  };

  const submitClose = async (justification?: string) => {
    if (!currentSession) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const comptage = Array.from(counting.entries())
        .filter(([, qty]) => qty > 0)
        .map(([denomId, qty]) => ({
          denominationId: denomId,
          quantite: qty,
        }));

      await closeSession({
        sessionId: currentSession.id,
        comptage,
        justification,
      });

      setStep('succes');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la fermeture';
      setError(message);
      setStep('comptage');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = (choice: PrinterChoice) => {
    const results = computeResults();
    const total = results.reduce((sum, r) => sum + r.totalCompte, 0);
    executePrint(TicketType.FERMETURE, {
      header: {
        societe: config?.libelle ?? 'ADH',
        caisse: config?.id?.toString() ?? '',
        session: currentSession?.id?.toString() ?? '',
        date: new Date().toLocaleDateString('fr-FR'),
        heure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        operateur: user?.login ?? '',
      },
      lines: results.flatMap((r) =>
        r.details.map((d) => {
          const denom = denominations.find((dn) => dn.id === d.denominationId);
          return {
            description: denom?.libelle ?? `Denomination ${d.denominationId}`,
            quantite: d.quantite,
            montant: d.total,
            devise: r.deviseCode,
          };
        }),
      ),
      footer: { total, devise: deviseCode, moyenPaiement: 'Fermeture' },
    }, choice);
    setShowPrintDialog(false);
  };

  const handleBack = () => {
    if (step === 'ecarts') {
      setStep('comptage');
    } else {
      navigate('/caisse/menu');
    }
  };

  return (
    <ScreenLayout>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Fermeture de caisse</h2>
            <p className="text-on-surface-muted text-sm mt-1">
              {step === 'comptage' && 'Comptez le contenu final de la caisse'}
              {step === 'ecarts' && 'Verification des ecarts'}
              {step === 'justification' && 'Justification de l\'ecart'}
              {step === 'fermeture' && 'Fermeture en cours...'}
              {step === 'succes' && 'Caisse fermee'}
            </p>
          </div>
          <FermetureStepIndicator current={step} />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {step === 'comptage' && (
          <>
            {/* T4-A2: Multi-devises tab selector */}
            {devisesAutorisees.length > 1 && (
              <DeviseTabSelector
                devises={devisesAutorisees}
                activeDevise={activeDevise}
                onSelect={setActiveDevise}
                totals={deviseTotals}
              />
            )}

            {isLoadingDenominations ? (
              <div className="text-center py-8 text-on-surface-muted">
                Chargement des denominations...
              </div>
            ) : (
              <DenominationGrid
                deviseCode={activeDevise}
                denominations={catalogDenominations}
                counting={counting}
                onCountChange={handleCountChange}
              />
            )}

            {/* T4-A2: Apports supplementaires list */}
            {apports.filter((a) => a.devise === activeDevise).length > 0 && (
              <div className="rounded-md border border-border bg-surface-dim p-3 space-y-1">
                <h4 className="text-sm font-semibold text-on-surface">Apports supplementaires</h4>
                {apports.filter((a) => a.devise === activeDevise).map((a, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-on-surface-muted">
                      {a.type === 'coffre' ? 'Coffre' : 'Produits'} - {a.motif}
                    </span>
                    <span className="font-medium">
                      +{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: a.devise }).format(a.montant)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3 justify-between">
              {/* T4-A2: Apport supplementaire button */}
              <button
                onClick={() => setShowApportDialog(true)}
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-md text-on-surface hover:bg-surface-hover"
              >
                <Plus className="h-4 w-4" /> Apport supplementaire
              </button>

              <div className="flex gap-3">
                <button
                  onClick={handleBack}
                  className="px-4 py-2 border border-border rounded-md text-on-surface hover:bg-surface-hover"
                >
                  Retour
                </button>
                <button
                  onClick={handleValidate}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                >
                  Valider le comptage
                </button>
              </div>
            </div>
          </>
        )}

        {step === 'ecarts' && ecart && (
          <>
            {/* T4-A1: 6-column fermeture recap table */}
            <FermetureRecapTable
              columns={computeFermetureRecap()}
              totalAttendu={ecart.attendu}
              totalCompte={ecart.compte}
              totalEcart={ecart.ecart}
              deviseCode={deviseCode}
            />

            <DenominationSummary results={computeResults()} />
            <EcartDisplay
              ecart={ecart}
              seuilAlerte={SEUIL_ALERTE}
              onJustify={() => {
                setJustificationOpen(true);
                setStep('justification');
              }}
            />

            <div className="flex gap-3 justify-end">
              <button
                onClick={handleBack}
                className="px-4 py-2 border border-border rounded-md text-on-surface hover:bg-surface-hover"
              >
                Modifier le comptage
              </button>
              <button
                onClick={handleProceedToClose}
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Fermeture en cours...' : 'Fermer la caisse'}
              </button>
            </div>
          </>
        )}

        {step === 'succes' && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="text-green-600 text-lg font-semibold">Caisse fermee avec succes</div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPrintDialog(true)}
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-md text-on-surface hover:bg-surface-hover"
              >
                <Printer className="h-4 w-4" /> Re-imprimer
              </button>
              <button
                onClick={() => navigate('/caisse/menu')}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
              >
                Continuer
              </button>
            </div>
          </div>
        )}

        {ecart && (
          <EcartJustificationDialog
            ecart={ecart}
            open={justificationOpen}
            onClose={() => {
              setJustificationOpen(false);
              setStep('ecarts');
            }}
            onSubmit={(justification) => {
              setJustificationOpen(false);
              submitClose(justification);
            }}
          />
        )}

        <PrinterChoiceDialog
          open={showPrintDialog}
          onClose={() => setShowPrintDialog(false)}
          onSelect={handlePrint}
        />

        {/* T4-A2: Apport supplementaire dialog */}
        <ApportSupplementaireDialog
          open={showApportDialog}
          onClose={() => setShowApportDialog(false)}
          onValidate={handleApportValidate}
          deviseCode={activeDevise}
        />
      </div>
    </ScreenLayout>
  );
}

function FermetureStepIndicator({ current }: { current: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: 'comptage', label: '1. Comptage' },
    { key: 'ecarts', label: '2. Ecarts' },
    { key: 'justification', label: '3. Justification' },
    { key: 'fermeture', label: '4. Fermeture' },
  ];

  return (
    <div className="flex gap-1">
      {steps.map((s) => (
        <span
          key={s.key}
          className={`text-xs px-2 py-1 rounded ${
            s.key === current
              ? 'bg-primary text-white'
              : 'bg-surface-hover text-on-surface-muted'
          }`}
        >
          {s.label}
        </span>
      ))}
    </div>
  );
}
