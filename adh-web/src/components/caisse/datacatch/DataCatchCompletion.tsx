import { Button } from '@/components/ui';
import { CheckCircle, XCircle } from 'lucide-react';
import type { DataCatchCompletionProps } from './types';

export function DataCatchCompletion({
  success,
  sessionId,
  onClose,
}: DataCatchCompletionProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      {success ? (
        <>
          <CheckCircle className="h-16 w-16 text-success" />
          <h3 className="mt-4 text-lg font-semibold">
            Donnees client enregistrees
          </h3>
          {sessionId && (
            <p className="mt-2 text-sm text-on-surface-muted">
              Session : {sessionId}
            </p>
          )}
        </>
      ) : (
        <>
          <XCircle className="h-16 w-16 text-danger" />
          <h3 className="mt-4 text-lg font-semibold">
            Erreur lors de l'enregistrement
          </h3>
        </>
      )}
      <Button onClick={onClose} className="mt-6">
        Terminer
      </Button>
    </div>
  );
}
