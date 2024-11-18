// src/app/[type]/route.ts

import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface SitemapSite {
  country_slug: string
  slug: string
  updated_at: string | null
}

// Helper function to format date for sitemap
function formatDate(date: string | Date): string {
  if (date instanceof Date) {
    return date.toISOString()
  }
  return new Date(date).toISOString()
}

// Helper function to generate XML
function generateSitemapXml(sitemap: MetadataRoute.Sitemap): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${sitemap
        .map(entry => `
          <url>
            <loc>${entry.url}</loc>
            <lastmod>${formatDate(entry.lastModified || new Date())}</lastmod>
            ${entry.changeFrequency ? `<changefreq>${entry.changeFrequency}</changefreq>` : ''}
            ${entry.priority ? `<priority>${entry.priority}</priority>` : ''}
          </url>
        `)
        .join('')}
    </urlset>`
}

// Helper function to generate sitemap index XML
function generateSitemapIndexXml(sitemaps: { url: string; lastModified: Date }[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
    <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${sitemaps
        .map(entry => `
          <sitemap>
            <loc>${entry.url}</loc>
            <lastmod>${entry.lastModified.toISOString()}</lastmod>
          </sitemap>
        `)
        .join('')}
    </sitemapindex>`
}

export async function GET(
  request: Request,
  { params }: { params: { type: string } }
): Promise<Response> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://archaeolist.com'
  
  // Clean up the type parameter to handle various formats
  const type = params.type.replace(/\.xml$/, '').toLowerCase()

  try {
    // Handle sitemap index - handle both root sitemap.xml and index
    if (type === 'sitemap' || type === 'index') {
      const sitemapIndex = [
        {
          url: `${baseUrl}/sitemap-static`,
          lastModified: new Date(),
        },
        {
          url: `${baseUrl}/sitemap-sites`,
          lastModified: new Date(),
        },
        {
          url: `${baseUrl}/sitemap-countries`,
          lastModified: new Date(),
        },
      ]

      return new Response(generateSitemapIndexXml(sitemapIndex), {
        headers: {
          'Content-Type': 'application/xml',
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate'
        },
      })
    }

    // Handle other sitemaps with simplified matching
    if (['sitemap-static', 'sitemap-sites', 'sitemap-countries'].includes(type)) {
      // Strip 'sitemap-' prefix for our internal handling
      const sitemapType = type.replace('sitemap-', '')
      
      if (sitemapType === 'static') {
        const staticSitemap: MetadataRoute.Sitemap = [
          {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1
          },
          {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8
          }
        ]
  
        return new Response(generateSitemapXml(staticSitemap), {
          headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate'
          },
        })
      }
      
      if (sitemapType === 'sites') {
        let allSites: SitemapSite[] = []
        let page = 0
        const pageSize = 1000
        let hasMore = true
  
        while (hasMore) {
          const { data, error } = await supabase
            .from('sites')
            .select('country_slug, slug, updated_at')
            .range(page * pageSize, (page + 1) * pageSize - 1)
            .order('id', { ascending: true })
  
          if (error) {
            throw new Error(error.message)
          }
  
          if (data) {
            allSites = [...allSites, ...data.filter(site => 
              site.country_slug && 
              site.slug
            )]
          }
  
          hasMore = data && data.length === pageSize
          page++
        }
  
        const sitesSitemap = allSites.map(site => ({
          url: `${baseUrl}/sites/${site.country_slug}/${site.slug}`,
          lastModified: site.updated_at ? new Date(site.updated_at) : new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.6
        }))
  
        return new Response(generateSitemapXml(sitesSitemap), {
          headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate'
          },
        })
      }
      
      if (sitemapType === 'countries') {
        const { data: countryCounts, error } = await supabase
          .from('sites')
          .select('country_slug, updated_at')
  
        if (error) {
          throw new Error(error.message)
        }
  
        const countryStats = countryCounts.reduce((acc, site) => {
          if (!site.country_slug) return acc
          
          if (!acc[site.country_slug]) {
            acc[site.country_slug] = {
              count: 0,
              latest_update: site.updated_at || new Date().toISOString()
            }
          }
          
          acc[site.country_slug].count++
          if (site.updated_at && site.updated_at > acc[site.country_slug].latest_update) {
            acc[site.country_slug].latest_update = site.updated_at
          }
          
          return acc
        }, {} as Record<string, { count: number; latest_update: string }>)
  
        const countriesSitemap = Object.entries(countryStats).map(([country_slug, stats]) => ({
          url: `${baseUrl}/sites/${country_slug}`,
          lastModified: new Date(stats.latest_update),
          changeFrequency: 'daily' as const,
          priority: Math.min(0.7 + (stats.count * 0.01), 0.9)
        }))
  
        return new Response(generateSitemapXml(countriesSitemap), {
          headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate'
          },
        })
      }
    }

    // Handle invalid sitemap type
    return new Response('Not found', { status: 404 })
  } catch (error) {
    return new Response('Error generating sitemap', { status: 500 })
  }
}
