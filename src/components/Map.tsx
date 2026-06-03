// src/components/Map.tsx

import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react'
import type { PaddingOptions } from 'mapbox-gl'
import { Site, MapSite, MapFilters, EMPTY_MAP_FILTERS } from '../types/site'
import { useMap, useMapEventHandlers, useMapHoverTooltip, MapView } from '../hooks/useMap'
import { fetchMapSites } from '../lib/mapSites'

export interface MapProps {
  onSiteClick: (site: Site) => void;
  selectedSite: Site | null;
  isSidebarOpen: boolean;
  filters?: MapFilters;
  /** Optional pre-loaded site list. When omitted, the map fetches its own. */
  sites?: MapSite[];
  /** When set, the map view (center/zoom) is persisted/restored under this sessionStorage key. */
  persistViewKey?: string;
  /** When true, the map fills the browser viewport and scroll-zoom works without Ctrl. */
  fullscreen?: boolean;
}

export interface MapRef {
  flyToSite: (site: Site) => void;
}

// Gentle floor for how far we'll zoom in when a site is selected. If the user
// is already zoomed in past this, we keep their zoom rather than yanking them.
const MIN_SELECT_ZOOM = 7;

function readStoredView(key?: string): MapView | null {
  if (!key || typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MapView;
    if (Array.isArray(parsed.center) && typeof parsed.zoom === 'number') {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

const Map = forwardRef<MapRef, MapProps>(({ onSiteClick, selectedSite, isSidebarOpen, filters = EMPTY_MAP_FILTERS, sites: externalSites, persistViewKey, fullscreen = false }, ref) => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const [fetchedSites, setFetchedSites] = useState<MapSite[]>([])
  const sites = externalSites ?? fetchedSites
  const [initialView] = useState<MapView | null>(() => readStoredView(persistViewKey))
  // Only highlight while the card is open, so closing it clears the marker.
  const selectedLocation = (isSidebarOpen && selectedSite) ? selectedSite.location : null
  const map = useMap(mapContainer, sites, filters, initialView, selectedLocation)

  const easeToSite = useCallback((site: Site) => {
    if (!map.current) return;
    const targetZoom = Math.max(map.current.getZoom(), MIN_SELECT_ZOOM);

    // Offset the camera so the selected point stays clear of the card, which
    // sits at different edges per breakpoint (bottom sheet on mobile, right
    // overlay on tablet/desktop).
    const containerEl = map.current.getContainer();
    const { clientWidth, clientHeight } = containerEl;
    const width = typeof window !== 'undefined' ? window.innerWidth : clientWidth;
    const isMobile = width < 640;
    const isTablet = width >= 640 && width < 1024;

    let padding: PaddingOptions;
    if (isMobile) {
      padding = { bottom: clientHeight * 0.5, top: 0, left: 0, right: 0 };
    } else if (isTablet) {
      padding = { right: 350, top: 0, left: 0, bottom: 0 };
    } else {
      padding = { right: 420, top: 0, left: 0, bottom: 0 };
    }

    map.current.easeTo({
      center: site.location,
      zoom: targetZoom,
      padding,
      duration: 800
    });
  }, [map]);

  useImperativeHandle(ref, () => ({
    flyToSite: easeToSite
  }));

  useEffect(() => {
    if (externalSites) return
    fetchMapSites().then(setFetchedSites)
  }, [externalSites])

  useMapEventHandlers(map, onSiteClick)
  useMapHoverTooltip(map)

  // In fullscreen the map owns the whole viewport, so let the wheel zoom
  // directly (no Ctrl/⌘ needed); restore cooperative gestures when windowed.
  useEffect(() => {
    const m = map.current;
    if (!m || typeof m.setCooperativeGestures !== 'function') return;
    m.setCooperativeGestures(!fullscreen);
  }, [map, fullscreen]);

  // Persist the view so navigating away and back resumes where the user left off.
  useEffect(() => {
    if (!persistViewKey || !map.current) return;
    const currentMap = map.current;

    const save = () => {
      try {
        const center = currentMap.getCenter();
        sessionStorage.setItem(persistViewKey, JSON.stringify({
          center: [center.lng, center.lat],
          zoom: currentMap.getZoom()
        }));
      } catch {
        // sessionStorage may be unavailable (private mode); ignore.
      }
    };

    currentMap.on('moveend', save);
    return () => { currentMap.off('moveend', save); };
  }, [map, persistViewKey]);

  const updateMapView = useCallback(() => {
    if (map.current && selectedSite && isSidebarOpen) {
      easeToSite(selectedSite);
    } else if (map.current && !isSidebarOpen) {
      // Reset padding when sidebar is closed
      map.current.easeTo({
        padding: { top: 0, bottom: 0, left: 0, right: 0 },
        duration: 300
      });
    }
  }, [map, selectedSite, isSidebarOpen, easeToSite]);

  useEffect(() => {
    updateMapView();
  }, [updateMapView, isSidebarOpen]);

  return (
    <div className="absolute inset-0">
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
    </div>
  )
});

Map.displayName = 'Map';

export default Map;
