// src/components/SiteGrid.tsx

'use client'

import Link from 'next/link'
import { Button } from './ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Site } from '../types/site'
import SiteCard from './SiteCard'
import { useSearchParams } from 'next/navigation'

const PAGE_SIZE = 50

interface SiteGridProps {
  countrySlug?: string;
  initialSites?: Site[];
  showCountryContext?: boolean;
  /**
   * If true, disables client-side pagination (slicing) and internal pagination controls.
   * Use this when the parent component or server is already handling pagination.
   */
  manualPagination?: boolean;
}

export default function SiteGrid({ initialSites, showCountryContext, manualPagination = false }: SiteGridProps) {
  const searchParams = useSearchParams();
  const pageParam = searchParams.get('page');
  const currentPage = pageParam ? parseInt(pageParam) : 1;

  if (!initialSites) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-64 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  // If manualPagination is true, we just show everything passed to us
  if (manualPagination) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialSites.map((site) => (
          <SiteCard key={site.id} site={site} showCountryContext={showCountryContext} />
        ))}
      </div>
    );
  }

  // --- Client-Side Pagination Logic (Legacy/Country Page) ---

  const totalItems = initialSites.length;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);
  const safeCurrentPage = Math.max(1, Math.min(currentPage, totalPages));

  const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
  const displayedSites = initialSites.slice(startIndex, startIndex + PAGE_SIZE);

  const getPageLink = (page: number) => {
    const params = new URLSearchParams(searchParams);
    if (page === 1) {
      params.delete('page');
    } else {
      params.set('page', page.toString());
    }
    return `?${params.toString()}`;
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedSites.map((site) => (
          <SiteCard key={site.id} site={site} showCountryContext={showCountryContext} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-12 flex justify-center items-center gap-2">
          {/* Previous Button */}
          {safeCurrentPage > 1 ? (
            <Link
              href={getPageLink(safeCurrentPage - 1)}
              scroll={true}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-input bg-background text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              aria-label="Previous Page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
          ) : (
            <Button
              variant="outline"
              disabled
              className="h-10 w-10 p-0"
              aria-label="Previous Page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}

          <div className="flex items-center gap-1 mx-2 text-sm font-medium">
            PageResult {safeCurrentPage} of {totalPages}
          </div>

          {/* Next Button */}
          {safeCurrentPage < totalPages ? (
            <Link
              href={getPageLink(safeCurrentPage + 1)}
              scroll={true}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-input bg-background text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              aria-label="Next Page"
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <Button
              variant="outline"
              disabled
              className="h-10 w-10 p-0"
              aria-label="Next Page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}