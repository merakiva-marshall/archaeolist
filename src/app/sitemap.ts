// src/app/sitemap.ts

import { createClient } from '@supabase/supabase-js'
import { MetadataRoute } from 'next'

interface SitemapSite {
  country_slug: string;
  slug: string;
  updated_at: string | null;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch all sites - using same pagination logic as in generateStaticParams
  let allSites: SitemapSite[] = [];
  let page = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('sites')
      .select('country_slug, slug, updated_at')
      .range(page * pageSize, (page + 1) * pageSize - 1)
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching sites for sitemap:', error);
      break;
    }

    if (data) {
      allSites = [...allSites, ...data];
    }

    hasMore = data && data.length === pageSize;
    page++;
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://archaeolist.com';

  // Start with static routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ];

  // Add dynamic routes for each site
  for (const site of allSites) {
    if (site.country_slug && site.slug) {
      routes.push({
        url: `${baseUrl}/sites/${site.country_slug}/${site.slug}`,
        lastModified: site.updated_at ? new Date(site.updated_at) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
  }

  return routes;
}