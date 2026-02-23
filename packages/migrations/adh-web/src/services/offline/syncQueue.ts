import { db, type SyncQueueItem } from './db';
import { apiClient } from '../api/apiClient';

const MAX_RETRIES = 5;

export async function enqueue(
  item: Omit<SyncQueueItem, 'id' | 'createdAt' | 'retryCount' | 'status'>,
): Promise<number> {
  return db.syncQueue.add({
    ...item,
    createdAt: new Date(),
    retryCount: 0,
    status: 'pending',
  });
}

export async function processQueue(): Promise<{
  processed: number;
  failed: number;
}> {
  const pending = await db.syncQueue
    .where('status')
    .equals('pending')
    .sortBy('createdAt');

  let processed = 0;
  let failed = 0;

  for (const item of pending) {
    try {
      await db.syncQueue.update(item.id!, { status: 'processing' });

      await apiClient.request({
        url: item.url,
        method: item.method,
        data: JSON.parse(item.body),
      });

      await db.syncQueue.delete(item.id!);
      processed++;
    } catch (error) {
      const newRetryCount = item.retryCount + 1;
      if (newRetryCount >= MAX_RETRIES) {
        await db.syncQueue.update(item.id!, {
          status: 'failed',
          retryCount: newRetryCount,
          lastError: String(error),
        });
        failed++;
      } else {
        await db.syncQueue.update(item.id!, {
          status: 'pending',
          retryCount: newRetryCount,
          lastError: String(error),
        });
      }
    }
  }

  return { processed, failed };
}

export async function getPendingCount(): Promise<number> {
  return db.syncQueue.where('status').equals('pending').count();
}

export async function getFailedItems(): Promise<SyncQueueItem[]> {
  return db.syncQueue.where('status').equals('failed').toArray();
}

export async function retryFailed(): Promise<void> {
  await db.syncQueue
    .where('status')
    .equals('failed')
    .modify({ status: 'pending', retryCount: 0 });
}

export async function clearQueue(): Promise<void> {
  await db.syncQueue.clear();
}
