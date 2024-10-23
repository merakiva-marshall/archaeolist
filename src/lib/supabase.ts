// src/lib/supabase.ts

import { createClient } from '@supabase/supabase-js'
import { Site, SiteImage } from '../types/site'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface RawSite {
  id: string;
  name: string;
  description: string;
  location: { coordinates: [number, number] };
  address: string | null;
  period: string;
  features: string;
  country: string;
  country_slug: string;
  slug: string;
  images: SiteImage[] | null;
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
        .select('*, images')
        .range(page * pageSize, (page + 1) * pageSize - 1)
        .order('id', { ascending: true });

      if (error) {
        console.error('Error fetching sites:', error);
        return [];
      }

      if (data) {
        // Log raw data for debugging
        console.log('Raw data example:', data[0]);

        const formattedSites = data.map((site: RawSite) => {
          const formattedSite: Site = {
            id: site.id,
            name: site.name,
            description: site.description,
            location: site.location.coordinates,
            address: site.address,
            period: site.period,
            features: site.features,
            country: site.country,
            country_slug: site.country_slug,
            slug: site.slug,
            images: Array.isArray(site.images) ? site.images : (site.images ? JSON.parse(site.images as unknown as string) : null)
          };

          // Log formatted site for debugging
          console.log(`Formatted site ${formattedSite.name} images:`, formattedSite.images);
          
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