// src/components/HomepageClient.tsx

'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Maximize2, Minimize2 } from 'lucide-react'
import WelcomePopup from './WelcomePopup'
import Sidebar from './Sidebar'
import MapFilterBar from './MapFilterBar'
import { useSiteFilters } from '../hooks/useSiteFilters'
import { fetchMapSites } from '../lib/mapSites'

import { Site, MapSite } from '../types/site'

const Map = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-100 animate-pulse" />
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const SELECTED_SITE_KEY = 'homepageSelectedSiteId'
const MAP_VIEW_KEY = 'homepageMapView'

export default function HomepageClient() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedSite, setSelectedSite] = useState<Site | null>(null)
  const [sites, setSites] = useState<MapSite[]>([])
  const [isFullscreen, setIsFullscreen] = useState(false)
  const router = useRouter()
  const { filters } = useSiteFilters()

  // Load slim sites once and share them with the map + filter bar.
  useEffect(() => {
    fetchMapSites().then(setSites)
  }, [])

  // Fetch the full record for a site (images, description, location) by id.
  const fetchFullSite = useCallback(async (id: string, fallbackLocation?: [number, number]): Promise<Site | null> => {
    const { data: fullSite } = await supabase
      .from('sites')
      .select('*, images')
      .eq('id', id)
      .single()

    if (!fullSite) return null
    return {
      ...fullSite,
      location: fallbackLocation ?? fullSite.location?.coordinates,
      images: fullSite.images
    } as Site
  }, [])

  const handleSiteClick = async (site: Site) => {
    // Keep the current (slim) site data visible while we fetch the full record.
    setSelectedSite(site)
    setSidebarOpen(true)
    try {
      sessionStorage.setItem(SELECTED_SITE_KEY, site.id)
    } catch { /* ignore */ }

    const fullSite = await fetchFullSite(site.id, site.location)
    if (fullSite) setSelectedSite(fullSite)
  }

  const handleClose = () => {
    setSidebarOpen(false)
    try {
      sessionStorage.removeItem(SELECTED_SITE_KEY)
    } catch { /* ignore */ }
  }

  /* Scroll to top on mount */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  // Restore the previously selected site when returning to the map (e.g. via back).
  useEffect(() => {
    let storedId: string | null = null
    try {
      storedId = sessionStorage.getItem(SELECTED_SITE_KEY)
    } catch { /* ignore */ }
    if (!storedId) return

    fetchFullSite(storedId).then((fullSite) => {
      if (fullSite && fullSite.location) {
        setSelectedSite(fullSite)
        setSidebarOpen(true)
      }
    })
  }, [fetchFullSite])

  // Allow Esc to leave fullscreen.
  useEffect(() => {
    if (!isFullscreen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullscreen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isFullscreen])

  const handleLearnMore = (site: Site) => {
    router.push(`/sites/${site.country_slug}/${site.slug}`)
  }

  return (
    <div className="bg-white">
      {/* Header Section */}
      <div className="bg-surface border-b border-outline-variant pt-8 pb-5 px-8">
        <span className="text-xs font-headline font-bold uppercase tracking-[0.2em] text-primary-brand">The World&apos;s Archaeological Record</span>
        <h1 className="text-4xl sm:text-5xl font-black text-primary-brand font-headline tracking-tighter leading-[0.95] mt-1">
          Explore Ancient Sites from Around the World
        </h1>
      </div>

      {/* Hero Section with Map Window (overflow-hidden clips the closed card sheet).
          In fullscreen we raise the stacking context above the sticky header (z-50)
          so the fixed map truly covers everything, including the nav. */}
      <div className={`relative w-full border-b border-gray-200 shadow-sm overflow-hidden ${isFullscreen ? 'z-[60]' : 'z-30'}`}>

        {/* Map Container (becomes a full-viewport overlay in fullscreen).
            overflow-visible on mobile lets the card sheet spill over the filters;
            clipped again from lg up where the card is a right-side overlay. */}
        <div
          className={`w-full bg-surface-container overflow-visible lg:overflow-hidden ${
            isFullscreen
              ? 'fixed inset-0 z-[200] h-screen w-screen'
              : 'relative h-[75vh] sm:h-[65vh]'
          }`}
        >
          <Map
            onSiteClick={handleSiteClick}
            selectedSite={selectedSite}
            isSidebarOpen={sidebarOpen}
            filters={filters}
            sites={sites}
            persistViewKey={MAP_VIEW_KEY}
            fullscreen={isFullscreen}
          />

          {/* Desktop: filters overlay the map */}
          {sites.length > 0 && (
            <div className="hidden lg:block">
              <MapFilterBar sites={sites} variant="overlay" />
            </div>
          )}

          {/* Enter fullscreen (desktop only) — hidden while a card is open */}
          {!isFullscreen && !sidebarOpen && (
            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              aria-label="View map fullscreen"
              className="hidden lg:flex absolute top-3 right-3 z-[70] h-10 w-10 items-center justify-center rounded-lg bg-white/90 shadow-lg ring-1 ring-black/5 transition-colors hover:bg-white"
            >
              <Maximize2 className="h-5 w-5" />
            </button>
          )}

          {/* Exit fullscreen (desktop only) — bottom-left so the card never covers it */}
          {isFullscreen && (
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              aria-label="Exit fullscreen map"
              className="hidden lg:flex absolute bottom-8 left-4 z-[130] h-10 items-center gap-2 rounded-full bg-white/95 px-4 text-sm font-medium shadow-lg ring-1 ring-black/5 transition-colors hover:bg-white"
            >
              <Minimize2 className="h-4 w-4" /> Exit fullscreen
            </button>
          )}

          {/* Card: bottom sheet on mobile, right overlay on tablet/desktop */}
          <Sidebar
            isOpen={sidebarOpen}
            onClose={handleClose}
            site={selectedSite}
            onLearnMore={handleLearnMore}
            onOpen={() => { }}
          />
        </div>

        {/* Mobile/tablet: filters run full width below the map */}
        {sites.length > 0 && (
          <div className="lg:hidden">
            <MapFilterBar sites={sites} variant="below" />
          </div>
        )}
      </div>

      {/* Global Components */}
      <WelcomePopup />
    </div>
  )
}
