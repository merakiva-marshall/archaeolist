// src/lib/supabase.ts

import { createClient } from '@supabase/supabase-js'
import { Site, SiteImage } from '../types/site'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Only the columns needed for map pin rendering and the initial sidebar preview.
// Heavy JSONB fields (processed_features, processed_periods, timeline) and unused columns
// are excluded — they're fetched on-demand when a user clicks a pin (see HomepageClient.tsx).
const MAP_SITE_COLUMNS = 'id, name, description, location, country, country_slug, slug, address, images, wikipedia_url, is_unesco, short_description' as const;

export interface RawSite {
  id: string;
  name: string;
  description: string;
  location: { coordinates: [number, number] };
  address: string | null;
  country: string;
  country_slug: string;
  slug: string;
  images: SiteImage[] | null;
  wikipedia_url?: string;
  is_unesco?: boolean;
  short_description?: string;
}

export async function fetchSites(): Promise<Site[]> {
  try {
    let allSites: Site[] = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from('sites')
        .select(MAP_SITE_COLUMNS)
        .range(page * pageSize, (page + 1) * pageSize - 1)
        .order('id', { ascending: true });

      if (error) {
        console.error('Error fetching sites:', error);
        return [];
      }

      if (data) {
        const formattedSites = data.map((site: RawSite) => ({
          id: site.id,
          name: site.name,
          description: site.description,
          location: site.location.coordinates,
          address: site.address,
          country: site.country,
          country_slug: site.country_slug,
          slug: site.slug,
          images: Array.isArray(site.images) ? site.images : (site.images ? JSON.parse(site.images as unknown as string) : null),
          wikipedia_url: site.wikipedia_url,
          is_unesco: site.is_unesco,
          short_description: site.short_description,
        } as Site));

        allSites = [...allSites, ...formattedSites];
      }

      hasMore = data !== null && data.length === pageSize;
      page++;
    }

    return allSites;
  } catch (error) {
    console.error('Error in fetchSites:', error);
    return [];
  }
}