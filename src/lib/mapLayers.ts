// src/lib/mapLayers.ts

import type { LayerSpecification, HeatmapLayerSpecification, SymbolLayerSpecification } from 'mapbox-gl'

// Updated interface definitions
interface LayerBase {
  id: string;
  type: string;
  source: string;
  minzoom?: number;
  maxzoom?: number;
}

interface HeatmapLayer extends LayerBase {
  type: 'heatmap';
  filter: unknown[];
  paint: HeatmapLayerSpecification['paint'];
}

interface SymbolLayer extends LayerBase {
  type: 'symbol';
  filter: unknown[];
  layout: SymbolLayerSpecification['layout'];
}

// Heatmap layer - now only shows clustered points
export const heatmapLayer: HeatmapLayer = {
    id: 'clustered-points',
    type: 'heatmap',
    source: 'sites',
    // Only show heatmap for clusters
    filter: ['has', 'point_count'],
    paint: {
      'heatmap-weight': [
        'interpolate',
        ['linear'],
        ['get', 'point_count'],
        0, .3,
        10, 1
      ],
      'heatmap-intensity': [
        'interpolate',
        ['linear'],
        ['zoom'],
        0, 2,
        12, 1
      ],
      'heatmap-color': [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0, 'rgba(65,182,196,0)',
        0.1, 'rgba(65,182,196,0.5)',
        0.3, 'rgb(44,127,184)',
        0.5, 'rgb(33,102,172)',
        0.7, 'rgb(52,103,186)',
        1, 'rgb(31,76,148)'
      ],
      'heatmap-radius': [
        'interpolate',
        ['linear'],
        ['zoom'],
        0, 15,
        9, 20,
      ],
      'heatmap-opacity': [
        'interpolate',
        ['linear'],
        ['zoom'],
        7, 1,
        16, 0,
      ]
    }
  }
  
  // Points layer with updated types
  export const pointsLayer: SymbolLayer = {
    id: 'unclustered-points',
    type: 'symbol',
    source: 'sites',
    filter: ['!', ['has', 'point_count']], // Only show unclustered points
    layout: {
      'icon-image': 'archaeological-site',
      'icon-size': [
        'interpolate',
        ['linear'],
        ['zoom'],
        0, 0.3,
        9, .6,
        22, 1
      ],
      'icon-allow-overlap': true,
    }
  }
  
  // Source configuration with clustering
  export const siteSourceConfig = {
    type: 'geojson' as const,
    cluster: true,
    clusterMaxZoom: 9,
    clusterRadius: 6.5
  }
  
  export const layerOrder = [
    'clustered-points',
    'unclustered-points'
  ] as const
  
  export function getLayerConfig(id: string): LayerSpecification {
    switch (id) {
      case 'clustered-points':
        return heatmapLayer as LayerSpecification;
      case 'unclustered-points':
        return pointsLayer as LayerSpecification;
      default:
        throw new Error(`Unknown layer id: ${id}`);
    }
  }