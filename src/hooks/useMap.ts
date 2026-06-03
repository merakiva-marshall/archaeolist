// src/hooks/useMap.ts

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import { MapSite, MapFilters, Site, EMPTY_MAP_FILTERS } from '../types/site'
import { filterMapSites } from '../lib/mapSites'
import {
  siteSourceConfig,
  layerOrder,
  getLayerConfig
} from '../lib/mapLayers'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

const MARKER_IMAGE_ID = 'archaeological-site'
const MARKER_IMAGE_URL = 'https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png'

const DEFAULT_CENTER: [number, number] = [20, 40]
const DEFAULT_ZOOM = 5

// Highlight overlay for the currently selected site. Defined here (not in
// mapLayers.ts) so the existing heatmap/marker styling stays untouched. The
// selected marker reads as a "flipped" version of a normal point: a white
// disc with a strong blue border and a blue star, ~150% the size, drawn above
// the default markers so it covers the underlying pin.
const SELECTED_SOURCE = 'selected-site'
const SELECTED_BG_LAYER = 'selected-bg'
const SELECTED_STAR_LAYER = 'selected-star'
const SELECTED_STAR_IMAGE = 'selected-star-icon'
const BORDER_BLUE = '#1d4ed8'
const STAR_BLUE = '#2563eb'

/** Draw a filled 5-point star as an ImageData for use as a map icon. */
function createStarIcon(size: number, color: string): ImageData | null {
  if (typeof document === 'undefined') return null
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const cx = size / 2
  const cy = size / 2
  const spikes = 5
  const outer = size * 0.46
  const inner = size * 0.2
  let rot = (Math.PI / 2) * 3
  const step = Math.PI / spikes

  ctx.beginPath()
  ctx.moveTo(cx, cy - outer)
  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(cx + Math.cos(rot) * outer, cy + Math.sin(rot) * outer)
    rot += step
    ctx.lineTo(cx + Math.cos(rot) * inner, cy + Math.sin(rot) * inner)
    rot += step
  }
  ctx.closePath()
  ctx.fillStyle = color
  ctx.fill()
  return ctx.getImageData(0, 0, size, size)
}

export interface MapView {
  center: [number, number];
  zoom: number;
}

const EMPTY_COLLECTION: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: []
}

/** Build a GeoJSON FeatureCollection from the (filtered) slim site list. */
function buildCollection(sites: MapSite[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: sites.map((site) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: site.location
      },
      properties: {
        id: site.id,
        name: site.name,
        slug: site.slug,
        country: site.country,
        country_slug: site.country_slug,
        location: JSON.stringify(site.location),
        is_unesco: site.is_unesco
      }
    }))
  }
}

function buildSelectedCollection(location: [number, number] | null): GeoJSON.FeatureCollection {
  if (!location) return EMPTY_COLLECTION
  return {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      geometry: { type: 'Point', coordinates: location },
      properties: {}
    }]
  }
}

