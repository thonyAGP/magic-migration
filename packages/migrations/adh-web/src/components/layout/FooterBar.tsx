import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useOffline } from '@/hooks/useOffline';

export function FooterBar() {
  const { isOnline, pendingSync } = useOffline();

  return (
    <footer className="flex items-center justify-between h-8 px-4 bg-surface-dim border-t border-border text-xs text-on-surface-muted">
      <div className="flex items-center gap-2">
        {isOnline ? (
          <span className="flex items-center gap-1 text-success">
            <Wifi className="w-3 h-3" /> En ligne
          </span>
        ) : (
          <span className="flex items-center gap-1 text-danger">
            <WifiOff className="w-3 h-3" /> Hors ligne
          </span>
        )}
        {pendingSync > 0 && (
          <span className="flex items-center gap-1 text-warning">
            <RefreshCw className="w-3 h-3 animate-spin" /> {pendingSync} en
            attente
          </span>
        )}
      </div>
      <span>ADH Caisse v0.1.0</span>
    </footer>
  );
}
