import { useState, useEffect, useCallback } from 'react';
import { ScreenLayout } from '@/components/layout';
import { Button, Dialog, Input } from '@/components/ui';
import { useEmailSearchStore } from '@/stores/emailSearchStore';
import { cn } from '@/lib/utils';
import type { EmailAddress, CreateEmailDto, UpdateEmailDto } from '@/types/emailSearch';

export const EmailSearchPage = () => {
  const emails = useEmailSearchStore((s) => s.emails);
  const selectedEmail = useEmailSearchStore((s) => s.selectedEmail);
  const isLoading = useEmailSearchStore((s) => s.isLoading);
  const error = useEmailSearchStore((s) => s.error);
  const filters = useEmailSearchStore((s) => s.filters);
  const searchEmails = useEmailSearchStore((s) => s.searchEmails);
  const createEmail = useEmailSearchStore((s) => s.createEmail);
  const updateEmail = useEmailSearchStore((s) => s.updateEmail);
  const deleteEmail = useEmailSearchStore((s) => s.deleteEmail);
  const setAsPrincipal = useEmailSearchStore((s) => s.setAsPrincipal);
  const selectEmail = useEmailSearchStore((s) => s.selectEmail);
  const setFilters = useEmailSearchStore((s) => s.setFilters);
  const clearFilters = useEmailSearchStore((s) => s.clearFilters);
  const resetState = useEmailSearchStore((s) => s.resetState);

  const [showDialog, setShowDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<CreateEmailDto>({
    societe: '',
    compte: '',
    filiation: 0,
    email: '',
    isPrincipal: false,
  });

  useEffect(() => {
    return () => resetState();
  }, [resetState]);

  const handleSearch = useCallback(() => {
    searchEmails(filters);
  }, [filters, searchEmails]);

  const handleClearFilters = useCallback(() => {
    clearFilters();
  }, [clearFilters]);

  const handleFilterChange = useCallback(
    (field: keyof typeof filters, value: string | number | null) => {
      setFilters({ ...filters, [field]: value });
    },
    [filters, setFilters],
  );

  const handleAddNew = useCallback(() => {
    setIsEditMode(false);
    setFormData({
      societe: filters.societe || '',
      compte: filters.compte || '',
      filiation: filters.filiation || 0,
      email: '',
      isPrincipal: false,
    });
    setShowDialog(true);
  }, [filters]);

  const handleEdit = useCallback(() => {
    if (!selectedEmail) return;
    setIsEditMode(true);
    setFormData({
      societe: selectedEmail.societe,
      compte: selectedEmail.compte,
      filiation: selectedEmail.filiation,
      email: selectedEmail.email,
      isPrincipal: selectedEmail.isPrincipal,
    });
    setShowDialog(true);
  }, [selectedEmail]);

  const handleDelete = useCallback(async () => {
    if (!selectedEmail) return;
    if (!confirm('Confirmer la suppression de cette adresse email ?')) return;
    await deleteEmail(selectedEmail.id);
    selectEmail(null);
  }, [selectedEmail, deleteEmail, selectEmail]);

  const handleSetPrincipal = useCallback(async () => {
    if (!selectedEmail) return;
    await setAsPrincipal(selectedEmail.id);
  }, [selectedEmail, setAsPrincipal]);

  const handleSave = useCallback(async () => {
    if (isEditMode && selectedEmail) {
      const updateData: UpdateEmailDto = {
        email: formData.email,
        isPrincipal: formData.isPrincipal,
      };
      await updateEmail(selectedEmail.id, updateData);
    } else {
      await createEmail(formData);
    }
    setShowDialog(false);
  }, [isEditMode, selectedEmail, formData, createEmail, updateEmail]);

  const handleRowClick = useCallback(
    (email: EmailAddress) => {
      selectEmail(email.id === selectedEmail?.id ? null : email);
    },
    [selectedEmail, selectEmail],
  );

  return (
    <ScreenLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div>
          <h2 className="text-xl font-semibold">Recherche d'adresses email</h2>
          <p className="text-on-surface-muted text-sm mt-1">
            Gérer les adresses email des adhérents
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="bg-surface border border-border rounded-lg p-4">
          <h3 className="text-sm font-medium mb-4">Filtres de recherche</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              label="Société"
              value={filters.societe}
              onChange={(e) => handleFilterChange('societe', e.target.value)}
              placeholder="SKI, EXCHANGE..."
            />
            <Input
              label="Compte"
              value={filters.compte}
              onChange={(e) => handleFilterChange('compte', e.target.value)}
              placeholder="100001..."
            />
            <Input
              label="Filiation"
              type="number"
              value={filters.filiation?.toString() || ''}
              onChange={(e) =>
                handleFilterChange('filiation', e.target.value ? parseInt(e.target.value) : null)
              }
              placeholder="0, 1, 2..."
            />
            <Input
              label="Email"
              value={filters.email}
              onChange={(e) => handleFilterChange('email', e.target.value)}
              placeholder="Rechercher..."
            />
          </div>
          <div className="flex gap-3 mt-4">
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? 'Recherche...' : 'Rechercher'}
            </Button>
            <Button variant="secondary" onClick={handleClearFilters}>
              Réinitialiser
            </Button>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="text-sm font-medium">
              Résultats ({emails.length} {emails.length > 1 ? 'adresses' : 'adresse'})
            </h3>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleEdit}
                disabled={!selectedEmail}
                variant="secondary"
              >
                Modifier
              </Button>
              <Button
                size="sm"
                onClick={handleDelete}
                disabled={!selectedEmail}
                variant="secondary"
              >
                Supprimer
              </Button>
              <Button
                size="sm"
                onClick={handleSetPrincipal}
                disabled={!selectedEmail || selectedEmail.isPrincipal}
                variant="secondary"
              >
                Définir principal
              </Button>
              <Button size="sm" onClick={handleAddNew}>
                Ajouter
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-on-surface-muted">
              Chargement des adresses email...
            </div>
          ) : emails.length === 0 ? (
            <div className="p-8 text-center text-on-surface-muted">
              Aucune adresse email trouvée. Utilisez les filtres ou ajoutez-en une nouvelle.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-hover">
                  <tr>
                    <th className="text-left p-3 text-xs font-medium text-on-surface-muted">
                      Société
                    </th>
                    <th className="text-left p-3 text-xs font-medium text-on-surface-muted">
                      Compte
                    </th>
                    <th className="text-left p-3 text-xs font-medium text-on-surface-muted">
                      Filiation
                    </th>
                    <th className="text-left p-3 text-xs font-medium text-on-surface-muted">
                      Email
                    </th>
                    <th className="text-left p-3 text-xs font-medium text-on-surface-muted">
                      Principal
                    </th>
                    <th className="text-left p-3 text-xs font-medium text-on-surface-muted">
                      Créé le
                    </th>
                    <th className="text-left p-3 text-xs font-medium text-on-surface-muted">
                      Modifié le
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {emails.map((email) => (
                    <tr
                      key={email.id}
                      onClick={() => handleRowClick(email)}
                      className={cn(
                        'border-b border-border cursor-pointer hover:bg-surface-hover transition-colors',
                        selectedEmail?.id === email.id && 'bg-primary/10',
                      )}
                    >
                      <td className="p-3 text-sm">{email.societe}</td>
                      <td className="p-3 text-sm">{email.compte}</td>
                      <td className="p-3 text-sm">{email.filiation}</td>
                      <td className="p-3 text-sm font-mono">{email.email}</td>
                      <td className="p-3 text-sm">
                        {email.isPrincipal ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Oui
                          </span>
                        ) : (
                          <span className="text-on-surface-muted">Non</span>
                        )}
                      </td>
                      <td className="p-3 text-sm text-on-surface-muted">
                        {email.createdAt
                          ? new Date(email.createdAt).toLocaleDateString('fr-FR')
                          : '-'}
                      </td>
                      <td className="p-3 text-sm text-on-surface-muted">
                        {email.updatedAt
                          ? new Date(email.updatedAt).toLocaleDateString('fr-FR')
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Dialog
          open={showDialog}
          onClose={() => setShowDialog(false)}
          title={isEditMode ? 'Modifier une adresse email' : 'Ajouter une adresse email'}
        >
          <div className="space-y-4">
            <Input
              label="Société"
              value={formData.societe}
              onChange={(e) => setFormData({ ...formData, societe: e.target.value })}
              disabled={isEditMode}
              required
            />
            <Input
              label="Compte"
              value={formData.compte}
              onChange={(e) => setFormData({ ...formData, compte: e.target.value })}
              disabled={isEditMode}
              required
            />
            <Input
              label="Filiation"
              type="number"
              value={formData.filiation.toString()}
              onChange={(e) =>
                setFormData({ ...formData, filiation: parseInt(e.target.value) || 0 })
              }
              disabled={isEditMode}
              required
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPrincipal"
                checked={formData.isPrincipal}
                onChange={(e) => setFormData({ ...formData, isPrincipal: e.target.checked })}
                className="w-4 h-4 rounded border-border"
              />
              <label htmlFor="isPrincipal" className="text-sm">
                Adresse email principale
              </label>
            </div>
            <div className="flex gap-3 justify-end pt-4">
              <Button variant="secondary" onClick={() => setShowDialog(false)}>
                Annuler
              </Button>
              <Button onClick={handleSave}>{isEditMode ? 'Modifier' : 'Créer'}</Button>
            </div>
          </div>
        </Dialog>
      </div>
    </ScreenLayout>
  );
};