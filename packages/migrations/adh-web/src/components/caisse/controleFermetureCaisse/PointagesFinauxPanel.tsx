import { useState } from 'react';
import { Button, Dialog } from '@/components/ui';
import { useControleFermetureCaisseStore } from '@/stores/controleFermetureCaisseStore';
import { cn } from '@/lib/utils';
import type { PointageDevise as _PointageDevise, PointageArticle as _PointageArticle, PointageApproRemise as _PointageApproRemise } from '@/types/controleFermetureCaisse';

interface PointagesFinauxPanelProps {
  onValidate: () => void;
  className?: string;
}

export const PointagesFinauxPanel = ({ onValidate, className }: PointagesFinauxPanelProps) => {
  const devisesPointees = useControleFermetureCaisseStore((s) => s.devisesPointees);
  const articlesPointes = useControleFermetureCaisseStore((s) => s.articlesPointes);
  const approRemisesPointes = useControleFermetureCaisseStore((s) => s.approRemisesPointes);

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const allDevisesPointed = devisesPointees.every((d) => d.devisesPointees);
  const hasArticles = articlesPointes.some((a) => a.existeArticleStock);
  const hasApproRemises = approRemisesPointes.length > 0;

  const canValidate = allDevisesPointed;

  const handleValidate = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirm = () => {
    setShowConfirmDialog(false);
    onValidate();
  };

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Pointage Devises</h3>
        {devisesPointees.length === 0 ? (
          <p className="text-sm text-gray-500">Aucune devise à pointer</p>
        ) : (
          <div className="space-y-3">
            {devisesPointees.map((devise, idx) => (
              <div
                key={idx}
                className={cn(
                  'flex items-center justify-between p-3 rounded border',
                  devise.devisesPointees
                    ? 'bg-green-50 border-green-200'
                    : 'bg-yellow-50 border-yellow-200'
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-2 h-2 rounded-full',
                      devise.devisesPointees ? 'bg-green-500' : 'bg-yellow-500'
                    )}
                  />
                  <span className="font-medium text-sm text-gray-900">
                    {devise.deviseLocale}
                  </span>
                  <span className="text-sm text-gray-600">
                    ({devise.nombreDevises} devise{devise.nombreDevises > 1 ? 's' : ''})
                  </span>
                </div>
                <span
                  className={cn(
                    'text-xs font-medium px-2 py-1 rounded',
                    devise.devisesPointees
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  )}
                >
                  {devise.devisesPointees ? 'Pointé' : 'En attente'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Pointage Articles</h3>
        {articlesPointes.length === 0 ? (
          <p className="text-sm text-gray-500">Aucun article à pointer</p>
        ) : (
          <div className="space-y-3">
            {articlesPointes.map((article, idx) => (
              <div
                key={idx}
                className={cn(
                  'flex items-center justify-between p-3 rounded border',
                  article.existeArticleStock
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-gray-50 border-gray-200'
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-2 h-2 rounded-full',
                      article.existeArticleStock ? 'bg-blue-500' : 'bg-gray-400'
                    )}
                  />
                  <span className="text-sm text-gray-900">
                    {article.existeArticleStock ? 'Article en stock détecté' : 'Pas d\'article en stock'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Pointage Appro/Remises</h3>
        {approRemisesPointes.length === 0 ? (
          <p className="text-sm text-gray-500">Aucune appro/remise à pointer</p>
        ) : (
          <div className="space-y-3">
            {approRemisesPointes.map((appro) => (
              <div
                key={appro.id}
                className="flex items-center gap-3 p-3 rounded border bg-purple-50 border-purple-200"
              >
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <span className="text-sm text-gray-900">Appro/Remise #{appro.id}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {!canValidate && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            ⚠️ Tous les pointages de devises doivent être complétés avant de valider.
          </p>
        </div>
      )}

      <div className="flex justify-end pt-4">
        <Button
          onClick={handleValidate}
          disabled={!canValidate}
          className={cn(
            'px-6 py-2 font-medium transition-colors',
            canValidate
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          )}
        >
          Valider Pointages
        </Button>
      </div>

      <Dialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        title="Confirmer la validation"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            Êtes-vous sûr de vouloir valider les pointages finaux ?
          </p>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="font-medium">Devises pointées :</span>
              <span>{devisesPointees.filter(d => d.devisesPointees).length}/{devisesPointees.length}</span>
            </div>
            {hasArticles && (
              <div className="flex items-center gap-2">
                <span className="font-medium">Articles en stock :</span>
                <span>{articlesPointes.filter(a => a.existeArticleStock).length}</span>
              </div>
            )}
            {hasApproRemises && (
              <div className="flex items-center gap-2">
                <span className="font-medium">Appro/Remises :</span>
                <span>{approRemisesPointes.length}</span>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              onClick={() => setShowConfirmDialog(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              Annuler
            </Button>
            <Button
              onClick={handleConfirm}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700"
            >
              Confirmer
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};