export const useMap = (
  container: React.RefObject<HTMLDivElement>,
  sites: MapSite[],
  filters: MapFilters = EMPTY_MAP_FILTERS,
  initialView?: MapView | null,
  selectedLocation: [number, number] | null = null
) => {
  const map = useRef<mapboxgl.Map | null>(null)
  // Whether the `sites` source + layers have been added to the current style.
  const sourceReady = useRef(false)
  // Latest data to render, so the async style-load handler always applies the
  // freshest collection (avoids the stale-closure / missing-data race).
  const dataRef = useRef<GeoJSON.FeatureCollection>(EMPTY_COLLECTION)
  const selectedRef = useRef<GeoJSON.FeatureCollection>(EMPTY_COLLECTION)
  // Keep initialView in a ref so changing it later never re-creates the map.
  const initialViewRef = useRef<MapView | null | undefined>(initialView)

  // --- Create the map exactly once for the lifetime of the container. ---
  useEffect(() => {
    if (!container.current) return

    const newMap = new mapboxgl.Map({
      container: container.current,
      style: 'mapbox://styles/mschurtz/cm2dn5d2w001e01pfedqpddfu',
      center: initialViewRef.current?.center ?? DEFAULT_CENTER,
      zoom: initialViewRef.current?.zoom ?? DEFAULT_ZOOM,
      cooperativeGestures: true
    })

    map.current = newMap
    sourceReady.current = false

    const addSourceAndLayers = () => {
      if (!map.current) return

      if (!map.current.getSource('sites')) {
        map.current.addSource('sites', {
          ...siteSourceConfig,
          data: dataRef.current
        })
        layerOrder.forEach((layerId) => {
          if (!map.current!.getLayer(layerId)) {
            map.current!.addLayer(getLayerConfig(layerId))
          }
        })
      }

      // Selected-site highlight, drawn ON TOP of the markers so it covers the
      // default pin (the "colour flip" effect).
      if (!map.current.hasImage(SELECTED_STAR_IMAGE)) {
        const star = createStarIcon(48, STAR_BLUE)
        if (star) map.current.addImage(SELECTED_STAR_IMAGE, star)
      }
      if (!map.current.getSource(SELECTED_SOURCE)) {
        map.current.addSource(SELECTED_SOURCE, {
          type: 'geojson',
          data: selectedRef.current
        })
        // White disc with a strong blue border, ~150% of a normal marker.
        map.current.addLayer({
          id: SELECTED_BG_LAYER,
          type: 'circle',
          source: SELECTED_SOURCE,
          paint: {
            'circle-radius': [
              'interpolate', ['linear'], ['zoom'],
              0, 9,
              9, 15,
              22, 24
            ],
            'circle-color': '#ffffff',
            'circle-stroke-color': BORDER_BLUE,
            'circle-stroke-width': 3
          }
        })
        // Blue star centred inside the disc.
        map.current.addLayer({
          id: SELECTED_STAR_LAYER,
          type: 'symbol',
          source: SELECTED_SOURCE,
          layout: {
            'icon-image': SELECTED_STAR_IMAGE,
            'icon-allow-overlap': true,
            'icon-size': [
              'interpolate', ['linear'], ['zoom'],
              0, 0.28,
              9, 0.46,
              22, 0.75
            ]
          }
        })
      }

      sourceReady.current = true
    }

    // Load the custom marker image first so the symbol layer always finds it
    // (fixes the original race where points sometimes never rendered).
    const setup = () => {
      if (!map.current) return
      if (map.current.hasImage(MARKER_IMAGE_ID)) {
        addSourceAndLayers()
        return
      }
      map.current.loadImage(MARKER_IMAGE_URL, (error, image) => {
        if (!map.current) return
        if (error) {
          console.error('Failed to load marker image:', error)
          addSourceAndLayers()
          return
        }
        if (image && !map.current.hasImage(MARKER_IMAGE_ID)) {
          map.current.addImage(MARKER_IMAGE_ID, image)
        }
        addSourceAndLayers()
      })
    }

    // `style.load` fires for the initial style and any future style reloads, so
    // the source/layers are always re-added after a style swap.
    newMap.on('style.load', setup)

    // Keep the map sized to its container (handles the fullscreen toggle and
    // responsive layout changes without manual resize calls).
    let resizeObserver: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined' && container.current) {
      resizeObserver = new ResizeObserver(() => {
        map.current?.resize()
      })
      resizeObserver.observe(container.current)
    }

    return () => {
      resizeObserver?.disconnect()
      newMap.remove()
      map.current = null
      sourceReady.current = false
    }
  }, [container])

  // --- Push (filtered) data to the source whenever sites or filters change. ---
  useEffect(() => {
    const collection = buildCollection(filterMapSites(sites, filters))
    dataRef.current = collection

    if (!map.current || !sourceReady.current) return
    const source = map.current.getSource('sites') as mapboxgl.GeoJSONSource | undefined
    if (source) {
      source.setData(collection)
    }
  }, [sites, filters])

  // --- Update the highlight overlay when the selected site changes. ---
  useEffect(() => {
    const collection = buildSelectedCollection(selectedLocation)
    selectedRef.current = collection

    if (!map.current || !sourceReady.current) return
    const source = map.current.getSource(SELECTED_SOURCE) as mapboxgl.GeoJSONSource | undefined
    if (source) {
      source.setData(collection)
    }
  }, [selectedLocation])

  return map
}

/** Reconstruct a (slim) Site object from a clicked map feature's properties. */
function siteFromFeature(feature: mapboxgl.MapboxGeoJSONFeature): Site | null {
  const properties = feature.properties
  if (!properties) return null

  return {
    id: properties.id,
    name: properties.name,
    description: '',
    location: (feature.geometry as GeoJSON.Point).coordinates as [number, number],
    country: properties.country,
    country_slug: properties.country_slug,
    slug: properties.slug,
    is_unesco: properties.is_unesco
  }
}

