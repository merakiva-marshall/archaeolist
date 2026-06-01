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
            zoom: 10,
            scrollZoom: false, // Prevent scroll hijacking
            cooperativeGestures: true // Allow two-finger zoom if needed
        })

        // Add navigation controls
        map.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

        // Add custom marker with same image as homepage
        const addMarker = () => {
            if (!map.current) return;

            // Load the custom marker image first
            if (!map.current.hasImage('archaeological-site')) {
                map.current.loadImage(
                    'https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png',
                    (error, image) => {
                        if (error) {
                            console.error('Error loading marker image:', error);
                            // Fallback to default marker
                            new mapboxgl.Marker()
                                .setLngLat(site.location)
                                .addTo(map.current!);
                            return;
                        }
                        if (image && map.current && !map.current.hasImage('archaeological-site')) {
                            map.current.addImage('archaeological-site', image);
                        }
                        // Create a custom marker element
                        const el = document.createElement('div');
                        el.style.backgroundImage = 'url(https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png)';
                        el.style.width = '30px';
                        el.style.height = '30px';
                        el.style.backgroundSize = 'contain';
                        el.style.backgroundRepeat = 'no-repeat';
                        el.style.backgroundPosition = 'center';

                        new mapboxgl.Marker({ element: el })
                            .setLngLat(site.location)
                            .addTo(map.current!);
                    }
                );
            } else {
                // Image already loaded, create marker directly
                const el = document.createElement('div');
                el.style.backgroundImage = 'url(https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png)';
                el.style.width = '30px';
                el.style.height = '30px';
                el.style.backgroundSize = 'contain';
                el.style.backgroundRepeat = 'no-repeat';
                el.style.backgroundPosition = 'center';

                new mapboxgl.Marker({ element: el })
                    .setLngLat(site.location)
                    .addTo(map.current);
            }
        };

        if (map.current.loaded()) {
            addMarker();
        } else {
            map.current.on('load', addMarker);
        }


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
