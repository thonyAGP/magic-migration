import { useState } from 'react';
import { Button } from '@/components/ui';
import { Users, Trash2, Plus } from 'lucide-react';
import type { Affiliate, LienParente } from '@/types/clubmedpass';

interface PassAffiliateSelectorProps {
  passId: string;
  affiliates: Affiliate[];
  onAdd: (affiliate: Omit<Affiliate, 'id' | 'isActive'>) => void;
  onRemove: (affiliateId: string) => void;
  onToggle: (affiliateId: string, active: boolean) => void;
  isLoading?: boolean;
}

const LIEN_LABELS: Record<LienParente, { label: string; color: string }> = {
  conjoint: { label: 'Conjoint', color: 'bg-blue-100 text-blue-800' },
  enfant: { label: 'Enfant', color: 'bg-green-100 text-green-800' },
  parent: { label: 'Parent', color: 'bg-purple-100 text-purple-800' },
  autre: { label: 'Autre', color: 'bg-gray-100 text-gray-800' },
};

const LIEN_OPTIONS: LienParente[] = ['conjoint', 'enfant', 'parent', 'autre'];

export function PassAffiliateSelector({
  passId: _passId,
  affiliates,
  onAdd,
  onRemove,
  onToggle,
  isLoading = false,
}: PassAffiliateSelectorProps) {
  const [showForm, setShowForm] = useState(false);
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [dateNaissance, setDateNaissance] = useState('');
  const [lienParente, setLienParente] = useState<LienParente>('conjoint');
  const [formError, setFormError] = useState('');

  const resetForm = () => {
    setNom('');
    setPrenom('');
    setDateNaissance('');
    setLienParente('conjoint');
    setFormError('');
    setShowForm(false);
  };

  const handleSubmit = () => {
    if (!nom.trim() || !prenom.trim()) {
      setFormError('Nom et prenom sont requis');
      return;
    }
    onAdd({ nom: nom.trim(), prenom: prenom.trim(), dateNaissance, lienParente });
    resetForm();
  };

  if (isLoading) {
    return (
      <div className="space-y-2 rounded-md border border-border p-4">
        <div className="h-5 w-32 animate-pulse rounded bg-surface-dim" />
        <div className="h-12 w-full animate-pulse rounded bg-surface-dim" />
        <div className="h-12 w-full animate-pulse rounded bg-surface-dim" />
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-md border border-border p-4">
      <div className="flex items-center justify-between">
        <h4 className="flex items-center gap-2 text-sm font-semibold">
          <Users className="h-4 w-4" />
          Affilies ({affiliates.length})
        </h4>
        {!showForm && (
          <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
            <Plus className="mr-1 h-3 w-3" />
            Ajouter
          </Button>
        )}
      </div>

      {/* Affiliate list */}
      {affiliates.length === 0 && !showForm && (
        <p className="text-sm text-on-surface-muted">Aucun affilie enregistre</p>
      )}

      {affiliates.map((affiliate) => {
        const lien = LIEN_LABELS[affiliate.lienParente] ?? LIEN_LABELS.autre;
        return (
          <div
            key={affiliate.id}
            className="flex items-center justify-between rounded-md border border-border px-3 py-2"
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={affiliate.isActive}
                onChange={(e) => onToggle(affiliate.id, e.target.checked)}
                className="h-4 w-4 rounded border-border"
                aria-label={`Activer ${affiliate.prenom} ${affiliate.nom}`}
              />
              <div>
                <p className="text-sm font-medium">
                  {affiliate.prenom} {affiliate.nom}
                </p>
                {affiliate.dateNaissance && (
                  <p className="text-xs text-on-surface-muted">{affiliate.dateNaissance}</p>
                )}
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${lien.color}`}>
                {lien.label}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemove(affiliate.id)}
              aria-label={`Supprimer ${affiliate.prenom} ${affiliate.nom}`}
            >
              <Trash2 className="h-4 w-4 text-danger" />
            </Button>
          </div>
        );
      })}

      {/* Add form */}
      {showForm && (
        <div className="space-y-2 rounded-md border border-dashed border-border p-3">
          <p className="text-xs font-medium text-on-surface-muted">Nouvel affilie</p>
          {formError && (
            <p className="text-xs text-danger">{formError}</p>
          )}
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Nom"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="rounded-md border border-border bg-surface px-2 py-1.5 text-sm"
              aria-label="Nom"
            />
            <input
              type="text"
              placeholder="Prenom"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              className="rounded-md border border-border bg-surface px-2 py-1.5 text-sm"
              aria-label="Prenom"
            />
            <input
              type="date"
              value={dateNaissance}
              onChange={(e) => setDateNaissance(e.target.value)}
              className="rounded-md border border-border bg-surface px-2 py-1.5 text-sm"
              aria-label="Date de naissance"
            />
            <select
              value={lienParente}
              onChange={(e) => setLienParente(e.target.value as LienParente)}
              className="rounded-md border border-border bg-surface px-2 py-1.5 text-sm"
              aria-label="Lien de parente"
            >
              {LIEN_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {LIEN_LABELS[opt].label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={resetForm}>
              Annuler
            </Button>
            <Button size="sm" onClick={handleSubmit}>
              Ajouter
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
