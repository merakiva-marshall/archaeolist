// src/lib/monitoring/test.ts

import { monitoring } from './index';
import { PERFORMANCE_THRESHOLDS } from './config';
import { logger } from '../logger';

export async function runPerformanceTests() {
  const results: Record<string, { pass: boolean; value: number; threshold: number }> = {};

  try {
    // Test map frame times
    const frameMetrics = monitoring.getMetrics({ name: 'map.render' });
    const avgFrameTime = frameMetrics.reduce((sum, m) => sum + m.value, 0) / frameMetrics.length;
    results['Average Frame Time'] = {
      pass: avgFrameTime <= PERFORMANCE_THRESHOLDS.render.frame.warning,
      value: avgFrameTime,
      threshold: PERFORMANCE_THRESHOLDS.render.frame.warning
    };

    // Test tile loading
    const tileMetrics = monitoring.getMetrics({ name: 'map.tile.load' });
    const avgTileLoad = tileMetrics.reduce((sum, m) => sum + m.value, 0) / tileMetrics.length;
    results['Average Tile Load'] = {
      pass: avgTileLoad <= PERFORMANCE_THRESHOLDS.tile.load.warning,
      value: avgTileLoad,
      threshold: PERFORMANCE_THRESHOLDS.tile.load.warning
    };

    // Calculate cache hit rate
    const cacheHits = tileMetrics.filter(m => m.metadata?.cached).length;
    const cacheRate = cacheHits / tileMetrics.length;
    results['Cache Hit Rate'] = {
      pass: cacheRate >= PERFORMANCE_THRESHOLDS.tile.cacheHitRate.warning,
      value: cacheRate,
      threshold: PERFORMANCE_THRESHOLDS.tile.cacheHitRate.warning
    };

    // Log results
    logger.info('Performance Test Results:', {
      results,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    });

    return results;
  } catch (error) {
    logger.error(error as Error, { context: 'Performance Tests' });
    throw error;
  }
}

export async function validateImplementation() {
  const results = await runPerformanceTests();
  const failures = Object.entries(results).filter(([, result]) => !result.pass);
  
  if (failures.length > 0) {
    logger.warn('Performance validation failures:', {
      failures: failures.map(([name, result]) => ({
        test: name,
        value: result.value,
        threshold: result.threshold
      }))
    });
  }

  return failures.length === 0;
}