// src/lib/supabase.ts

import { createClient } from '@supabase/supabase-js'
import { Site } from '../types/site'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function fetchSites(): Promise<Site[]> {
  try {
    let allSites: Site[] = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from('sites')
        .select('id, name, description, location, address, period, features, country, slug')
        .range(page * pageSize, (page + 1) * pageSize - 1)
        .order('id', { ascending: true });

      if (error) {
        console.error('Error fetching sites:', error);
        return [];
      }

      if (data) {
        const formattedSites = data.map(site => ({
          id: site.id,
          name: site.name,
          description: site.description,
          location: site.location.coordinates,
          address: site.address,
          period: site.period,
          features: site.features,
          country: site.country,
          slug: site.slug
        }));

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