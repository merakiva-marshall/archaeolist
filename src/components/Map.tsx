'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { createClient } from '@supabase/supabase-js'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface SiteFromDB {
  id: string;
  name: string;
  description: string;
  location: {
    type: string;
    coordinates: [number, number];
    crs?: {
      type: string;
      properties: {
        name: string;
      };
    };
  };
  address: string;
  period: string[] | null;
  features: string[] | null;
}

interface Site {
  id: string;
  name: string;
  description: string;
  location: [number, number];
  address: string;
  period: string[];
  features: string[];
}

interface MapProps {
  onSiteClick: (site: Site) => void;
}

export default function Map({ onSiteClick }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [sites, setSites] = useState<Site[]>([])

  useEffect(() => {
    if (!mapContainer.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: [0, 20],
      zoom: 2
    })

    const fetchSites = async () => {
      try {
        const { data, error } = await supabase
          .from('sites')
          .select('id, name, description, location, address, period, features')

        if (error) {
          console.error('Error fetching sites:', error)
          return
        }

        if (data) {
          const parsedSites = (data as SiteFromDB[]).map(site => {
            console.log('Raw site data:', site);  // Log raw site data
            let coordinates: [number, number] = [0, 0];
            
            if (site.location && 'coordinates' in site.location) {
              coordinates = site.location.coordinates;
            }
            
            console.log('Parsed coordinates:', coordinates);  // Log parsed coordinates

            return {
              id: site.id,
              name: site.name,
              description: site.description,
              location: coordinates,
              address: site.address,
              period: Array.isArray(site.period) ? site.period : [],
              features: Array.isArray(site.features) ? site.features : []
            };
          });
          setSites(parsedSites)
          console.log('Fetched sites:', parsedSites)  // Log the fetched sites
        }
      } catch (error) {
        console.error('Error in fetchSites:', error)
      }
    }

    fetchSites()

    return () => {
      map.current?.remove()
    }
  }, [])

  useEffect(() => {
    if (!map.current || sites.length === 0) return

    console.log('Adding source and layer for sites:', sites)  // Log before adding source and layer

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
            properties: {
              id: site.id,
              name: site.name,
              description: site.description,
              address: site.address,
              period: site.period,
              features: site.features
            }
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

      map.current.on('click', 'sites', (e) => {
        if (e.features && e.features[0].properties) {
          const properties = e.features[0].properties;
          const geometry = e.features[0].geometry as GeoJSON.Point;
          const site: Site = {
            id: properties.id,
            name: properties.name,
            description: properties.description,
            location: geometry.coordinates as [number, number],
            address: properties.address,
            period: properties.period,
            features: properties.features
          };
          onSiteClick(site);
        }
      })

      map.current.on('mouseenter', 'sites', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer'
      })

      map.current.on('mouseleader', 'sites', () => {
        if (map.current) map.current.getCanvas().style.cursor = ''
      })
    }

    if (map.current.loaded()) {
      addSourceAndLayer();
    } else {
      map.current.on('load', addSourceAndLayer);
    }
  }, [sites, onSiteClick])

  return <div ref={mapContainer} className="w-full h-full" />
}