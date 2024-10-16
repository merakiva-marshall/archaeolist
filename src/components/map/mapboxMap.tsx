// src/app/components/map/mapboxMap.tsx

'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useMapContext } from './mapContext';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

interface MapboxMapProps {
  children: React.ReactNode;
  onZoomChange: (zoom: number) => void;
  initialBounds?: [number, number, number, number];
}

const MapboxMap: React.FC<MapboxMapProps> = ({ children, onZoomChange, initialBounds }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<mapboxgl.Map | null>(null);
  const { setMap } = useMapContext();
  const [isMapReady, setIsMapReady] = useState(false);

  const initializeMap = useCallback(() => {
    console.log("Initializing map...");
    if (mapContainer.current && !mapInstanceRef.current) {
      try {
        const map = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/outdoors-v12',
          center: [0, 20],
          zoom: 2
        });

        map.on('load', () => {
          console.log('Map loaded successfully');
          setMap(map);
          setIsMapReady(true);
          if (initialBounds) {
            map.fitBounds(initialBounds as mapboxgl.LngLatBoundsLike, { padding: 50 });
          }
        });

        map.on('zoom', () => {
          onZoomChange(map.getZoom());
        });

        mapInstanceRef.current = map;
      } catch (err) {
        console.error('Error initializing map:', err);
      }
    }
  }, [setMap, onZoomChange, initialBounds]);

  useEffect(() => {
    console.log("MapboxMap component mounted");
    initializeMap();

    return () => {
      console.log("MapboxMap component unmounting...");
      if (mapInstanceRef.current) {
        console.log("Removing map instance...");
        try {
          mapInstanceRef.current.remove();
          console.log("Map instance removed successfully");
        } catch (err) {
          console.error('Error removing map:', err);
        }
      }
      mapInstanceRef.current = null;
      setMap(null);
      setIsMapReady(false);
      console.log("MapboxMap cleanup completed");
    };
  }, [initializeMap, setMap]);

  return (
    <div ref={mapContainer} className="w-full h-full">
      {isMapReady && children}
    </div>
  );
};

export default MapboxMap;