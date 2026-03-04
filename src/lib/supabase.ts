// src/lib/supabase.ts

import { createClient } from '@supabase/supabase-js'
import { Site, SiteImage } from '../types/site'

export const supabase = createClient(
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
  archaeological_site_yn?: boolean;
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
        .select('id, name, description, short_description, location, country, country_slug, slug, address, images, wikipedia_url, is_unesco, archaeological_site_yn')
        .eq('archaeological_site_yn', true)
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
            short_description: site.short_description,
            location: site.location.coordinates,
            country: site.country,
            country_slug: site.country_slug,
            slug: site.slug,
            address: site.address,
            images: Array.isArray(site.images) ? site.images : (site.images ? JSON.parse(site.images as unknown as string) : null),
            wikipedia_url: site.wikipedia_url,
            is_unesco: site.is_unesco,
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