// src/components/Map.tsx

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
    if (map.current && selectedSite && isSidebarOpen) {
      const isMobile = window.innerWidth < 640;

      map.current.easeTo({
        center: selectedSite.location,
        zoom: SITE_ZOOM_LEVEL,
        padding: isMobile ? 
          { bottom: window.innerHeight * 0.7 } : 
          { right: window.innerWidth * 0.3 },
        duration: 1000
      });
    } else if (map.current && !isSidebarOpen) {
      // Reset padding when sidebar is closed
      map.current.easeTo({
        padding: { top: 0, bottom: 0, left: 0, right: 0 },
        duration: 300
      });
    }
  }, [map, selectedSite, isSidebarOpen]);

  useEffect(() => {
    updateMapView();
  }, [updateMapView, isSidebarOpen]);

  return (
    <div className="absolute inset-0">
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
    </div>
  )
}