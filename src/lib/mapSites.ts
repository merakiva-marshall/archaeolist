// src/lib/mapSites.ts

import { supabase } from './supabase'
import { MapSite, MapFilters } from '../types/site'

interface MapFeature {
  type: 'Feature';
  geometry: { type: 'Point'; coordinates: [number, number] };
  properties: {
    id: string;
    name: string;
    slug: string;
    country: string;
    country_slug: string;
    is_unesco: boolean;
    periods: string[] | null;
    features: string[] | null;
  };
}

interface MapFeatureCollection {
  type: 'FeatureCollection';
  features: MapFeature[];
}

/**
 * Fetch every archaeological site as a slim marker record in a single request.
 *
 * Uses the `get_map_sites` Postgres function, which returns one aggregated
 * GeoJSON document containing only the fields needed to render dots and run
 * client-side filtering. This replaces the old paged `fetchSites()` (6 round
 * trips pulling full descriptions/images) and is the data source for the map.
 */
export async function fetchMapSites(): Promise<MapSite[]> {
  const { data, error } = await supabase.rpc('get_map_sites')

  if (error || !data) {
    console.error('Error fetching map sites:', error)
    return []
  }

  const collection = data as unknown as MapFeatureCollection

  return collection.features.map((feature) => ({
    id: feature.properties.id,
    name: feature.properties.name,
    slug: feature.properties.slug,
    country: feature.properties.country,
    country_slug: feature.properties.country_slug,
    location: feature.geometry.coordinates,
    is_unesco: feature.properties.is_unesco,
    periods: feature.properties.periods ?? [],
    features: feature.properties.features ?? [],
  }))
}

/** Returns true when no filters are active (everything passes). */
function filtersAreEmpty(filters: MapFilters): boolean {
  return (
    filters.countries.length === 0 &&
    filters.periods.length === 0 &&
    filters.features.length === 0 &&
    !filters.unesco
  )
}

/**
 * Apply the shared map filters to a slim site list. A site passes when it
 * matches every active filter group; within the period/feature groups a site
 * matches if it has ANY of the selected values (OR), mirroring the All Sites
 * page behaviour.
 */
export function filterMapSites(sites: MapSite[], filters: MapFilters): MapSite[] {
  if (filtersAreEmpty(filters)) return sites

  return sites.filter((site) => {
    if (filters.unesco && !site.is_unesco) return false
    if (filters.countries.length > 0 && !filters.countries.includes(site.country)) {
      return false
    }
    if (
      filters.periods.length > 0 &&
      !filters.periods.some((p) => site.periods.includes(p))
    ) {
      return false
    }
    if (
      filters.features.length > 0 &&
      !filters.features.some((f) => site.features.includes(f))
    ) {
      return false
    }
    return true
  })
}
