// src/app/components/map/siteRepresentationLayer.tsx

import React, { useEffect } from 'react';
import { useMapContext } from './mapContext';

interface SiteRepresentationLayerProps {
  zoom: number;
}

const SiteRepresentationLayer: React.FC<SiteRepresentationLayerProps> = ({ zoom }) => {
  const { map } = useMapContext();

  useEffect(() => {
    if (!map) return;

    // Adjust site representation based on zoom level
    const layerId = 'sites-layer';
    if (map.getLayer(layerId)) {
      map.setPaintProperty(layerId, 'circle-radius', [
        'interpolate',
        ['linear'],
        ['zoom'],
        0, 2,
        22, 20
      ]);

      map.setPaintProperty(layerId, 'circle-opacity', [
        'interpolate',
        ['linear'],
        ['zoom'],
        0, 0.5,
        22, 1
      ]);
    }
  }, [map, zoom]);

  return null;
};

export default SiteRepresentationLayer;