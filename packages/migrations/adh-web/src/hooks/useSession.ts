import { useSessionStore } from '@/stores/sessionStore';

export function useSession() {
  const session = useSessionStore((s) => s.currentSession);
  const status = useSessionStore((s) => s.status);
  const setSession = useSessionStore((s) => s.setSession);
  const updateStatus = useSessionStore((s) => s.updateStatus);
  const clearSession = useSessionStore((s) => s.clearSession);

  const isOpen = status === 'open';
  const isClosed = status === 'closed';
  const isTransitioning = status === 'opening' || status === 'closing';

  return {
    session,
    status,
    isOpen,
    isClosed,
    isTransitioning,
    setSession,
    updateStatus,
    clearSession,
  };
}
