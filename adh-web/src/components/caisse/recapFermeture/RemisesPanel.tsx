import { useState } from 'react';
import { Button, Dialog, Input } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { RemiseEnCaisse } from '@/types/recapFermeture';

interface RemisesPanelProps {
  remises: RemiseEnCaisse[];
  isLoading: boolean;
  onSaveRemise: (remise: RemiseEnCaisse) => Promise<void>;
  className?: string;
}

export const RemisesPanel = ({
  remises,
  isLoading,
  onSaveRemise,
  className
}: RemisesPanelProps) => {
  const [editingRemise, setEditingRemise] = useState<RemiseEnCaisse | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState<RemiseEnCaisse>({
    detailProduitRemiseEdite: false,
    montantRemiseMonnaie: 0,
    detailRemiseFinaleEdite: false
  });

  const handleEdit = (remise: RemiseEnCaisse) => {
    setEditingRemise(remise);
    setFormData({ ...remise });
    setShowDialog(true);
  };

  const handleSave = async () => {
    try {
      await onSaveRemise(formData);
      setShowDialog(false);
      setEditingRemise(null);
    } catch (err) {
      console.error('Erreur sauvegarde remise:', err);
    }
  };

  const handleCancel = () => {
    setShowDialog(false);
    setEditingRemise(null);
  };

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  if (!remises || remises.length === 0) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <div className="text-gray-500">Aucune remise disponible</div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Produit édité
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                Montant monnaie
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Finale éditée
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {remises.map((remise, index) => (
              <tr
                key={index}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3 text-sm text-gray-900">
                  {remise.detailProduitRemiseEdite ? (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                      Oui
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      Non
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-right font-mono text-gray-900">
                  {remise.montantRemiseMonnaie.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {remise.detailRemiseFinaleEdite ? (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                      Oui
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      Non
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(remise)}
                  >
                    Modifier
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog
        isOpen={showDialog}
        onClose={handleCancel}
        title="Modifier la remise"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="detailProduitRemiseEdite"
              checked={formData.detailProduitRemiseEdite}
              onChange={(e) => setFormData({
                ...formData,
                detailProduitRemiseEdite: e.target.checked
              })}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            <label
              htmlFor="detailProduitRemiseEdite"
              className="text-sm font-medium text-gray-700"
            >
              Détail produit remise édité
            </label>
          </div>

          <div>
            <label
              htmlFor="montantRemiseMonnaie"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Montant remise monnaie
            </label>
            <Input
              id="montantRemiseMonnaie"
              type="number"
              step="0.01"
              value={formData.montantRemiseMonnaie}
              onChange={(e) => setFormData({
                ...formData,
                montantRemiseMonnaie: parseFloat(e.target.value) || 0
              })}
              className="w-full"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="detailRemiseFinaleEdite"
              checked={formData.detailRemiseFinaleEdite}
              onChange={(e) => setFormData({
                ...formData,
                detailRemiseFinaleEdite: e.target.checked
              })}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            <label
              htmlFor="detailRemiseFinaleEdite"
              className="text-sm font-medium text-gray-700"
            >
              Détail remise finale éditée
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handleCancel}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
            >
              Enregistrer
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};