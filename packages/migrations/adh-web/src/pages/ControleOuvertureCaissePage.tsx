import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenLayout } from '@/components/layout';
import { useControleOuvertureCaisseStore } from '@/stores/controleOuvertureCaisseStore';
import { useAuthStore } from '@/stores';

export function ControleOuvertureCaissePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const isValidating = useControleOuvertureCaisseStore((s) => s.isValidating);
  const validationResult = useControleOuvertureCaisseStore((s) => s.validationResult);
  const validationError = useControleOuvertureCaisseStore((s) => s.validationError);
  const reset = useControleOuvertureCaisseStore((s) => s.reset);

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
            <h2 className="text-xl font-semibold">Contrôle d'ouverture de caisse</h2>
            <p className="text-on-surface-muted text-sm mt-1">
              Service backend de validation - appelé par IDE 122 et IDE 297
            </p>
          </div>
          {user && (
            <span className="text-xs text-on-surface-muted">
              {user.prenom} {user.nom}
            </span>
          )}
        </div>

        <div className="bg-surface-elevated border border-border rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <h3 className="text-lg font-medium">Service actif</h3>
          </div>

          <div className="space-y-2 text-sm text-on-surface-muted">
            <p>
              Ce service backend effectue les validations suivantes :
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Calcul des totaux de caisse (monnaie, produits, cartes, chèques)</li>
              <li>Validation du routage mode UNI/BI</li>
              <li>Vérification de l'état de la session</li>
              <li>Contrôle des permissions opérateur</li>
              <li>Validation des paramètres d'ouverture</li>
            </ul>
          </div>

          {isValidating && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md text-sm">
              Validation en cours...
            </div>
          )}

          {validationError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              <div className="font-medium">Erreur de validation</div>
              <div className="mt-1">Code: {validationError.code}</div>
              <div>{validationError.message}</div>
              {validationError.field && (
                <div className="text-xs mt-1">Champ: {validationError.field}</div>
              )}
            </div>
          )}

          {validationResult && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
              <div className="font-medium">Validation réussie</div>
              <div className="mt-2 space-y-1">
                <div>Caisse calculée: {validationResult.caisseCalculee.toFixed(2)}</div>
                <div>Monnaie: {validationResult.caisseCalculeeMonnaie.toFixed(2)}</div>
                <div>Produits: {validationResult.caisseCalculeeProduits.toFixed(2)}</div>
                <div>Cartes: {validationResult.caisseCalculeeCartes.toFixed(2)}</div>
                <div>Chèques: {validationResult.caisseCalculeeCheque.toFixed(2)}</div>
                <div>Nb devises: {validationResult.caisseCalculeeNbDevise}</div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-surface-elevated border border-border rounded-lg p-6">
          <h3 className="text-md font-medium mb-3">Programmes appelants</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between p-3 bg-surface hover:bg-surface-hover rounded-md">
              <span>IDE 122 - Ouverture caisse</span>
              <span className="text-xs text-on-surface-muted">Mode standard</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-surface hover:bg-surface-hover rounded-md">
              <span>IDE 297 - Ouverture caisse 143</span>
              <span className="text-xs text-on-surface-muted">Mode alternatif</span>
            </div>
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

export default ControleOuvertureCaissePage;
