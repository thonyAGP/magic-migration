import { create } from 'zustand';
import type { Toast, ToastType } from '@/types/notification';

const MAX_TOASTS = 5;
const DEFAULT_DURATION = 5000;

let toastCounter = 0;

interface NotificationState {
  toasts: Toast[];
  addToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  toasts: [],

  addToast: (type, title, message, duration = DEFAULT_DURATION) => {
    const id = `toast-${++toastCounter}`;
    const toast: Toast = {
      id,
      type,
      title,
      message,
      duration,
      dismissible: true,
    };

    set((state) => {
      const updated = [...state.toasts, toast];
      // Keep max N toasts (FIFO)
      return { toasts: updated.length > MAX_TOASTS ? updated.slice(-MAX_TOASTS) : updated };
    });

    // Auto-dismiss
    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  clearAll: () => {
    set({ toasts: [] });
  },

  success: (title, message) => {
    get().addToast('success', title, message);
  },

  error: (title, message) => {
    get().addToast('error', title, message, 8000);
  },

  warning: (title, message) => {
    get().addToast('warning', title, message, 6000);
  },

  info: (title, message) => {
    get().addToast('info', title, message);
  },
}));
