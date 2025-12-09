'use client';

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import { Site } from '../types/site'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

interface SingleSiteMapProps {
    site: Site;
    className?: string;
}

export default function SingleSiteMap({ site, className = "" }: SingleSiteMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null)
    const map = useRef<mapboxgl.Map | null>(null)

    // Validate coordinates
    const isValidLocation = site.location &&
        Array.isArray(site.location) &&
        site.location.length === 2 &&
        !isNaN(site.location[0]) &&
        !isNaN(site.location[1]);

    useEffect(() => {
        if (!mapContainer.current) return
        if (!isValidLocation) {
            console.error('SingleSiteMap: Invalid location for site:', site.name, site.location);
            return;
        }

        console.log('SingleSiteMap: Initializing map for:', site.name, site.location);


        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mschurtz/cm2dn5d2w001e01pfedqpddfu',
            center: site.location,
            zoom: 9,
            scrollZoom: false, // Prevent scroll hijacking
            cooperativeGestures: true // Allow two-finger zoom if needed
        })

        // Add navigation controls
        map.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

        // Add default marker
        new mapboxgl.Marker()
            .setLngLat(site.location)
            .addTo(map.current);


        return () => {
            map.current?.remove()
        }
    }, [isValidLocation, site.location, site.name])

    if (!isValidLocation) {
        return (
            <div className={`relative rounded-xl overflow-hidden shadow-sm border border-gray-200 bg-gray-100 flex items-center justify-center text-gray-500 text-sm p-4 ${className}`}>
                Location data unavailable
            </div>
        );
    }

    return (
        <div className={`relative rounded-xl overflow-hidden shadow-sm border border-gray-200 ${className}`}>
            <div ref={mapContainer} className="w-full h-full" />
        </div>
    )
}
