import Dexie, { type Table } from 'dexie';

export interface SyncQueueItem {
  id?: number;
  url: string;
  method: 'POST' | 'PUT' | 'DELETE';
  body: string;
  createdAt: Date;
  retryCount: number;
  lastError?: string;
  status: 'pending' | 'processing' | 'failed';
}

export interface CachedSession {
  id: number;
  data: string;
  cachedAt: Date;
}

export interface CachedTransaction {
  id?: number;
  sessionId: number;
  data: string;
  cachedAt: Date;
  synced: boolean;
}

export interface CachedDenomination {
  deviseCode: string;
  data: string;
  cachedAt: Date;
}

export class AdhDatabase extends Dexie {
  syncQueue!: Table<SyncQueueItem>;
  sessions!: Table<CachedSession>;
  transactions!: Table<CachedTransaction>;
  denominations!: Table<CachedDenomination>;

  constructor() {
    super('adh-caisse');
    this.version(1).stores({
      syncQueue: '++id, status, createdAt',
      sessions: 'id, cachedAt',
      transactions: '++id, sessionId, synced, cachedAt',
      denominations: 'deviseCode, cachedAt',
    });
  }
}

export const db = new AdhDatabase();
