// src/lib/monitoring/config.ts

export const PERFORMANCE_THRESHOLDS = {
    render: {
      frame: {
        warning: 16,  // milliseconds
        critical: 32  // milliseconds
      },
      mapLoad: {
        warning: 2000,  // 2 seconds
        critical: 5000  // 5 seconds
      }
    },
    tile: {
      load: {
        warning: 200,  // milliseconds
        critical: 500  // milliseconds
      },
      cacheHitRate: {
        warning: 0.7,  // 70%
        critical: 0.5  // 50%
      }
    },
    database: {
      query: {
        warning: 200,  // milliseconds
        critical: 500  // milliseconds
      },
      clusterRefresh: {
        warning: 5000,  // 5 seconds
        critical: 15000 // 15 seconds
      }
    },
    memory: {
      heap: {
        warning: 150 * 1024 * 1024,  // 150MB
        critical: 300 * 1024 * 1024   // 300MB
      }
    }
  } as const;
  
  export const MONITORING_CONFIG = {
    sampleRate: 0.1,  // Sample 10% of all events
    logLevel: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
    metricsRetention: 24 * 60 * 60 * 1000, // 24 hours
    alertCooldown: 5 * 60 * 1000,  // 5 minutes between similar alerts
  } as const;
  
  // Define what we consider "normal" baseline performance
  export const PERFORMANCE_BASELINES = {
    mapInteraction: {
      zoomDuration: 300,    // milliseconds
      panDuration: 200,     // milliseconds
      clickResponse: 100    // milliseconds
    },
    tileLoading: {
      averageLoadTime: 150,  // milliseconds
      expectedCacheHit: 0.8  // 80% cache hit rate
    },
    rendering: {
      averageFrameTime: 12,  // milliseconds
      targetFPS: 60
    }
  } as const;
  
  // Define testing scenarios
  export const PERFORMANCE_TEST_SCENARIOS = {
    load: [
      { name: 'Initial map load', threshold: 2000 },
      { name: 'Zoom level change', threshold: 500 },
      { name: 'Pan across map', threshold: 300 },
      { name: 'Site selection', threshold: 200 }
    ],
    stress: [
      { name: 'Rapid zoom', operations: 10, interval: 100 },
      { name: 'Rapid pan', operations: 20, interval: 50 },
      { name: 'Multiple site selection', operations: 5, interval: 200 }
    ]
  } as const;