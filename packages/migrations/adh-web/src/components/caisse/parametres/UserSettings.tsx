import { useState, useCallback } from 'react';
import { Button, Input, Label } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useParametresStore } from '@/stores/parametresStore';
import { passwordSchema } from './schemas';
import type { UserSettingsProps } from './types';

export function UserSettings({ className }: UserSettingsProps) {
  const { profile, updatePassword, isSaving } = useParametresStore();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = useCallback(async () => {
    setMessage(null);

    const result = passwordSchema.safeParse({
      currentPassword,
      newPassword,
      confirmPassword,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = String(issue.path[0]);
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    const success = await updatePassword(currentPassword, newPassword, confirmPassword);

    if (success) {
      setMessage({ type: 'success', text: 'Mot de passe modifie avec succes' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setMessage({ type: 'error', text: 'Erreur lors du changement de mot de passe' });
    }
  }, [currentPassword, newPassword, confirmPassword, updatePassword]);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Profile info (read-only) */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Informations du profil</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-xs text-on-surface-muted">Nom</Label>
            <p className="text-sm font-medium" data-testid="profile-nom">{profile?.nom ?? '-'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-on-surface-muted">Prenom</Label>
            <p className="text-sm font-medium" data-testid="profile-prenom">{profile?.prenom ?? '-'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-on-surface-muted">Identifiant</Label>
            <p className="text-sm font-medium" data-testid="profile-login">{profile?.login ?? '-'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-on-surface-muted">Role</Label>
            <p className="text-sm font-medium" data-testid="profile-role">{profile?.role ?? '-'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-on-surface-muted">Dernier login</Label>
            <p className="text-sm font-medium">{profile?.lastLogin ? new Date(profile.lastLogin).toLocaleString('fr-FR') : '-'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-on-surface-muted">Expiration mot de passe</Label>
            <p className="text-sm font-medium">{profile?.passwordExpiry ?? '-'}</p>
          </div>
        </div>
      </div>

      {/* Password change form */}
      <div className="space-y-4 border-t border-border pt-4">
        <h3 className="text-sm font-semibold">Changer le mot de passe</h3>

        {message && (
          <div
            className={cn(
              'rounded-md px-3 py-2 text-sm',
              message.type === 'success' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger',
            )}
            role="alert"
            data-testid="password-message"
          >
            {message.text}
          </div>
        )}

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="current-password">Mot de passe actuel</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              error={errors.currentPassword}
              disabled={isSaving}
            />
            {errors.currentPassword && (
              <p className="text-xs text-danger">{errors.currentPassword}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="new-password">Nouveau mot de passe</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={errors.newPassword}
              disabled={isSaving}
            />
            {errors.newPassword && (
              <p className="text-xs text-danger">{errors.newPassword}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              disabled={isSaving}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-danger">{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        <Button onClick={handleSubmit} disabled={isSaving}>
          {isSaving ? 'Enregistrement...' : 'Changer le mot de passe'}
        </Button>
      </div>
    </div>
  );
}
