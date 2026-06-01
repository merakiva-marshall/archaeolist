'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import { useRouter } from 'next/navigation'
import { Site } from '../types/site'
import { siteSourceConfig, layerOrder, getLayerConfig } from '../lib/mapLayers'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

interface CountryMapProps {
  sites: Site[]
  className?: string
  randomStart?: boolean
}

export default function CountryMap({ sites, className = '', randomStart = false }: CountryMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const router = useRouter()

  // Normalize PostGIS {type, coordinates} or plain array
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const normalizeLoc = (loc: any): [number, number] | null => {
    const arr = Array.isArray(loc) ? loc : loc?.coordinates
    if (!arr || arr.length < 2 || isNaN(arr[0]) || isNaN(arr[1])) return null
    return [arr[0], arr[1]]
  }

  const validSites = sites
    .map(s => ({ ...s, location: normalizeLoc(s.location) }))
    .filter((s): s is typeof s & { location: [number, number] } => s.location !== null)

  useEffect(() => {
    if (!mapContainer.current || validSites.length === 0) return

    // Compute initial center/zoom
    let initialCenter: [number, number]
    let initialZoom: number
    const bounds = new mapboxgl.LngLatBounds()
    validSites.forEach(s => bounds.extend(s.location as [number, number]))

    if (randomStart) {
      const randomSite = validSites[Math.floor(Math.random() * validSites.length)]
      initialCenter = randomSite.location as [number, number]
      initialZoom = 5
    } else {
      const center = bounds.getCenter()
      initialCenter = [center.lng, center.lat]
      initialZoom = 5
    }

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mschurtz/cm2dn5d2w001e01pfedqpddfu',
      center: initialCenter,
      zoom: initialZoom,
      scrollZoom: false,
      cooperativeGestures: true,
    })

    map.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')

    map.current.on('load', () => {
      if (!map.current) return

      const addData = () => {
        if (!map.current) return

        map.current.addSource('sites', {
          ...siteSourceConfig,
          data: {
            type: 'FeatureCollection',
            features: validSites.map(site => ({
              type: 'Feature',
              geometry: { type: 'Point', coordinates: site.location as [number, number] },
              properties: {
                id: site.id,
                name: site.name,
                short_description: site.short_description,
                location: JSON.stringify(site.location),
                country: site.country,
                country_slug: site.country_slug,
                slug: site.slug,
                images: JSON.stringify(site.images),
                is_unesco: site.is_unesco,
              },
            })),
          },
        })

        layerOrder.forEach(id => map.current!.addLayer(getLayerConfig(id)))

        // Fit to country bounds (skip for random-start/global maps)
        if (!randomStart) {
          map.current.fitBounds(bounds, { padding: 60, maxZoom: 10, duration: 500 })
        }
      }

      if (map.current.hasImage('archaeological-site')) {
        addData()
      } else {
        map.current.loadImage(
          'https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png',
          (error, image) => {
            if (error || !image || !map.current) return
            if (!map.current.hasImage('archaeological-site')) {
              map.current.addImage('archaeological-site', image)
            }
            addData()
          }
        )
      }
    })

    // Click unclustered point → navigate to site page
    map.current.on('click', 'unclustered-points', (e) => {
      const props = e.features?.[0]?.properties
      if (!props) return
      router.push(`/sites/${props.country_slug}/${props.slug}`)
    })

    // Click cluster → zoom in
    map.current.on('click', 'clustered-points', (e) => {
      const features = map.current!.queryRenderedFeatures(e.point, { layers: ['clustered-points'] })
      const clusterId = features[0]?.properties?.cluster_id
      if (!clusterId) return
      const source = map.current!.getSource('sites') as mapboxgl.GeoJSONSource
      source.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err || !map.current) return
        map.current.easeTo({
          center: (features[0].geometry as GeoJSON.Point).coordinates as [number, number],
          zoom: zoom ?? map.current.getZoom() + 2,
        })
      })
    })

    map.current.on('mouseenter', 'unclustered-points', () => {
      if (map.current) map.current.getCanvas().style.cursor = 'pointer'
    })
    map.current.on('mouseleave', 'unclustered-points', () => {
      if (map.current) map.current.getCanvas().style.cursor = ''
    })
    map.current.on('mouseenter', 'clustered-points', () => {
      if (map.current) map.current.getCanvas().style.cursor = 'pointer'
    })
    map.current.on('mouseleave', 'clustered-points', () => {
      if (map.current) map.current.getCanvas().style.cursor = ''
    })

    return () => {
      map.current?.remove()
      map.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (validSites.length === 0) {
    return (
      <div className={`bg-surface-container rounded-2xl flex items-center justify-center text-on-surface-variant text-sm font-label ${className}`}>
        No location data available
      </div>
    )
  }

  return (
    <div className={`relative rounded-2xl overflow-hidden shadow-xl ${className}`}>
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  )
}
