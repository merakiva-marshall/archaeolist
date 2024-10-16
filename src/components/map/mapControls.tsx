// src/app/components/map/mapControls.tsx

import React from 'react';
import { useMapContext } from './mapContext';

export const MapControls: React.FC = () => {
  const { map } = useMapContext();

  const handleZoomIn = () => {
    map?.zoomIn();
  };

  const handleZoomOut = () => {
    map?.zoomOut();
  };

  return (
    <div className="absolute top-4 left-4 z-10">
      <button onClick={handleZoomIn} className="bg-white p-2 rounded shadow mr-2">+</button>
      <button onClick={handleZoomOut} className="bg-white p-2 rounded shadow">-</button>
    </div>
  );
};