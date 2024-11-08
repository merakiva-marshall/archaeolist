// src/components/SiteGrid.tsx

'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Button } from './ui/button'
import { Loader2 } from 'lucide-react'
import { Site } from '../types/site'
import SiteCard from './SiteCard'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const PAGE_SIZE = 12

interface SiteGridProps {
  countrySlug?: string;
  initialSites?: Site[];
}

export default function SiteGrid({ countrySlug, initialSites }: SiteGridProps) {
  const [sites, setSites] = useState<Site[]>(initialSites || [])
  const [loading, setLoading] = useState(!initialSites)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const loadSites = useCallback(async (offset: number) => {
    try {
      if (offset === 0) setLoading(true)
      else setLoadingMore(true)

      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .eq('country_slug', countrySlug)
        .range(offset, offset + PAGE_SIZE - 1)
        .order('name')

      if (error) {
        console.error('Error loading sites:', error)
        return
      }

      if (data) {
        setSites(current => offset === 0 ? data : [...current, ...data])
        setHasMore(data.length === PAGE_SIZE)
      }
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [countrySlug])

  useEffect(() => {
    if (!initialSites) {
      loadSites(0)
    }
  }, [initialSites, loadSites])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-64 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sites.map((site) => (
          <SiteCard key={site.id} site={site} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-8 flex justify-center">
          <Button
            onClick={() => loadSites(sites.length)}
            disabled={loadingMore}
            className="min-w-[200px] bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400"
          >
            {loadingMore ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading more sites...
              </>
            ) : (
              'Load More Sites'
            )}
          </Button>
        </div>
      )}
    </div>
  )
}