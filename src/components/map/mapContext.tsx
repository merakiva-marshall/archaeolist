// src/app/components/map/mapContext.tsx

import React, { createContext, useContext, useState } from 'react';
import mapboxgl from 'mapbox-gl';

interface MapContextType {
  map: mapboxgl.Map | null;
  setMap: React.Dispatch<React.SetStateAction<mapboxgl.Map | null>>;
  isDestroying: boolean;
  setIsDestroying: React.Dispatch<React.SetStateAction<boolean>>;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

export const MapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [isDestroying, setIsDestroying] = useState(false);

  return (
    <MapContext.Provider value={{ map, setMap, isDestroying, setIsDestroying }}>
      {children}
    </MapContext.Provider>
  );
};

export const useMapContext = () => {
  const context = useContext(MapContext);
  if (context === undefined) {
    throw new Error('useMapContext must be used within a MapProvider');
  }
  return context;
};