import { useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import type { SessionInfo } from '@/types/sessionOuverture';

interface OuverturePanelProps {
  onComplete: (chrono: number) => void;
  onCancel: () => void;
  deviseCode: string;
  countingResults: {
    totalMonnaie: number;
    totalProduits: number;
    totalCartes: number;
    totalCheques: number;
    totalOD: number;
  };
}

interface ConcurrentSessionDialogProps {
  sessions: SessionInfo[];
  vilOpenSessions: boolean;
  isSupervisor: boolean;
  onForceOpen: () => void;
  onCancel: () => void;
}

const ConcurrentSessionDialog = ({
  sessions,
  vilOpenSessions,
  isSupervisor,
  onForceOpen,
  onCancel,
}: ConcurrentSessionDialogProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Session déjà ouverte
            </h2>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            {vilOpenSessions
              ? "Une session VIL est déjà ouverte sur ce poste."
              : "Une session caisse est déjà ouverte :"}
          </p>

          {sessions.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              {sessions.map((session, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-gray-600">Session #{session.chrono}</span>
                  <span className="text-gray-900 font-medium">
                    {session.operateur}
                  </span>
                </div>
              ))}
            </div>
          )}

          <p className="text-sm text-gray-600">
            Vous devez fermer la session existante avant d'en ouvrir une nouvelle.
          </p>

          {isSupervisor && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs text-amber-800">
                En tant que superviseur, vous pouvez forcer l'ouverture d'une nouvelle session.
                Cette action fermera automatiquement la session existante.
              </p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
          <Button variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          {isSupervisor && (
            <Button variant="destructive" onClick={onForceOpen}>
              Forcer l'ouverture
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export const OuverturePanel = ({
  onComplete,
  onCancel,
  deviseCode,
  countingResults,
}: OuverturePanelProps) => {
  const [isOpening, setIsOpening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConcurrentWarning, setShowConcurrentWarning] = useState(false);
  const [concurrentSessions, setConcurrentSessions] = useState<SessionInfo[]>([]);
  const [vilOpenSessions, setVilOpenSessions] = useState(false);

  const isSupervisor = false;

  const handleOpen = async (forceOpen = false) => {
    setIsOpening(true);
    setError(null);
    setShowConcurrentWarning(false);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (!forceOpen) {
        const hasConcurrent = Math.random() > 0.7;
        if (hasConcurrent) {
          setConcurrentSessions([
            {
              chrono: 42,
              dateOuverture: new Date(),
              operateur: 'MARTIN',
              status: 'open',
            },
          ]);
          setVilOpenSessions(false);
          setShowConcurrentWarning(true);
          setIsOpening(false);
          return;
        }
      }

      const newChrono = Math.floor(Math.random() * 1000) + 1;
      onComplete(newChrono);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'ouverture de la session');
      setIsOpening(false);
    }
  };

  const handleForceOpen = async () => {
    await handleOpen(true);
  };

  const handleCancelWarning = () => {
    setShowConcurrentWarning(false);
    setConcurrentSessions([]);
    setVilOpenSessions(false);
    setIsOpening(false);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            Récapitulatif du comptage
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Monnaie ({deviseCode})</span>
              <span className="text-sm font-medium text-gray-900">
                {countingResults.totalMonnaie.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Produits</span>
              <span className="text-sm font-medium text-gray-900">
                {countingResults.totalProduits.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Cartes</span>
              <span className="text-sm font-medium text-gray-900">
                {countingResults.totalCartes.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Chèques</span>
              <span className="text-sm font-medium text-gray-900">
                {countingResults.totalCheques.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">O.D.</span>
              <span className="text-sm font-medium text-gray-900">
                {countingResults.totalOD.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between py-3 border-t-2 border-gray-300 mt-2">
              <span className="text-base font-semibold text-gray-900">Total</span>
              <span className="text-base font-semibold text-gray-900">
                {(
                  countingResults.totalMonnaie +
                  countingResults.totalProduits +
                  countingResults.totalCartes +
                  countingResults.totalCheques +
                  countingResults.totalOD
                ).toFixed(2)} {deviseCode}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">Erreur</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            L'ouverture de la session va créer un ticket récapitulatif et initialiser la caisse avec les montants comptés.
          </p>
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onCancel} disabled={isOpening}>
            Annuler
          </Button>
          <Button onClick={() => handleOpen(false)} disabled={isOpening}>
            {isOpening ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Ouverture en cours...
              </>
            ) : (
              'Ouvrir la session'
            )}
          </Button>
        </div>
      </div>

      {showConcurrentWarning && (
        <ConcurrentSessionDialog
          sessions={concurrentSessions}
          vilOpenSessions={vilOpenSessions}
          isSupervisor={isSupervisor}
          onForceOpen={handleForceOpen}
          onCancel={handleCancelWarning}
        />
      )}
    </>
  );
};