import { Button } from '@/components/ui';
import { UserPlus, Search } from 'lucide-react';
import type { DataCatchWelcomeProps } from './types';

export function DataCatchWelcome({
  onStartNew,
  onStartExisting,
  disabled = false,
}: DataCatchWelcomeProps) {
  return (
    <div className="rounded-md border border-border p-6 text-center">
      <h2 className="text-lg font-semibold">Saisie client</h2>
      <p className="mt-2 text-sm text-on-surface-muted">
        Capturer ou mettre a jour les informations client
      </p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <Button onClick={onStartNew} disabled={disabled}>
          <UserPlus className="mr-2 h-4 w-4" />
          Nouveau client
        </Button>
        <Button variant="outline" onClick={onStartExisting} disabled={disabled}>
          <Search className="mr-2 h-4 w-4" />
          Client existant
        </Button>
      </div>
    </div>
  );
}
