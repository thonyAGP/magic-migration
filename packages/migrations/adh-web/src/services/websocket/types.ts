export type WsMessageType =
  | 'session_update'
  | 'transaction_created'
  | 'caisse_status'
  | 'notification'
  | 'heartbeat';

export interface WsMessage<T = unknown> {
  type: WsMessageType;
  payload: T;
  timestamp: string;
}

export interface WsConfig {
  url: string;
  reconnectMaxRetries: number;
  reconnectBaseDelay: number;
  heartbeatInterval: number;
}

export type WsStatus =
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'reconnecting';
