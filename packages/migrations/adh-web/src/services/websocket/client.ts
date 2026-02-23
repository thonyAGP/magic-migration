import type { WsConfig, WsMessage, WsMessageType, WsStatus } from './types';

type MessageHandler<T = unknown> = (message: WsMessage<T>) => void;
type StatusHandler = (status: WsStatus) => void;

const DEFAULT_CONFIG: WsConfig = {
  url: `ws://${globalThis.location?.host ?? 'localhost:3071'}/ws`,
  reconnectMaxRetries: 10,
  reconnectBaseDelay: 1000,
  heartbeatInterval: 30000,
};

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private config: WsConfig;
  private currentStatus: WsStatus = 'disconnected';
  private retryCount = 0;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private messageHandlers = new Map<WsMessageType, Set<MessageHandler>>();
  private statusHandlers = new Set<StatusHandler>();

  constructor(config: Partial<WsConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.setStatus('connecting');
    this.ws = new WebSocket(this.config.url);

    this.ws.onopen = () => {
      this.retryCount = 0;
      this.setStatus('connected');
      this.startHeartbeat();
    };

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data as string) as WsMessage;
        if (message.type === 'heartbeat') return;
        const handlers = this.messageHandlers.get(message.type);
        handlers?.forEach((h) => h(message));
      } catch {
        /* ignore malformed messages */
      }
    };

    this.ws.onclose = () => {
      this.stopHeartbeat();
      if (this.currentStatus !== 'disconnected') {
        this.attemptReconnect();
      }
    };

    this.ws.onerror = () => {
      // onclose will fire after onerror
    };
  }

  disconnect(): void {
    this.setStatus('disconnected');
    this.stopHeartbeat();
    this.clearReconnectTimer();
    this.ws?.close();
    this.ws = null;
  }

  send<T>(type: WsMessageType, payload: T): void {
    if (this.ws?.readyState !== WebSocket.OPEN) return;
    const message: WsMessage<T> = {
      type,
      payload,
      timestamp: new Date().toISOString(),
    };
    this.ws.send(JSON.stringify(message));
  }

  on<T>(type: WsMessageType, handler: MessageHandler<T>): () => void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set());
    }
    this.messageHandlers.get(type)!.add(handler as MessageHandler);
    return () => {
      this.messageHandlers.get(type)?.delete(handler as MessageHandler);
    };
  }

  onStatusChange(handler: StatusHandler): () => void {
    this.statusHandlers.add(handler);
    return () => {
      this.statusHandlers.delete(handler);
    };
  }

  getStatus(): WsStatus {
    return this.currentStatus;
  }

  private setStatus(status: WsStatus): void {
    this.currentStatus = status;
    this.statusHandlers.forEach((h) => h(status));
  }

  private attemptReconnect(): void {
    if (this.retryCount >= this.config.reconnectMaxRetries) {
      this.setStatus('disconnected');
      return;
    }
    this.setStatus('reconnecting');
    const delay =
      this.config.reconnectBaseDelay * Math.pow(2, this.retryCount);
    this.retryCount++;
    this.reconnectTimer = setTimeout(() => this.connect(), delay);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      this.send('heartbeat', {});
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
}

// Singleton
export const wsClient = new WebSocketClient();
