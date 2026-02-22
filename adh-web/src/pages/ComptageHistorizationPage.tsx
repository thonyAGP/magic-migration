import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenLayout } from '@/components/layout';
import { useComptageHistorizationStore } from '@/stores/comptageHistorizationStore';
import { useAuthStore } from '@/stores';

export function ComptageHistorizationPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const isLoading = useComptageHistorizationStore((s) => s.isLoading);
  const error = useComptageHistorizationStore((s) => s.error);
  const lastHistoId = useComptageHistorizationStore((s) => s.lastHistoId);
  const reset = useComptageHistorizationStore((s) => s.reset);

  useEffect(() => {
    return () => reset();
  }, [reset]);

  const handleBack = () => {
    navigate('/caisse/menu');
  };

  return (
    <ScreenLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Historisation des comptages</h2>
            <p className="text-on-surface-muted text-sm mt-1">
              Service backend - Pas d'interface utilisateur
            </p>
          </div>
          {user && (
            <span className="text-xs text-on-surface-muted">
              {user.prenom} {user.nom}
            </span>
          )}
        </div>

        <div className="bg-surface-muted border border-border rounded-lg p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-on-surface mb-2">
                Programme backend uniquement
              </h3>
              <p className="text-sm text-on-surface-muted leading-relaxed">
                Ce programme est un service backend appelé automatiquement après la
                validation d'un comptage (ouverture ou fermeture de caisse). Il
                enregistre l'historique dans la base de données.
              </p>
              <ul className="mt-3 space-y-2 text-sm text-on-surface-muted">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>
                    Sauvegarde automatique des comptages validés
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>
                    Enregistrement header (date, total, type ouverture/fermeture)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>
                    Enregistrement détails par devise (montant, écart, total)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>
                    Retour du chronoHisto pour traçabilité
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {isLoading && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md text-sm">
              Sauvegarde en cours...
            </div>
          )}

          {lastHistoId !== null && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
              Dernière historisation: #{lastHistoId}
            </div>
          )}
        </div>

        <div className="bg-white border border-border rounded-lg p-6 space-y-3">
          <h4 className="font-medium text-on-surface mb-3">
            Appel depuis l'interface
          </h4>
          <div className="bg-surface-muted p-4 rounded-md">
            <code className="text-sm font-mono text-on-surface">
              {`const { saveComptageHistorization } = useComptageHistorizationStore();

const chronoHisto = await saveComptageHistorization({
  chronoSession: 12345,
  quand: "O",
  totalCaisse: 5000,
  deviseDetails: [
    {
      deviseCode: "EUR",
      montantCompte: 5000,
      ecart: 0,
      total: 5000
    }
  ]
});`}
            </code>
          </div>
        </div>

        <div className="flex justify-start">
          <button
            onClick={handleBack}
            className="px-4 py-2 border border-border rounded-md text-on-surface hover:bg-surface-hover"
          >
            Retour au menu
          </button>
        </div>
      </div>
    </ScreenLayout>
  );
}