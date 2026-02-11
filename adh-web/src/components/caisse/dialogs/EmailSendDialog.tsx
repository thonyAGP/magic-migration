import { useState, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  Button,
  Input,
  Label,
} from '@/components/ui';
import { Send, Mail } from 'lucide-react';
import { emailApi } from '@/services/api/endpoints-email';
import { useDataSourceStore } from '@/stores/dataSourceStore';

export interface EmailSendDialogProps {
  open: boolean;
  onClose: () => void;
  documentType: 'extrait' | 'facture' | 'garantie';
  documentId: string;
  defaultEmail?: string;
  onSent?: () => void;
}

const DOCUMENT_LABELS: Record<string, string> = {
  extrait: 'Extrait de compte',
  facture: 'Facture TVA',
  garantie: 'Garantie',
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EmailSendDialog({
  open,
  onClose,
  documentType,
  documentId,
  defaultEmail = '',
  onSent,
}: EmailSendDialogProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [subject, setSubject] = useState(
    () => `Votre ${DOCUMENT_LABELS[documentType] ?? documentType} - ${new Date().toLocaleDateString('fr-FR')}`,
  );
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const isValid = useMemo(() => emailRegex.test(email) && subject.trim().length > 0, [email, subject]);

  const handleSend = useCallback(async () => {
    if (!isValid) {
      setError('Veuillez saisir un email valide');
      return;
    }

    setIsSending(true);
    setError('');

    const { isRealApi } = useDataSourceStore.getState();

    if (!isRealApi) {
      // Mock: simulate sending
      await new Promise((resolve) => setTimeout(resolve, 500));
      setSuccess(true);
      setIsSending(false);
      onSent?.();
      return;
    }

    try {
      await emailApi.sendDocument({
        to: email,
        subject,
        documentType,
        documentId,
        message: message || undefined,
      });
      setSuccess(true);
      onSent?.();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erreur lors de l'envoi";
      setError(msg);
    } finally {
      setIsSending(false);
    }
  }, [isValid, email, subject, message, documentType, documentId, onSent]);

  const handleClose = useCallback(() => {
    setEmail(defaultEmail);
    setSubject(`Votre ${DOCUMENT_LABELS[documentType] ?? documentType} - ${new Date().toLocaleDateString('fr-FR')}`);
    setMessage('');
    setError('');
    setSuccess(false);
    onClose();
  }, [defaultEmail, documentType, onClose]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Envoyer par email
          </DialogTitle>
          <DialogDescription>
            Envoyer {DOCUMENT_LABELS[documentType] ?? documentType} par email
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-6 text-center space-y-2">
            <div className="mx-auto h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
              <Send className="h-6 w-6 text-success" />
            </div>
            <p className="text-sm font-medium">Email envoye avec succes</p>
            <p className="text-xs text-on-surface-muted">Un email a ete envoye a {email}</p>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label className="text-sm">Destinataire</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemple.com"
                disabled={isSending}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Sujet</Label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={isSending}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Message (optionnel)</Label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isSending}
                placeholder="Ajoutez un message..."
                rows={3}
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm placeholder:text-on-surface-muted focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {error && (
              <p className="text-xs text-danger">{error}</p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSending}>
            {success ? 'Fermer' : 'Annuler'}
          </Button>
          {!success && (
            <Button onClick={handleSend} disabled={isSending || !isValid}>
              <Send className="mr-2 h-4 w-4" />
              {isSending ? 'Envoi...' : 'Envoyer'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
