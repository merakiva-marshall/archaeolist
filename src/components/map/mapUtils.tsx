// src/app/components/map/mapUtils.tsx

/* eslint-disable @typescript-eslint/no-unused-vars */

import { Site } from '../../types/site';
import { Feature, Geometry, GeoJsonProperties, FeatureCollection, Point } from 'geojson';

export const getBounds = (sites: Site[]): [number, number, number, number] => {
  if (sites.length === 0) return [-180, -90, 180, 90];  // Default to world bounds

  const lngs = sites.map(site => site.location[0]);
  const lats = sites.map(site => site.location[1]);

  return [
    Math.min(...lngs),  // westLng
    Math.min(...lats),  // southLat
    Math.max(...lngs),  // eastLng
    Math.max(...lats),  // northLat
  ];
};

export const sitesToGeoJSON = (sites: Site[]): FeatureCollection<Point, GeoJsonProperties> => ({
  type: 'FeatureCollection',
  features: sites.map((site): Feature<Point, GeoJsonProperties> => ({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: site.location,
    },
    properties: {
      id: site.id,
      name: site.name,
      description: site.description,
      address: site.address,
      period: site.period,
      features: site.features,
      country: site.country,
      slug: site.slug,
    },
  })),
});

/* eslint-enable @typescript-eslint/no-unused-vars */