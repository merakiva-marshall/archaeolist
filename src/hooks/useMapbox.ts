// src/app/useMapbox.ts

import { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

interface UseMapboxProps {
  containerRef: React.RefObject<HTMLDivElement>;
  onZoomChange: (zoom: number) => void;
  initialBounds?: [number, number, number, number];
}

export const useMapbox = ({ containerRef, onZoomChange, initialBounds }: UseMapboxProps) => {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  const initializeMap = useCallback(() => {
    if (containerRef.current && !mapRef.current) {
      try {
        mapRef.current = new mapboxgl.Map({
          container: containerRef.current,
          style: 'mapbox://styles/mapbox/outdoors-v12',
          center: [0, 20],
          zoom: 2
        });

        mapRef.current.on('load', () => {
          console.log('Map loaded');
          setIsMapReady(true);
          if (initialBounds) {
            mapRef.current?.fitBounds(initialBounds as mapboxgl.LngLatBoundsLike, { padding: 50 });
          }
        });

        mapRef.current.on('zoom', () => {
          onZoomChange(mapRef.current?.getZoom() || 2);
        });
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    }
  }, [containerRef, onZoomChange, initialBounds]);

  useEffect(() => {
    initializeMap();

    return () => {
      console.log('Cleaning up map');
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (error) {
          console.error('Error removing map:', error);
        }
        mapRef.current = null;
        setIsMapReady(false);
      }
    };
  }, [initializeMap]);

  return { map: mapRef.current, isMapReady };
};