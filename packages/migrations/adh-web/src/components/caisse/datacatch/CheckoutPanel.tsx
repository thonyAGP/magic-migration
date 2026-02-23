import { useState, useCallback } from 'react';
import { Button, Badge } from '@/components/ui';
import { CheckCircle, XCircle, CreditCard, AlertTriangle } from 'lucide-react';
import type { GuestData } from '@/types/datacatch';

interface CheckoutPanelProps {
  guestData: GuestData | null;
  onAccept: () => void;
  onDecline: (reason: string) => void;
  onCancelPass: () => void;
  isProcessing?: boolean;
}

const STATUS_LABELS: Record<string, { label: string; variant: 'success' | 'warning' | 'secondary' }> = {
  checked_in: { label: 'Checked In', variant: 'success' },
  checking_out: { label: 'Checking Out', variant: 'warning' },
  checked_out: { label: 'Checked Out', variant: 'secondary' },
};

export function CheckoutPanel({
  guestData,
  onAccept,
  onDecline,
  onCancelPass,
  isProcessing = false,
}: CheckoutPanelProps) {
  const [showDeclineForm, setShowDeclineForm] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleDeclineSubmit = useCallback(() => {
    if (declineReason.trim()) {
      onDecline(declineReason.trim());
      setShowDeclineForm(false);
      setDeclineReason('');
    }
  }, [declineReason, onDecline]);

  const handleCancelPassConfirm = useCallback(() => {
    onCancelPass();
    setShowCancelConfirm(false);
  }, [onCancelPass]);

  if (!guestData) {
    return (
      <div className="rounded-md border border-border p-6 text-center text-on-surface-muted">
        Aucun guest selectionne pour le checkout.
      </div>
    );
  }

  const statusInfo = STATUS_LABELS[guestData.status] ?? {
    label: guestData.status,
    variant: 'secondary' as const,
  };

  return (
    <div className="space-y-4 rounded-md border border-border p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Checkout</h3>
        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
      </div>

      {/* Guest summary */}
      <div className="space-y-2 rounded-md bg-surface-dim p-3 text-sm">
        <div className="flex justify-between">
          <span className="text-on-surface-muted">Nom</span>
          <span className="font-medium">{guestData.prenom} {guestData.nom}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-on-surface-muted">Chambre</span>
          <span className="font-medium">{guestData.chambre}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-on-surface-muted">Arrivee</span>
          <span>{guestData.dateArrivee}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-on-surface-muted">Depart</span>
          <span>{guestData.dateDepart}</span>
        </div>
        {guestData.passId && (
          <div className="flex justify-between">
            <span className="text-on-surface-muted">Pass</span>
            <span>{guestData.passId}</span>
          </div>
        )}
      </div>

      {/* Solde warning */}
      {guestData.solde > 0 && (
        <div className="flex items-center gap-2 rounded-md bg-warning/10 px-3 py-2 text-sm text-warning">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>Solde restant: {guestData.solde.toFixed(2)} EUR</span>
        </div>
      )}

      {/* Decline form */}
      {showDeclineForm && (
        <div className="space-y-2 rounded-md border border-border p-3">
          <label className="text-sm font-medium">Motif du refus</label>
          <textarea
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            rows={3}
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            placeholder="Indiquer le motif du refus..."
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDeclineSubmit}
              disabled={!declineReason.trim() || isProcessing}
            >
              Confirmer le refus
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setShowDeclineForm(false);
                setDeclineReason('');
              }}
            >
              Annuler
            </Button>
          </div>
        </div>
      )}

      {/* Cancel pass confirm */}
      {showCancelConfirm && (
        <div className="space-y-2 rounded-md border border-danger/30 bg-danger/5 p-3">
          <p className="text-sm">Confirmer l&apos;annulation du pass ?</p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="destructive"
              onClick={handleCancelPassConfirm}
              disabled={isProcessing}
            >
              Oui, annuler le pass
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowCancelConfirm(false)}
            >
              Non
            </Button>
          </div>
        </div>
      )}

      {/* Actions */}
      {!showDeclineForm && !showCancelConfirm && (
        <div className="flex flex-wrap gap-2 pt-2">
          <Button onClick={onAccept} disabled={isProcessing}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Accepter checkout
          </Button>
          <Button
            variant="destructive"
            onClick={() => setShowDeclineForm(true)}
            disabled={isProcessing}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Refuser
          </Button>
          {guestData.passId && (
            <Button
              variant="outline"
              onClick={() => setShowCancelConfirm(true)}
              disabled={isProcessing}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Annuler pass
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
