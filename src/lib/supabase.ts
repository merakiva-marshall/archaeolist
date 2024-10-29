// src/lib/supabase.ts

import { createClient } from '@supabase/supabase-js'
import { Site, SiteImage, Timeline } from '../types/site'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)


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
  processed_features?: { [key: string]: string[] };
  processed_periods?: { [key: string]: string[] };
  timeline?: Timeline;
  archaeological_site_yn?: boolean;
  updated_at: string; // Add this line
}

export async function fetchSites(): Promise<Site[]> {
  try {
    let allSites: Site[] = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      console.log('Fetching page:', page);
      
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .range(page * pageSize, (page + 1) * pageSize - 1)
        .order('id', { ascending: true });

      if (error) {
        console.error('Error fetching sites:', error);
        return [];
      }

      if (data) {
        const formattedSites = data.map((site: RawSite) => {
          const formattedSite: Site = {
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
            processed_features: site.processed_features,
            processed_periods: site.processed_periods,
            timeline: site.timeline,
            archaeological_site_yn: site.archaeological_site_yn
          };
          
          return formattedSite;
        });

        allSites = [...allSites, ...formattedSites];
      }

      hasMore = data && data.length === pageSize;
      page++;
    }

    return allSites;
  } catch (error) {
    console.error('Error in fetchSites:', error);
    return [];
  }
}