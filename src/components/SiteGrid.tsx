// src/components/SiteGrid.tsx

'use client'

import { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { Loader2 } from 'lucide-react'
import { Site } from '../types/site'
import SiteCard from './SiteCard'

const PAGE_SIZE = 12

interface SiteGridProps {
  countrySlug?: string;
  initialSites?: Site[];
}

export default function SiteGrid({ initialSites }: SiteGridProps) {
  const [displayedSites, setDisplayedSites] = useState<Site[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (initialSites) {
      setDisplayedSites(initialSites.slice(0, PAGE_SIZE))
      setLoading(false)
    }
  }, [initialSites])

  // Calculate if there are more sites to show
  const hasMore = initialSites ? currentPage * PAGE_SIZE < initialSites.length : false

  const loadMore = () => {
    if (!initialSites) return

    setLoading(true)
    const nextPage = currentPage + 1
    const newSites = initialSites.slice(0, nextPage * PAGE_SIZE)
    
    setDisplayedSites(newSites)
    setCurrentPage(nextPage)
    setLoading(false)
  }

  if (!initialSites) {
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
        {displayedSites.map((site) => (
          <SiteCard key={site.id} site={site} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-8 flex justify-center">
          <Button
            onClick={loadMore}
            disabled={loading}
            className="min-w-[200px] bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400"
          >
            {loading ? (
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