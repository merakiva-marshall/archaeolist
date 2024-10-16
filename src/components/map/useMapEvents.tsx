// src/app/components/map/useMapEvents.tsx

import { useEffect } from 'react';
import { useMapContext } from './mapContext';
import { Site } from '../../types/site';

interface UseMapEventsProps {
  onSiteClick: (site: Site) => void;
}

const useMapEvents = ({ onSiteClick }: UseMapEventsProps) => {
  const { map } = useMapContext();

  useEffect(() => {
    if (!map) return;

    const handleSiteClick = (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
      if (e.features && e.features.length > 0) {
        const clickedSite = e.features[0].properties as Site;
        onSiteClick(clickedSite);
      }
    };

    const handleMouseEnter = () => {
      if (map.getCanvas()) {
        map.getCanvas().style.cursor = 'pointer';
      }
    };

    const handleMouseLeave = () => {
      if (map.getCanvas()) {
        map.getCanvas().style.cursor = '';
      }
    };

    map.on('click', 'sites-layer', handleSiteClick);
    map.on('click', 'search-results-layer', handleSiteClick);

    map.on('mouseenter', 'sites-layer', handleMouseEnter);
    map.on('mouseleave', 'sites-layer', handleMouseLeave);

    return () => {
      map.off('click', 'sites-layer', handleSiteClick);
      map.off('click', 'search-results-layer', handleSiteClick);
      map.off('mouseenter', 'sites-layer', handleMouseEnter);
      map.off('mouseleave', 'sites-layer', handleMouseLeave);
    };
  }, [map, onSiteClick]);
};

export default useMapEvents;