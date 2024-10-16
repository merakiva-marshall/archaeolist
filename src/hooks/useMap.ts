// src/hooks/useMap.ts

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import { Site } from '../types/site'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

export const useMap = (container: React.RefObject<HTMLDivElement>, sites: Site[]) => {
  const map = useRef<mapboxgl.Map | null>(null)

  useEffect(() => {
    if (!container.current) return

    const newMap = new mapboxgl.Map({
      container: container.current,
      style: 'mapbox://styles/mschurtz/cm256dnqy00i001p34w5q474q',
      center: [15, 40],
      zoom: 4
    })

    map.current = newMap

    return () => {
      newMap.remove()
    }
  }, [container])

  useEffect(() => {
    if (!map.current || sites.length === 0) return

    const addSourceAndLayer = () => {
      if (!map.current) return;
      
      if (map.current.getSource('sites')) {
        map.current.removeLayer('sites');
        map.current.removeSource('sites');
      }

      map.current.addSource('sites', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: sites.map(site => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: site.location
            },
            properties: { ...site }
          }))
        }
      })

      map.current.addLayer({
        id: 'sites',
        type: 'circle',
        source: 'sites',
        paint: {
          'circle-radius': 6,
          'circle-color': '#B42222'
        }
      })
    }

    if (map.current.loaded()) {
      addSourceAndLayer();
    } else {
      map.current.on('load', addSourceAndLayer);
    }
  }, [sites])

  return map
}

export const useMapEventHandlers = (map: React.MutableRefObject<mapboxgl.Map | null>, onSiteClick: (site: Site) => void) => {
  useEffect(() => {
    if (!map.current) return

    const currentMap = map.current;

    const handleSiteClick = (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
      if (e.features && e.features[0].properties) {
        const properties = e.features[0].properties;
        const site: Site = {
          id: properties.id,
          name: properties.name,
          description: properties.description,
          location: e.features[0].geometry.type === 'Point' ? e.features[0].geometry.coordinates as [number, number] : [0, 0],
          address: properties.address,
          period: properties.period,
          features: properties.features,
          country: properties.country,
          slug: properties.slug
        };
        onSiteClick(site);
      }
    }

    const handleMouseEnter = () => {
      currentMap.getCanvas().style.cursor = 'pointer'
    }

    const handleMouseLeave = () => {
      currentMap.getCanvas().style.cursor = ''
    }

    currentMap.on('click', 'sites', handleSiteClick)
    currentMap.on('mouseenter', 'sites', handleMouseEnter)
    currentMap.on('mouseleave', 'sites', handleMouseLeave)

    return () => {
      currentMap.off('click', 'sites', handleSiteClick)
      currentMap.off('mouseenter', 'sites', handleMouseEnter)
      currentMap.off('mouseleave', 'sites', handleMouseLeave)
    }
  }, [map, onSiteClick])
}