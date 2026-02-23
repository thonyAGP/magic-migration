import { useEffect, useState, useCallback } from 'react';
import { wsClient } from '@/services/websocket/client';
import type {
  WsStatus,
  WsMessageType,
  WsMessage,
} from '@/services/websocket/types';

export function useWebSocket(autoConnect = true) {
  const [status, setStatus] = useState<WsStatus>('disconnected');

  useEffect(() => {
    const unsubStatus = wsClient.onStatusChange(setStatus);
    if (autoConnect) wsClient.connect();
    return () => {
      unsubStatus();
    };
  }, [autoConnect]);

  const subscribe = useCallback(
    <T>(type: WsMessageType, handler: (msg: WsMessage<T>) => void) => {
      return wsClient.on(type, handler);
    },
    []
  );

  const send = useCallback(<T>(type: WsMessageType, payload: T) => {
    wsClient.send(type, payload);
  }, []);

  return {
    status,
    subscribe,
    send,
    disconnect: wsClient.disconnect.bind(wsClient),
  };
}
