// src/components/Map.tsx

'use client'

import { useEffect, useRef, useState } from 'react'
import { Site } from '../types/site'
import { useMap, useMapEventHandlers } from '../hooks/useMap'
import { fetchSites } from '../lib/supabase'

export interface MapProps {
  onSiteClick: (site: Site) => void;
}

export default function Map({ onSiteClick }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const [sites, setSites] = useState<Site[]>([])
  const map = useMap(mapContainer, sites)

  useEffect(() => {
    fetchSites().then(setSites)
  }, [])

  useMapEventHandlers(map, onSiteClick)

  return <div ref={mapContainer} className="w-full h-full" />
}