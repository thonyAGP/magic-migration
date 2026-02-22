import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { CaisseControl, CaisseCalculee, ValidationError, ModeUniCheck } from '@/types/controleOuvertureCaisse';

interface BackendValidationServicePanelProps {
  className?: string;
}

export const BackendValidationServicePanel = ({ className }: BackendValidationServicePanelProps) => {
  const [lastValidation, setLastValidation] = useState<{
    timestamp: Date;
    params: CaisseControl;
    result: CaisseCalculee;
  } | null>(null);
  const [lastError, setLastError] = useState<{
    timestamp: Date;
    error: ValidationError;
  } | null>(null);
  const [modeCheck, setModeCheck] = useState<{
    mode: string;
    result: ModeUniCheck;
  } | null>(null);

  return (
    <div className={cn("bg-surface-elevated border border-border rounded-lg p-6", className)}>
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
          <div>
            <h3 className="text-lg font-semibold">Service de Validation Backend</h3>
            <p className="text-sm text-on-surface-muted mt-1">
              Appelé automatiquement par IDE 122 et IDE 297
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-surface border border-border rounded-lg p-4">
            <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Validations effectuées
            </h4>
            <ul className="space-y-2 text-sm text-on-surface-muted">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">•</span>
                <span>Calcul des totaux de caisse (7 composantes)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">•</span>
                <span>Validation du mode UNI/BI</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">•</span>
                <span>Vérification état de session</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">•</span>
                <span>Contrôle permissions opérateur</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">•</span>
                <span>Validation paramètres obligatoires</span>
              </li>
            </ul>
          </div>

          <div className="bg-surface border border-border rounded-lg p-4">
            <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Codes de retour
            </h4>
            <ul className="space-y-2 text-sm text-on-surface-muted">
              <li className="flex items-start gap-2">
                <code className="text-xs bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded">ERR_SESSION</code>
                <span>Session déjà ouverte</span>
              </li>
              <li className="flex items-start gap-2">
                <code className="text-xs bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded">ERR_PERM</code>
                <span>Permissions insuffisantes</span>
              </li>
              <li className="flex items-start gap-2">
                <code className="text-xs bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded">ERR_PARAMS</code>
                <span>Paramètres manquants</span>
              </li>
              <li className="flex items-start gap-2">
                <code className="text-xs bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded">ERR_MODE</code>
                <span>Mode UNI/BI invalide</span>
              </li>
              <li className="flex items-start gap-2">
                <code className="text-xs bg-green-500/10 text-green-500 px-1.5 py-0.5 rounded">OK</code>
                <span>Validation réussie + totaux</span>
              </li>
            </ul>
          </div>
        </div>

        {(lastValidation || lastError || modeCheck) && (
          <div className="border-t border-border pt-4">
            <h4 className="font-medium text-sm mb-3">Dernières opérations</h4>
            <div className="space-y-2">
              {lastValidation && (
                <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-3 text-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="font-medium text-green-600 mb-1">Validation réussie</div>
                      <div className="text-xs text-on-surface-muted">
                        {lastValidation.timestamp.toLocaleTimeString('fr-FR')} - Session {lastValidation.params.chronoSession}
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                        <div>Caisse calculée: {lastValidation.result.caisseCalculee.toFixed(2)}</div>
                        <div>Monnaie: {lastValidation.result.caisseCalculeeMonnaie.toFixed(2)}</div>
                        <div>Produits: {lastValidation.result.caisseCalculeeProduits.toFixed(2)}</div>
                        <div>Cartes: {lastValidation.result.caisseCalculeeCartes.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {lastError && (
                <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3 text-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="font-medium text-red-600 mb-1">Erreur de validation</div>
                      <div className="text-xs text-on-surface-muted mb-2">
                        {lastError.timestamp.toLocaleTimeString('fr-FR')}
                      </div>
                      <div className="text-xs space-y-1">
                        <div>Code: <code className="bg-red-500/10 px-1 py-0.5 rounded">{lastError.error.code}</code></div>
                        <div>Message: {lastError.error.message}</div>
                        {lastError.error.field && <div>Champ: {lastError.error.field}</div>}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {modeCheck && (
                <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3 text-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="font-medium text-blue-600 mb-1">Vérification mode UNI/BI</div>
                      <div className="text-xs space-y-1">
                        <div>Mode: <code className="bg-blue-500/10 px-1 py-0.5 rounded">{modeCheck.mode}</code></div>
                        <div>Is UNI: {modeCheck.result.isUni ? '✓' : '✗'}</div>
                        <div>Is BI: {modeCheck.result.isBi ? '✓' : '✗'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-on-surface-muted">
              <p className="font-medium text-blue-600 mb-1">Service Backend - Pas d'interface utilisateur</p>
              <p>
                Ce service est appelé automatiquement par les programmes IDE 122 (Ouverture caisse) 
                et IDE 297 (Validation session). Les résultats sont retournés via API et utilisés 
                par les écrans de saisie pour afficher les totaux calculés ou les messages d'erreur.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};