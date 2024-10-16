// src/app/components/map/searchResultsLayer.tsx

import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { useMapContext } from './mapContext';
import { Site } from '../../types/site';
import { sitesToGeoJSON } from './mapUtils';

interface SearchResultsLayerProps {
  sites?: Site[];
}

const SearchResultsLayer: React.FC<SearchResultsLayerProps> = ({ sites }) => {
  const { map, isDestroying } = useMapContext();
  const sourceRef = useRef<string | null>(null);
  const layerRef = useRef<string | null>(null);

  useEffect(() => {
    if (!map || !sites) return;

    const sourceId = 'search-results';
    const layerId = 'search-results-layer';

    sourceRef.current = sourceId;
    layerRef.current = layerId;

    const addSourceAndLayer = () => {
      if (isDestroying) return;

      try {
        if (!map.getSource(sourceId)) {
          map.addSource(sourceId, {
            type: 'geojson',
            data: sitesToGeoJSON(sites),
          });
        } else {
          (map.getSource(sourceId) as mapboxgl.GeoJSONSource).setData(sitesToGeoJSON(sites));
        }

        if (!map.getLayer(layerId)) {
          map.addLayer({
            id: layerId,
            type: 'circle',
            source: sourceId,
            paint: {
              'circle-radius': 8,
              'circle-color': '#007cbf',
              'circle-stroke-width': 2,
              'circle-stroke-color': '#ffffff',
            },
          });
        }
      } catch (error) {
        console.error('Error adding source or layer:', error);
      }
    };

    if (map.loaded()) {
      addSourceAndLayer();
    } else {
      map.once('load', addSourceAndLayer);
    }

    return () => {
      if (isDestroying) return;

      try {
        if (map && map.getStyle()) {
          if (layerRef.current && map.getLayer(layerRef.current)) {
            map.removeLayer(layerRef.current);
          }
          if (sourceRef.current && map.getSource(sourceRef.current)) {
            map.removeSource(sourceRef.current);
          }
        }
      } catch (error) {
        console.error('Error removing layer or source:', error);
      }
    };
  }, [map, sites, isDestroying]);

  return null;
};

export default SearchResultsLayer;