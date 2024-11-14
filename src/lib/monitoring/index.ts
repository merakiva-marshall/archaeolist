// src/lib/monitoring/index.ts

import { logger } from '../logger'

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count' | 'percent';
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface MapMetric extends PerformanceMetric {
  category: 'render' | 'tile' | 'interaction' | 'database';
  viewport?: {
    center: [number, number];
    zoom: number;
  };
}

class MonitoringSystem {
  private static instance: MonitoringSystem;
  private metrics: PerformanceMetric[] = [];
  private readonly maxStoredMetrics = 1000;

  private constructor() {
    // Initialize performance observer
    if (typeof window !== 'undefined') {
      this.initPerformanceObserver();
    }
  }

  static getInstance(): MonitoringSystem {
    if (!MonitoringSystem.instance) {
      MonitoringSystem.instance = new MonitoringSystem();
    }
    return MonitoringSystem.instance;
  }

  private initPerformanceObserver(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.recordMetric({
            name: entry.name,
            value: entry.startTime,
            unit: 'ms',
            timestamp: Date.now(),
            metadata: {
              duration: entry.duration,
              entryType: entry.entryType
            }
          });
        });
      });

      observer.observe({ 
        entryTypes: ['paint', 'navigation', 'resource', 'longtask'] 
      });
    } catch (error) {
      logger.error(error as Error, { context: 'PerformanceObserver initialization' });
    }
  }

  recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    // Maintain fixed size buffer
    if (this.metrics.length > this.maxStoredMetrics) {
      this.metrics = this.metrics.slice(-this.maxStoredMetrics);
    }

    // Log critical metrics
    if (metric.value > this.getThresholdForMetric(metric.name)) {
      logger.warn(`High metric value for ${metric.name}`, {
        value: metric.value,
        unit: metric.unit,
        threshold: this.getThresholdForMetric(metric.name)
      });
    }
  }

  recordMapMetric(metric: MapMetric): void {
    this.recordMetric(metric);

    // Additional map-specific processing
    if (metric.category === 'render' && metric.value > 16) {
      logger.warn('Frame time exceeded 16ms target', {
        frameTime: metric.value,
        viewport: metric.viewport
      });
    }
  }

  getMetrics(filter?: { 
    name?: string; 
    timeRange?: [number, number];
  }): PerformanceMetric[] {
    return this.metrics.filter(metric => {
      if (filter?.name && metric.name !== filter.name) return false;
      if (filter?.timeRange) {
        const [start, end] = filter.timeRange;
        if (metric.timestamp < start || metric.timestamp > end) return false;
      }
      return true;
    });
  }

  private getThresholdForMetric(name: string): number {
    const thresholds: Record<string, number> = {
      'map.render': 16,
      'map.tile.load': 200,
      'map.interaction': 50,
      'database.query': 200
    };
    return thresholds[name] ?? Infinity;
  }

  clearMetrics(): void {
    this.metrics = [];
  }
}

export const monitoring = MonitoringSystem.getInstance();