export const useMapEventHandlers = (
  map: React.MutableRefObject<mapboxgl.Map | null>,
  onSiteClick: (site: Site) => void
) => {
  useEffect(() => {
    if (!map.current) return

    const currentMap = map.current

    const handleClusterClick = (e: mapboxgl.MapMouseEvent) => {
      const features = currentMap.queryRenderedFeatures(e.point, {
        layers: [layerOrder[0]] // clustered-points
      })
      if (features.length === 0) return
      const clusterId = features[0].properties?.cluster_id
      const source = currentMap.getSource('sites') as mapboxgl.GeoJSONSource

      source.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return
        currentMap.easeTo({
          center: (features[0].geometry as GeoJSON.Point).coordinates as [number, number],
          zoom: zoom ?? Math.min(currentMap.getZoom() + 2, 22)
        })
      })
    }

    const handlePointClick = (e: mapboxgl.MapMouseEvent) => {
      const features = currentMap.queryRenderedFeatures(e.point, {
        layers: [layerOrder[1]] // unclustered-points
      })
      if (features.length === 0) return

      const site = siteFromFeature(features[0])
      if (!site) return

      // Camera movement is owned by the consumer (Map.tsx updateMapView) so we
      // don't fight it with a second animation here.
      onSiteClick(site)
    }

    const handleMouseEnter = () => {
      currentMap.getCanvas().style.cursor = 'pointer'
    }

    const handleMouseLeave = () => {
      currentMap.getCanvas().style.cursor = ''
    }

    currentMap.on('click', layerOrder[0], handleClusterClick)
    currentMap.on('click', layerOrder[1], handlePointClick)
    currentMap.on('mouseenter', layerOrder[0], handleMouseEnter)
    currentMap.on('mouseenter', layerOrder[1], handleMouseEnter)
    currentMap.on('mouseleave', layerOrder[0], handleMouseLeave)
    currentMap.on('mouseleave', layerOrder[1], handleMouseLeave)

    return () => {
      currentMap.off('click', layerOrder[0], handleClusterClick)
      currentMap.off('click', layerOrder[1], handlePointClick)
      currentMap.off('mouseenter', layerOrder[0], handleMouseEnter)
      currentMap.off('mouseenter', layerOrder[1], handleMouseEnter)
      currentMap.off('mouseleave', layerOrder[0], handleMouseLeave)
      currentMap.off('mouseleave', layerOrder[1], handleMouseLeave)
    }
  }, [map, onSiteClick])
}

/**
 * Desktop-only hover tooltip: after a short delay, show the site name when the
 * cursor rests over exactly one unclustered point. Skipped on touch / coarse
 * pointers, and suppressed when multiple points overlap (heatmap density area).
 */
export const useMapHoverTooltip = (
  map: React.MutableRefObject<mapboxgl.Map | null>,
  enabled = true
) => {
  useEffect(() => {
    if (!map.current || !enabled) return
    if (typeof window !== 'undefined' && !window.matchMedia('(pointer: fine)').matches) {
      return
    }

    const currentMap = map.current
    const HOVER_DELAY = 200

    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 12,
      className: 'site-hover-tooltip'
    })

    let timer: ReturnType<typeof setTimeout> | null = null

    const clearTimer = () => {
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
    }

    const handleMouseMove = (e: mapboxgl.MapMouseEvent) => {
      const features = currentMap.queryRenderedFeatures(e.point, {
        layers: [layerOrder[1]] // unclustered-points
      })

      clearTimer()

      // Only show when hovering a single, isolated point.
      if (features.length !== 1) {
        popup.remove()
        return
      }

      const feature = features[0]
      const name = feature.properties?.name
      const coordinates = (feature.geometry as GeoJSON.Point).coordinates as [number, number]
      if (!name) {
        popup.remove()
        return
      }

      timer = setTimeout(() => {
        popup
          .setLngLat(coordinates)
          .setHTML(`<span class="site-hover-tooltip__label">${name}</span>`)
          .addTo(currentMap)
      }, HOVER_DELAY)
    }

    const handleMouseLeave = () => {
      clearTimer()
      popup.remove()
    }

    currentMap.on('mousemove', layerOrder[1], handleMouseMove)
    currentMap.on('mouseleave', layerOrder[1], handleMouseLeave)

    return () => {
      clearTimer()
      popup.remove()
      currentMap.off('mousemove', layerOrder[1], handleMouseMove)
      currentMap.off('mouseleave', layerOrder[1], handleMouseLeave)
    }
  }, [map, enabled])
}
