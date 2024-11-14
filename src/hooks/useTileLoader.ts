// src/hooks/useTileLoader.ts

import { useCallback } from 'react';
import { tileCache, type TileKey } from '../lib/cache/tileCache';
import { createClient } from '@supabase/supabase-js';
import { monitoring } from '../lib/monitoring';
import { logger } from '../lib/logger';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function useTileLoader() {
  const loadTile = useCallback(async (tileKey: TileKey) => {
    const startTime = performance.now();
    
    try {
      // Check cache first
      const cachedData = await tileCache.get(tileKey);
      if (cachedData) {
        monitoring.recordMapMetric({
          name: 'map.tile.load.cached',
          value: performance.now() - startTime,
          unit: 'ms',
          timestamp: Date.now(),
          category: 'tile',
          metadata: { ...tileKey, cached: true }
        });
        return cachedData;
      }

      // Convert tile coordinates to bounds
      const bounds = tileToBoundingBox(tileKey);
      
      // Fetch from database
      const { data: sites, error } = await supabase
        .rpc('get_clustered_sites', {
          zoom_level: tileKey.z,
          bounds: `POLYGON((${bounds.west} ${bounds.south}, ${bounds.east} ${bounds.south}, ${bounds.east} ${bounds.north}, ${bounds.west} ${bounds.north}, ${bounds.west} ${bounds.south}))`
        });

      if (error) throw error;

      // Cache the result
      await tileCache.set(tileKey, sites);

      monitoring.recordMapMetric({
        name: 'map.tile.load.network',
        value: performance.now() - startTime,
        unit: 'ms',
        timestamp: Date.now(),
        category: 'tile',
        metadata: { ...tileKey, cached: false }
      });

      return sites;
    } catch (error) {
      logger.error(error as Error, {
        context: 'useTileLoader',
        tileKey
      });
      throw error;
    }
  }, []);

  return { loadTile };
}

// Helper function to convert tile coordinates to bounding box
function tileToBoundingBox(tile: TileKey) {
  const n = Math.PI - 2 * Math.PI * tile.y / Math.pow(2, tile.z);
  const west = tile.x / Math.pow(2, tile.z) * 360 - 180;
  const north = (180 / Math.PI * Math.atan(Math.sinh(n)));
  const east = (tile.x + 1) / Math.pow(2, tile.z) * 360 - 180;
  const south = (180 / Math.PI * Math.atan(Math.sinh(n - (2 * Math.PI) / Math.pow(2, tile.z))));

  return { north, south, east, west };
}