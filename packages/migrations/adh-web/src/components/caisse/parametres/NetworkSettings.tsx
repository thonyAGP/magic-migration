import { useState, useEffect, useCallback } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { Button, Input, Label } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useParametresStore } from '@/stores/parametresStore';
import { networkConfigSchema } from './schemas';
import type { NetworkSettingsProps } from './types';

export function NetworkSettings({ className }: NetworkSettingsProps) {
  const { networkConfig, networkTestResult, saveNetworkConfig, testNetwork, isSaving, isTestingNetwork } =
    useParametresStore();

  const [apiUrl, setApiUrl] = useState(networkConfig?.apiUrl ?? '');
  const [timeout, setTimeout_] = useState(networkConfig?.timeout ?? 30000);
  const [retryCount, setRetryCount] = useState(networkConfig?.retryCount ?? 3);
  const [retryDelay, setRetryDelay] = useState(networkConfig?.retryDelay ?? 1000);
  const [websocketUrl, setWebsocketUrl] = useState(networkConfig?.websocketUrl ?? '');
  const [heartbeatInterval, setHeartbeatInterval] = useState(networkConfig?.heartbeatInterval ?? 30000);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!networkConfig) return;

    setApiUrl(networkConfig.apiUrl);
    setTimeout_(networkConfig.timeout);
    setRetryCount(networkConfig.retryCount);
    setRetryDelay(networkConfig.retryDelay);
    setWebsocketUrl(networkConfig.websocketUrl);
    setHeartbeatInterval(networkConfig.heartbeatInterval);
  }, [networkConfig]);

  const handleSave = useCallback(async () => {
    setMessage(null);

    const result = networkConfigSchema.safeParse({
      apiUrl,
      timeout,
      retryCount,
      retryDelay,
      websocketUrl,
      heartbeatInterval,
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
    const success = await saveNetworkConfig({
      apiUrl,
      timeout,
      retryCount,
      retryDelay,
      websocketUrl,
      heartbeatInterval,
    });

    if (success) {
      setMessage({ type: 'success', text: 'Configuration reseau sauvegardee' });
    } else {
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
    }
  }, [apiUrl, timeout, retryCount, retryDelay, websocketUrl, heartbeatInterval, saveNetworkConfig]);

  return (
    <div className={cn('space-y-6', className)}>
      <h3 className="text-sm font-semibold">Configuration reseau</h3>

      {message && (
        <div
          className={cn(
            'rounded-md px-3 py-2 text-sm',
            message.type === 'success' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger',
          )}
          role="alert"
        >
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        {/* API URL */}
        <div className="space-y-1.5">
          <Label htmlFor="api-url">URL API</Label>
          <Input
            id="api-url"
            type="text"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            error={errors.apiUrl}
            disabled={isSaving}
            placeholder="http://localhost:5287"
          />
          {errors.apiUrl && <p className="text-xs text-danger">{errors.apiUrl}</p>}
        </div>

        {/* Timeout */}
        <div className="space-y-1.5">
          <Label htmlFor="timeout">Timeout (ms)</Label>
          <Input
            id="timeout"
            type="number"
            min={1000}
            max={60000}
            value={timeout}
            onChange={(e) => setTimeout_(Number(e.target.value) || 0)}
            error={errors.timeout}
            disabled={isSaving}
          />
          {errors.timeout && <p className="text-xs text-danger">{errors.timeout}</p>}
        </div>

        {/* Retry count + delay */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="retry-count">Retry count</Label>
            <Input
              id="retry-count"
              type="number"
              min={0}
              max={10}
              value={retryCount}
              onChange={(e) => setRetryCount(Number(e.target.value) || 0)}
              error={errors.retryCount}
              disabled={isSaving}
            />
            {errors.retryCount && <p className="text-xs text-danger">{errors.retryCount}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="retry-delay">Retry delay (ms)</Label>
            <Input
              id="retry-delay"
              type="number"
              min={100}
              max={30000}
              value={retryDelay}
              onChange={(e) => setRetryDelay(Number(e.target.value) || 0)}
              error={errors.retryDelay}
              disabled={isSaving}
            />
            {errors.retryDelay && <p className="text-xs text-danger">{errors.retryDelay}</p>}
          </div>
        </div>

        {/* WebSocket URL */}
        <div className="space-y-1.5">
          <Label htmlFor="ws-url">URL WebSocket</Label>
          <Input
            id="ws-url"
            type="text"
            value={websocketUrl}
            onChange={(e) => setWebsocketUrl(e.target.value)}
            error={errors.websocketUrl}
            disabled={isSaving}
            placeholder="ws://localhost:5287/ws"
          />
          {errors.websocketUrl && <p className="text-xs text-danger">{errors.websocketUrl}</p>}
        </div>

        {/* Heartbeat interval */}
        <div className="space-y-1.5">
          <Label htmlFor="heartbeat">Heartbeat interval (ms)</Label>
          <Input
            id="heartbeat"
            type="number"
            min={5000}
            max={120000}
            value={heartbeatInterval}
            onChange={(e) => setHeartbeatInterval(Number(e.target.value) || 0)}
            error={errors.heartbeatInterval}
            disabled={isSaving}
          />
          {errors.heartbeatInterval && <p className="text-xs text-danger">{errors.heartbeatInterval}</p>}
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Enregistrement...' : 'Sauvegarder'}
        </Button>
        <Button variant="outline" onClick={() => testNetwork()} disabled={isTestingNetwork}>
          {isTestingNetwork ? 'Test en cours...' : 'Tester la connexion'}
        </Button>
      </div>

      {/* Test result */}
      {networkTestResult && (
        <div className="rounded-lg border border-border p-4 space-y-2" data-testid="network-test-result">
          <h4 className="text-sm font-semibold">Resultat du test</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              {networkTestResult.apiReachable ? (
                <Wifi className="h-4 w-4 text-success" />
              ) : (
                <WifiOff className="h-4 w-4 text-danger" />
              )}
              <span>API: {networkTestResult.apiReachable ? 'OK' : 'Injoignable'}</span>
              {networkTestResult.apiReachable && (
                <span className="text-on-surface-muted">({networkTestResult.apiLatencyMs}ms)</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {networkTestResult.websocketReachable ? (
                <Wifi className="h-4 w-4 text-success" />
              ) : (
                <WifiOff className="h-4 w-4 text-danger" />
              )}
              <span>WebSocket: {networkTestResult.websocketReachable ? 'OK' : 'Injoignable'}</span>
              {networkTestResult.websocketReachable && (
                <span className="text-on-surface-muted">({networkTestResult.websocketLatencyMs}ms)</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
