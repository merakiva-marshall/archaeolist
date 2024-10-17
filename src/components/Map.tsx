import { useEffect, useRef, useState, useCallback } from 'react'
import { Site } from '../types/site'
import { useMap, useMapEventHandlers } from '../hooks/useMap'
import { fetchSites } from '../lib/supabase'

export interface MapProps {
  onSiteClick: (site: Site) => void;
  selectedSite: Site | null;
  isSidebarOpen: boolean;
}

const SITE_ZOOM_LEVEL = 12;

export default function Map({ onSiteClick, selectedSite, isSidebarOpen }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const [sites, setSites] = useState<Site[]>([])
  const map = useMap(mapContainer, sites)

  useEffect(() => {
    fetchSites().then(setSites)
  }, [])

  useMapEventHandlers(map, onSiteClick)

  const updateMapView = useCallback(() => {
    if (map.current && selectedSite) {
      const isMobile = window.innerWidth < 640;

      map.current.easeTo({
        center: selectedSite.location,
        zoom: SITE_ZOOM_LEVEL,
        padding: isMobile ? 
          { bottom: isSidebarOpen ? window.innerHeight * 0.7 : 0 } : 
          { right: isSidebarOpen ? window.innerWidth * 0.3 : 0 },
        duration: 1000
      });
    }
  }, [map, selectedSite, isSidebarOpen]);

  useEffect(() => {
    updateMapView();
  }, [updateMapView]);

  return <div ref={mapContainer} className="w-full flex-1" />
}