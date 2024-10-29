// src/components/RecentSites.tsx

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { Clock } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type RecentSiteData = {
  name: string;
  country: string;
  country_slug: string;
  slug: string;
  updated_at: string;
}

export default function RecentSites() {
  const [sites, setSites] = useState<RecentSiteData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchRecentSites() {
      try {
        const { data, error } = await supabase
          .from('sites')
          .select('name, country, country_slug, slug, updated_at')
          .order('updated_at', { ascending: false })
          .limit(40)

        if (error) {
          console.error('Error fetching recent sites:', error)
          return
        }

        setSites(data || [])
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecentSites()
  }, [])

  if (isLoading) {
    return (
      <div className="mt-8 mx-2">
        <div className="border rounded-lg p-4 bg-white shadow-sm">
          <div className="space-y-4">
            <div className="h-6 bg-gray-100 animate-pulse rounded"></div>
            <div className="h-6 bg-gray-100 animate-pulse rounded"></div>
            <div className="h-6 bg-gray-100 animate-pulse rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-8 mx-2 mb-2">
      <div className="border rounded-lg bg-white shadow-sm">
        <div className="p-3 border-b bg-gray-50">
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="h-4 w-4" />
            <h2 className="font-medium">Recently Updated Sites</h2>
          </div>
        </div>
        
        <div className="max-h-[calc(100vh-16rem)] overflow-y-auto">
          <div className="divide-y divide-gray-100">
            {sites.map((site, index) => (
              <Link
                key={`${site.country_slug}/${site.slug}`}
                href={`/sites/${site.country_slug}/${site.slug}`}
                className={`block group hover:bg-blue-50 transition-colors ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <div className="px-3 py-2.5">
                  <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {site.name}
                  </div>
                  <div className="text-xs text-gray-500 group-hover:text-blue-500 transition-colors mt-0.5">
                    {site.country}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}