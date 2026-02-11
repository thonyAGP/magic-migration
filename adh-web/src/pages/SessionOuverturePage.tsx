import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenLayout } from '@/components/layout';
import { DenominationGrid, DenominationSummary } from '@/components/caisse/denomination';
import { PrinterChoiceDialog } from '@/components/ui';
import { useSessionStore, useCaisseStore, useAuthStore } from '@/stores';
import { executePrint, TicketType } from '@/services/printer';
import type { PrinterChoice } from '@/services/printer';
import type { DenominationCatalog, CountingResult } from '@/types/denomination';
import { Printer } from 'lucide-react';

type Step = 'comptage' | 'validation' | 'ouverture' | 'succes';

export function SessionOuverturePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const openSession = useSessionStore((s) => s.openSession);
  const status = useSessionStore((s) => s.status);
  const config = useCaisseStore((s) => s.config);
  const denominations = useCaisseStore((s) => s.denominations);
  const loadDenominations = useCaisseStore((s) => s.loadDenominations);
  const isLoadingDenominations = useCaisseStore((s) => s.isLoadingDenominations);
  const resetCounting = useCaisseStore((s) => s.resetCounting);

  const [step, setStep] = useState<Step>('comptage');
  const [counting, setCounting] = useState<Map<number, number>>(new Map());
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);

  const deviseCode = config?.devisePrincipale ?? 'EUR';

  useEffect(() => {
    loadDenominations(deviseCode);
    resetCounting();
  }, [deviseCode, loadDenominations, resetCounting]);

  // Redirect if session already open
  useEffect(() => {
    if (status === 'open') {
      navigate('/caisse/menu');
    }
  }, [status, navigate]);

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

  const computeResults = (): CountingResult[] => {
    const details = Array.from(counting.entries())
      .filter(([, qty]) => qty > 0)
      .map(([denomId, qty]) => {
        const denom = denominations.find((d) => d.id === denomId);
        return {
          denominationId: denomId,
          quantite: qty,
          total: qty * (denom?.valeur ?? 0),
        };
      });

    const totalCompte = details.reduce((sum, d) => sum + d.total, 0);

    return [{
      deviseCode,
      totalCompte,
      totalAttendu: 0,
      ecart: 0,
      details,
    }];
  };

  const handleValidate = () => {
    const hasAnyCount = Array.from(counting.values()).some((v) => v > 0);
    if (!hasAnyCount) {
      setError('Veuillez saisir au moins une denomination');
      return;
    }
    setError(null);
    setStep('validation');
  };

  const handleSubmit = async () => {
    if (!user || !config) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const comptage = Array.from(counting.entries())
        .filter(([, qty]) => qty > 0)
        .map(([denomId, qty]) => ({
          denominationId: denomId,
          quantite: qty,
        }));

      await openSession({
        caisseId: config.id,
        userId: user.id,
        comptage,
      });

      setStep('succes');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de l\'ouverture';
      setError(message);
      setStep('comptage');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = (choice: PrinterChoice) => {
    const results = computeResults();
    const total = results.reduce((sum, r) => sum + r.totalCompte, 0);
    executePrint(TicketType.OUVERTURE, {
      header: {
        societe: config?.libelle ?? 'ADH',
        caisse: config?.id?.toString() ?? '',
        session: '',
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
      footer: { total, devise: deviseCode, moyenPaiement: 'Fond de caisse' },
    }, choice);
    setShowPrintDialog(false);
  };

  const handleBack = () => {
    if (step === 'validation') {
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
            <h2 className="text-xl font-semibold">Ouverture de caisse</h2>
            <p className="text-on-surface-muted text-sm mt-1">
              {step === 'comptage' && 'Comptez le contenu initial de la caisse'}
              {step === 'validation' && 'Verifiez le comptage avant ouverture'}
              {step === 'ouverture' && 'Ouverture en cours...'}
              {step === 'succes' && 'Caisse ouverte'}
            </p>
          </div>
          <div className="flex gap-2">
            <StepIndicator current={step} />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {step === 'comptage' && (
          <>
            {isLoadingDenominations ? (
              <div className="text-center py-8 text-on-surface-muted">
                Chargement des denominations...
              </div>
            ) : (
              <DenominationGrid
                deviseCode={deviseCode}
                denominations={catalogDenominations}
                counting={counting}
                onCountChange={handleCountChange}
              />
            )}

            <div className="flex gap-3 justify-end">
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
          </>
        )}

        {step === 'validation' && (
          <>
            <DenominationSummary results={computeResults()} />

            <div className="flex gap-3 justify-end">
              <button
                onClick={handleBack}
                className="px-4 py-2 border border-border rounded-md text-on-surface hover:bg-surface-hover"
              >
                Modifier
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Ouverture en cours...' : 'Ouvrir la caisse'}
              </button>
            </div>
          </>
        )}

        {step === 'succes' && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="text-green-600 text-lg font-semibold">Caisse ouverte avec succes</div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPrintDialog(true)}
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-md text-on-surface hover:bg-surface-hover"
              >
                <Printer className="h-4 w-4" /> Imprimer
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

        <PrinterChoiceDialog
          open={showPrintDialog}
          onClose={() => setShowPrintDialog(false)}
          onSelect={handlePrint}
        />
      </div>
    </ScreenLayout>
  );
}

function StepIndicator({ current }: { current: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: 'comptage', label: '1. Comptage' },
    { key: 'validation', label: '2. Validation' },
    { key: 'ouverture', label: '3. Ouverture' },
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
