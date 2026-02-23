import { describe, it, expect, beforeEach, vi } from 'vitest';

// vi.mock must use inline factories (no external refs due to hoisting)
vi.mock('@/services/offline/db', () => {
  const mockEquals = vi.fn().mockReturnValue({
    sortBy: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    toArray: vi.fn().mockResolvedValue([]),
    modify: vi.fn().mockResolvedValue(0),
  });

  return {
    db: {
      syncQueue: {
        add: vi.fn(),
        where: vi.fn().mockReturnValue({ equals: mockEquals }),
        update: vi.fn(),
        delete: vi.fn(),
        clear: vi.fn(),
      },
    },
  };
});

vi.mock('@/services/api/apiClient', () => ({
  apiClient: {
    request: vi.fn(),
  },
}));

import { db } from '@/services/offline/db';
import { apiClient } from '@/services/api/apiClient';
import {
  enqueue,
  processQueue,
  getPendingCount,
  getFailedItems,
  retryFailed,
  clearQueue,
} from './syncQueue';

// Helpers to get mock functions from the imported db
const mockSyncQueue = db.syncQueue as unknown as {
  add: ReturnType<typeof vi.fn>;
  where: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  clear: ReturnType<typeof vi.fn>;
};
const mockApiRequest = apiClient.request as ReturnType<typeof vi.fn>;

function setupWhereEquals(overrides: Record<string, unknown> = {}) {
  const defaults = {
    sortBy: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    toArray: vi.fn().mockResolvedValue([]),
    modify: vi.fn().mockResolvedValue(0),
  };
  const merged = { ...defaults, ...overrides };
  const mockEquals = vi.fn().mockReturnValue(merged);
  mockSyncQueue.where.mockReturnValue({ equals: mockEquals });
  return { mockEquals, ...merged };
}

describe('syncQueue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('enqueue', () => {
    it('should add item with pending status and zero retryCount', async () => {
      mockSyncQueue.add.mockResolvedValue(1);

      const result = await enqueue({
        url: '/api/ventes',
        method: 'POST',
        body: '{"amount": 100}',
      });

      expect(mockSyncQueue.add).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/api/ventes',
          method: 'POST',
          body: '{"amount": 100}',
          status: 'pending',
          retryCount: 0,
          createdAt: expect.any(Date),
        }),
      );
      expect(result).toBe(1);
    });
  });

  describe('processQueue', () => {
    it('should process all pending items and return counts', async () => {
      const pendingItems = [
        { id: 1, url: '/api/ventes', method: 'POST', body: '{}', retryCount: 0, status: 'pending', createdAt: new Date() },
        { id: 2, url: '/api/reglements', method: 'POST', body: '{}', retryCount: 0, status: 'pending', createdAt: new Date() },
      ];
      setupWhereEquals({ sortBy: vi.fn().mockResolvedValue(pendingItems) });
      mockSyncQueue.update.mockResolvedValue(undefined);
      mockSyncQueue.delete.mockResolvedValue(undefined);
      mockApiRequest.mockResolvedValue({ data: {} });

      const result = await processQueue();

      expect(result).toEqual({ processed: 2, failed: 0 });
      expect(mockSyncQueue.delete).toHaveBeenCalledTimes(2);
    });

    it('should mark item as failed when retryCount reaches MAX_RETRIES', async () => {
      const pendingItems = [
        { id: 1, url: '/api/ventes', method: 'POST', body: '{}', retryCount: 4, status: 'pending', createdAt: new Date() },
      ];
      setupWhereEquals({ sortBy: vi.fn().mockResolvedValue(pendingItems) });
      mockSyncQueue.update.mockResolvedValue(undefined);
      mockApiRequest.mockRejectedValue(new Error('Server error'));

      const result = await processQueue();

      expect(result).toEqual({ processed: 0, failed: 1 });
      expect(mockSyncQueue.update).toHaveBeenLastCalledWith(1, expect.objectContaining({
        status: 'failed',
        retryCount: 5,
      }));
    });

    it('should keep item as pending when retry count is below max', async () => {
      const pendingItems = [
        { id: 1, url: '/api/ventes', method: 'POST', body: '{}', retryCount: 1, status: 'pending', createdAt: new Date() },
      ];
      setupWhereEquals({ sortBy: vi.fn().mockResolvedValue(pendingItems) });
      mockSyncQueue.update.mockResolvedValue(undefined);
      mockApiRequest.mockRejectedValue(new Error('Timeout'));

      const result = await processQueue();

      expect(result).toEqual({ processed: 0, failed: 0 });
      expect(mockSyncQueue.update).toHaveBeenLastCalledWith(1, expect.objectContaining({
        status: 'pending',
        retryCount: 2,
      }));
    });

    it('should return zero counts when queue is empty', async () => {
      setupWhereEquals({ sortBy: vi.fn().mockResolvedValue([]) });

      const result = await processQueue();

      expect(result).toEqual({ processed: 0, failed: 0 });
    });
  });

  describe('getPendingCount', () => {
    it('should return count of pending items', async () => {
      const { mockEquals } = setupWhereEquals({ count: vi.fn().mockResolvedValue(5) });

      const count = await getPendingCount();

      expect(mockSyncQueue.where).toHaveBeenCalledWith('status');
      expect(mockEquals).toHaveBeenCalledWith('pending');
      expect(count).toBe(5);
    });
  });

  describe('getFailedItems', () => {
    it('should return failed items as array', async () => {
      const failedItems = [
        { id: 1, url: '/api/ventes', method: 'POST', body: '{}', retryCount: 5, status: 'failed', lastError: 'Server error' },
      ];
      const { mockEquals } = setupWhereEquals({ toArray: vi.fn().mockResolvedValue(failedItems) });

      const items = await getFailedItems();

      expect(mockEquals).toHaveBeenCalledWith('failed');
      expect(items).toEqual(failedItems);
    });
  });

  describe('retryFailed', () => {
    it('should reset failed items to pending with retryCount 0', async () => {
      const mockModify = vi.fn().mockResolvedValue(3);
      const { mockEquals } = setupWhereEquals({ modify: mockModify });

      await retryFailed();

      expect(mockEquals).toHaveBeenCalledWith('failed');
      expect(mockModify).toHaveBeenCalledWith({ status: 'pending', retryCount: 0 });
    });
  });

  describe('clearQueue', () => {
    it('should clear all items from the queue', async () => {
      mockSyncQueue.clear.mockResolvedValue(undefined);

      await clearQueue();

      expect(mockSyncQueue.clear).toHaveBeenCalledOnce();
    });
  });
});
