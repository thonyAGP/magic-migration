// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Toast, ToastContainer } from '../Toast';
import { useNotificationStore } from '@/stores/notificationStore';
import type { Toast as ToastType } from '@/types/notification';

const mockRemoveToast = vi.fn();

vi.mock('@/stores/notificationStore', () => ({
  useNotificationStore: vi.fn(),
}));

const mockedUseNotificationStore = vi.mocked(useNotificationStore);

function createToast(overrides: Partial<ToastType> = {}): ToastType {
  return {
    id: 'test-1',
    type: 'info',
    title: 'Test toast',
    message: 'Test message',
    dismissible: true,
    ...overrides,
  };
}

describe('Toast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseNotificationStore.mockImplementation(((selector?: unknown) => {
      const state = { toasts: [], removeToast: mockRemoveToast };
      return typeof selector === 'function' ? (selector as (s: typeof state) => unknown)(state) : state;
    }) as typeof useNotificationStore);
  });

  it('should render success toast with green styling', () => {
    const toast = createToast({ type: 'success', title: 'Success!' });
    const { container } = render(<Toast toast={toast} />);
    expect(screen.getByText('Success!')).toBeInTheDocument();
    expect(container.querySelector('[role="alert"]')).toHaveClass('bg-green-50');
  });

  it('should render error toast with red styling', () => {
    const toast = createToast({ type: 'error', title: 'Error!' });
    const { container } = render(<Toast toast={toast} />);
    expect(screen.getByText('Error!')).toBeInTheDocument();
    expect(container.querySelector('[role="alert"]')).toHaveClass('bg-red-50');
  });

  it('should render warning toast with yellow styling', () => {
    const toast = createToast({ type: 'warning', title: 'Warning!' });
    const { container } = render(<Toast toast={toast} />);
    expect(screen.getByText('Warning!')).toBeInTheDocument();
    expect(container.querySelector('[role="alert"]')).toHaveClass('bg-yellow-50');
  });

  it('should render info toast with blue styling', () => {
    const toast = createToast({ type: 'info', title: 'Info' });
    const { container } = render(<Toast toast={toast} />);
    expect(screen.getByText('Info')).toBeInTheDocument();
    expect(container.querySelector('[role="alert"]')).toHaveClass('bg-blue-50');
  });

  it('should call removeToast when dismiss button clicked', () => {
    const toast = createToast({ id: 'dismiss-me' });
    render(<Toast toast={toast} />);
    fireEvent.click(screen.getByLabelText('Fermer'));
    expect(mockRemoveToast).toHaveBeenCalledWith('dismiss-me');
  });

  it('should render multiple toasts in ToastContainer', () => {
    const toasts = [
      createToast({ id: '1', title: 'Toast 1' }),
      createToast({ id: '2', title: 'Toast 2' }),
    ];
    mockedUseNotificationStore.mockImplementation(((selector?: unknown) => {
      const state = { toasts, removeToast: mockRemoveToast };
      return typeof selector === 'function' ? (selector as (s: typeof state) => unknown)(state) : state;
    }) as typeof useNotificationStore);

    render(<ToastContainer />);
    expect(screen.getByText('Toast 1')).toBeInTheDocument();
    expect(screen.getByText('Toast 2')).toBeInTheDocument();
  });
});
