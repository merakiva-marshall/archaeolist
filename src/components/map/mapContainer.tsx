// src/components/map/mapContainer.tsx

'use client';

import React, { useState, useCallback } from 'react';
import { MapProvider } from './mapContext';
import MapContent from './mapContent';
import { Site } from '../../types/site';

interface MapContainerProps {
  onSiteClick: (site: Site) => void;
  sites?: Site[];
  searchResults?: Site[];
}

const MapContainer: React.FC<MapContainerProps> = (props) => {
  return (
    <MapProvider>
      <MapContent {...props} />
    </MapProvider>
  );
};

export default MapContainer;