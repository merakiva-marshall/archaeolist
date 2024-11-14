// src/components/Map.tsx

import { useEffect, useRef, useState } from 'react'
import { Site } from '../types/site'
import { useMap, useMapEventHandlers } from '../hooks/useMap'
import { useTileLoader } from '../hooks/useTileLoader'
import { monitoring } from '../lib/monitoring'
import { logger } from '../lib/logger'
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
  const map = useMap(mapContainer, sites)  // Now passing both required arguments
  const { loadTile } = useTileLoader()

  useMapEventHandlers(map, onSiteClick);
  // Add useEffect to fetch sites
  useEffect(() => {
    fetchSites().then(setSites)
  }, [])

  // Monitor map performance
  useEffect(() => {
    const mapInstance = map.current;
    if (!mapInstance) return;

    const handleRender = () => {
      monitoring.recordMapMetric({
        name: 'map.render',
        value: performance.now(),
        unit: 'ms',
        timestamp: Date.now(),
        category: 'render',
        viewport: mapInstance ? {
          center: mapInstance.getCenter().toArray() as [number, number],
          zoom: mapInstance.getZoom()
        } : undefined
      });
    };

    mapInstance.on('render', handleRender);
    return () => {
      mapInstance?.off('render', handleRender);
    };
  }, [map]);

  // Handle tile loading
  useEffect(() => {
    const mapInstance = map.current;
    if (!mapInstance) return;

    const handleTileLoad = async (e: { tile: { tileID: { x: number; y: number; z: number } } }) => {
      try {
        const { x, y, z } = e.tile.tileID;
        const data = await loadTile({ x, y, z });
        
        // Update source data
        if (mapInstance && data) {
          const source = mapInstance.getSource('sites');
          if (source && 'setData' in source) {
            source.setData(data);
          }
        }
      } catch (error) {
        logger.error(error as Error, {
          context: 'Map tile load',
          tile: e.tile.tileID
        });
      }
    };

    mapInstance.on('tileloadstart', handleTileLoad);
    return () => {
      mapInstance?.off('tileloadstart', handleTileLoad);
    };
  }, [loadTile, map]);

  // Update view when selected site changes
  useEffect(() => {
    const mapInstance = map.current;
    if (mapInstance && selectedSite && isSidebarOpen) {
      const isMobile = window.innerWidth < 640;

      mapInstance.easeTo({
        center: selectedSite.location,
        zoom: SITE_ZOOM_LEVEL,
        padding: isMobile ? 
          { bottom: window.innerHeight * 0.7 } : 
          { right: window.innerWidth * 0.3 },
        duration: 1000
      });
    }
  }, [selectedSite, isSidebarOpen, map]);

  return (
    <div className="absolute inset-0">
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
    </div>
  )
}