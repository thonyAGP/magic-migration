// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useUiStore } from '../uiStore';

// Mock crypto.randomUUID
vi.stubGlobal('crypto', {
  randomUUID: vi.fn().mockReturnValue('test-uuid-1234'),
});

describe('useUiStore', () => {
  beforeEach(() => {
    useUiStore.setState({
      sidebarOpen: true,
      activeDialog: null,
      notifications: [],
    });
  });

  describe('initial state', () => {
    it('should have sidebar open by default', () => {
      expect(useUiStore.getState().sidebarOpen).toBe(true);
    });

    it('should have no active dialog', () => {
      expect(useUiStore.getState().activeDialog).toBeNull();
    });

    it('should have empty notifications', () => {
      expect(useUiStore.getState().notifications).toEqual([]);
    });
  });

  describe('toggleSidebar', () => {
    it('should toggle sidebar from open to closed', () => {
      useUiStore.getState().toggleSidebar();
      expect(useUiStore.getState().sidebarOpen).toBe(false);
    });

    it('should toggle sidebar from closed to open', () => {
      useUiStore.getState().toggleSidebar();
      useUiStore.getState().toggleSidebar();
      expect(useUiStore.getState().sidebarOpen).toBe(true);
    });
  });

  describe('setSidebarOpen', () => {
    it('should set sidebar to closed', () => {
      useUiStore.getState().setSidebarOpen(false);
      expect(useUiStore.getState().sidebarOpen).toBe(false);
    });

    it('should set sidebar to open', () => {
      useUiStore.getState().setSidebarOpen(false);
      useUiStore.getState().setSidebarOpen(true);
      expect(useUiStore.getState().sidebarOpen).toBe(true);
    });
  });

  describe('openDialog', () => {
    it('should set the active dialog id', () => {
      useUiStore.getState().openDialog('confirm-delete');
      expect(useUiStore.getState().activeDialog).toBe('confirm-delete');
    });

    it('should replace existing dialog', () => {
      useUiStore.getState().openDialog('dialog-a');
      useUiStore.getState().openDialog('dialog-b');
      expect(useUiStore.getState().activeDialog).toBe('dialog-b');
    });
  });

  describe('closeDialog', () => {
    it('should clear the active dialog', () => {
      useUiStore.getState().openDialog('some-dialog');
      useUiStore.getState().closeDialog();
      expect(useUiStore.getState().activeDialog).toBeNull();
    });

    it('should do nothing when no dialog is open', () => {
      useUiStore.getState().closeDialog();
      expect(useUiStore.getState().activeDialog).toBeNull();
    });
  });

  describe('addNotification', () => {
    it('should add a notification with generated id', () => {
      useUiStore.getState().addNotification({
        type: 'success',
        message: 'Operation reussie',
      });

      const notifications = useUiStore.getState().notifications;
      expect(notifications).toHaveLength(1);
      expect(notifications[0].type).toBe('success');
      expect(notifications[0].message).toBe('Operation reussie');
      expect(notifications[0].id).toBe('test-uuid-1234');
    });

    it('should add multiple notifications', () => {
      useUiStore.getState().addNotification({ type: 'info', message: 'Info 1' });
      useUiStore.getState().addNotification({ type: 'error', message: 'Error 1' });

      expect(useUiStore.getState().notifications).toHaveLength(2);
    });

    it('should preserve duration when provided', () => {
      useUiStore.getState().addNotification({
        type: 'warning',
        message: 'Attention',
        duration: 5000,
      });

      expect(useUiStore.getState().notifications[0].duration).toBe(5000);
    });
  });

  describe('removeNotification', () => {
    it('should remove a notification by id', () => {
      useUiStore.setState({
        notifications: [
          { id: 'n1', type: 'info', message: 'First' },
          { id: 'n2', type: 'error', message: 'Second' },
        ],
      });

      useUiStore.getState().removeNotification('n1');

      const notifications = useUiStore.getState().notifications;
      expect(notifications).toHaveLength(1);
      expect(notifications[0].id).toBe('n2');
    });

    it('should do nothing when id does not exist', () => {
      useUiStore.setState({
        notifications: [{ id: 'n1', type: 'info', message: 'Only' }],
      });

      useUiStore.getState().removeNotification('non-existent');
      expect(useUiStore.getState().notifications).toHaveLength(1);
    });

    it('should handle removing from empty list', () => {
      useUiStore.getState().removeNotification('any');
      expect(useUiStore.getState().notifications).toEqual([]);
    });
  });
});
