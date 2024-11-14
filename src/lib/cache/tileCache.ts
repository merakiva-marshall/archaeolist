// src/lib/cache/tileCache.ts

import { logger } from '../logger'

export interface TileKey {
  z: number;
  x: number;
  y: number;
}

export interface CachedTile {
  key: string;
  data: unknown;
  timestamp: number;
  expires: number;
}

class TileCache {
  private static instance: TileCache;
  private readonly CACHE_NAME = 'archaeolist-tile-cache';
  private readonly MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours
  private memoryCache: Map<string, CachedTile>;
  private db: IDBDatabase | null = null;

  private constructor() {
    this.memoryCache = new Map();
    this.initIndexedDB().catch(error => {
      logger.error(error as Error, { context: 'TileCache initialization' });
    });
  }

  static getInstance(): TileCache {
    if (!TileCache.instance) {
      TileCache.instance = new TileCache();
    }
    return TileCache.instance;
  }

  private async initIndexedDB(): Promise<void> {
    if (!window.indexedDB) {
      throw new Error('IndexedDB not supported');
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.CACHE_NAME, 1);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('tiles')) {
          db.createObjectStore('tiles', { keyPath: 'key' });
        }
      };
    });
  }

  private getTileKey({ z, x, y }: TileKey): string {
    return `${z}/${x}/${y}`;
  }

  async get(tileKey: TileKey): Promise<unknown | null> {
    const key = this.getTileKey(tileKey);

    // Check memory cache first
    const memoryItem = this.memoryCache.get(key);
    if (memoryItem && memoryItem.expires > Date.now()) {
      return memoryItem.data;
    }

    // Check IndexedDB
    try {
      const cached = await this.getFromIndexedDB(key);
      if (cached && cached.expires > Date.now()) {
        // Update memory cache
        this.memoryCache.set(key, cached);
        return cached.data;
      }
    } catch (error) {
      logger.error(error as Error, { 
        context: 'TileCache.get',
        key 
      });
    }

    return null;
  }

  async set(tileKey: TileKey, data: unknown): Promise<void> {
    const key = this.getTileKey(tileKey);
    const timestamp = Date.now();
    const cached: CachedTile = {
      key,
      data,
      timestamp,
      expires: timestamp + this.MAX_AGE
    };

    // Update memory cache
    this.memoryCache.set(key, cached);

    // Update IndexedDB
    try {
      await this.setInIndexedDB(cached);
    } catch (error) {
      logger.error(error as Error, {
        context: 'TileCache.set',
        key
      });
    }

    // Clear old memory cache entries if too many
    if (this.memoryCache.size > 1000) {
      const entriesToDelete = Array.from(this.memoryCache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp)
        .slice(0, 200);
      
      for (const [key] of entriesToDelete) {
        this.memoryCache.delete(key);
      }
    }
  }

  private getFromIndexedDB(key: string): Promise<CachedTile | null> {
    if (!this.db) return Promise.resolve(null);

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['tiles'], 'readonly');
      const store = transaction.objectStore('tiles');
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  private setInIndexedDB(cached: CachedTile): Promise<void> {
    if (!this.db) return Promise.resolve();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['tiles'], 'readwrite');
      const store = transaction.objectStore('tiles');
      const request = store.put(cached);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearExpired(): Promise<void> {
    const now = Date.now();

    // Clear memory cache
    for (const [key, value] of this.memoryCache.entries()) {
      if (value.expires <= now) {
        this.memoryCache.delete(key);
      }
    }

    // Clear IndexedDB
    if (!this.db) return;

    const transaction = this.db.transaction(['tiles'], 'readwrite');
    const store = transaction.objectStore('tiles');
    const request = store.openCursor();

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        const tile = cursor.value as CachedTile;
        if (tile.expires <= now) {
          cursor.delete();
        }
        cursor.continue();
      }
    };
  }
}

export const tileCache = TileCache.getInstance();