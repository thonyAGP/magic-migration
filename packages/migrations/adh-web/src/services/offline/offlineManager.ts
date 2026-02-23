export type ConnectionStatus = 'online' | 'offline';
type StatusListener = (status: ConnectionStatus) => void;

class OfflineManager {
  private listeners: StatusListener[] = [];

  get isOnline(): boolean {
    return navigator.onLine;
  }

  get status(): ConnectionStatus {
    return this.isOnline ? 'online' : 'offline';
  }

  start(): void {
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  stop(): void {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
  }

  subscribe(listener: StatusListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private handleOnline = (): void => {
    this.notify('online');
    this.triggerSync();
  };

  private handleOffline = (): void => {
    this.notify('offline');
  };

  private notify(status: ConnectionStatus): void {
    this.listeners.forEach((l) => l(status));
  }

  private async triggerSync(): Promise<void> {
    const { processQueue } = await import('./syncQueue');
    await processQueue();
  }
}

export const offlineManager = new OfflineManager();
