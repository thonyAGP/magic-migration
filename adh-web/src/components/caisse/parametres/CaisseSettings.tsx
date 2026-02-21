import { useState, useEffect, useCallback } from 'react';
import { Button, Input, Label, Select, SelectOption, Checkbox } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useParametresStore } from '@/stores/parametresStore';
import { caisseConfigSchema } from './schemas';
import type { CaisseSettingsProps } from './types';

const DEVISES = [
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'USD', label: 'Dollar US (USD)' },
  { value: 'GBP', label: 'Livre Sterling (GBP)' },
  { value: 'CHF', label: 'Franc Suisse (CHF)' },
];

const FORMATS_TICKET = [
  { value: 'standard', label: 'Standard' },
  { value: 'PMS28', label: 'PMS28' },
  { value: 'A4', label: 'A4' },
  { value: 'ticket', label: 'Ticket' },
];

export function CaisseSettings({ className }: CaisseSettingsProps) {
  const { caisseConfig, printers, saveCaisseConfig, isSaving } = useParametresStore();

  const [deviseDefaut, setDeviseDefaut] = useState(caisseConfig?.deviseDefaut ?? 'EUR');
  const [modeOffline, setModeOffline] = useState(caisseConfig?.modeOffline ?? false);
  const [autoLogoutMinutes, setAutoLogoutMinutes] = useState(caisseConfig?.autoLogoutMinutes ?? 30);
  const [imprimanteDefaut, setImprimanteDefaut] = useState(caisseConfig?.imprimanteDefaut ?? '');
  const [formatTicket, setFormatTicket] = useState(caisseConfig?.formatTicket ?? 'standard');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!caisseConfig) return;

    setDeviseDefaut(caisseConfig.deviseDefaut);
    setModeOffline(caisseConfig.modeOffline);
    setAutoLogoutMinutes(caisseConfig.autoLogoutMinutes);
    setImprimanteDefaut(caisseConfig.imprimanteDefaut);
    setFormatTicket(caisseConfig.formatTicket);
  }, [caisseConfig]);

  const handleSubmit = useCallback(async () => {
    setMessage(null);

    const result = caisseConfigSchema.safeParse({
      deviseDefaut,
      modeOffline,
      autoLogoutMinutes,
      imprimanteDefaut: imprimanteDefaut || undefined,
      formatTicket: formatTicket || undefined,
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
    const success = await saveCaisseConfig({
      deviseDefaut,
      modeOffline,
      autoLogoutMinutes,
      imprimanteDefaut,
      formatTicket,
    });

    if (success) {
      setMessage({ type: 'success', text: 'Configuration sauvegardee' });
    } else {
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
    }
  }, [deviseDefaut, modeOffline, autoLogoutMinutes, imprimanteDefaut, formatTicket, saveCaisseConfig]);

  return (
    <div className={cn('space-y-6', className)}>
      <h3 className="text-sm font-semibold">Configuration de la caisse</h3>

      {message && (
        <div
          className={cn(
            'rounded-md px-3 py-2 text-sm',
            message.type === 'success' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger',
          )}
          role="alert"
          data-testid="caisse-message"
        >
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        {/* Devise */}
        <div className="space-y-1.5">
          <Label htmlFor="devise-defaut">Devise par defaut</Label>
          <Select
            id="devise-defaut"
            value={deviseDefaut}
            onChange={(e) => setDeviseDefaut(e.target.value)}
            disabled={isSaving}
          >
            {DEVISES.map((d) => (
              <SelectOption key={d.value} value={d.value}>
                {d.label}
              </SelectOption>
            ))}
          </Select>
          {errors.deviseDefaut && <p className="text-xs text-danger">{errors.deviseDefaut}</p>}
        </div>

        {/* Mode offline */}
        <div className="space-y-1.5">
          <Checkbox
            id="mode-offline"
            label="Mode offline"
            checked={modeOffline}
            onChange={(e) => setModeOffline(e.target.checked)}
            disabled={isSaving}
          />
        </div>

        {/* Auto-logout */}
        <div className="space-y-1.5">
          <Label htmlFor="auto-logout">Auto-deconnexion (minutes)</Label>
          <Input
            id="auto-logout"
            type="number"
            min={1}
            max={480}
            value={autoLogoutMinutes}
            onChange={(e) => setAutoLogoutMinutes(Number(e.target.value) || 0)}
            error={errors.autoLogoutMinutes}
            disabled={isSaving}
          />
          {errors.autoLogoutMinutes && <p className="text-xs text-danger">{errors.autoLogoutMinutes}</p>}
        </div>

        {/* Imprimante par defaut */}
        <div className="space-y-1.5">
          <Label htmlFor="imprimante-defaut">Imprimante par defaut</Label>
          <Select
            id="imprimante-defaut"
            value={imprimanteDefaut}
            onChange={(e) => setImprimanteDefaut(e.target.value)}
            disabled={isSaving}
            placeholder="Choisir une imprimante"
          >
            {printers.map((p) => (
              <SelectOption key={p.id} value={p.id}>
                {p.nom}
              </SelectOption>
            ))}
          </Select>
        </div>

        {/* Format ticket */}
        <div className="space-y-1.5">
          <Label htmlFor="format-ticket">Format ticket</Label>
          <Select
            id="format-ticket"
            value={formatTicket}
            onChange={(e) => setFormatTicket(e.target.value)}
            disabled={isSaving}
          >
            {FORMATS_TICKET.map((f) => (
              <SelectOption key={f.value} value={f.value}>
                {f.label}
              </SelectOption>
            ))}
          </Select>
        </div>
      </div>

      <Button onClick={handleSubmit} disabled={isSaving}>
        {isSaving ? 'Enregistrement...' : 'Sauvegarder'}
      </Button>
    </div>
  );
}
