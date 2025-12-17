// src/components/Homepage.tsx

'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import WelcomePopup from './WelcomePopup'
import Sidebar from './Sidebar'
import FeaturedSites from './FeaturedSites'
import PopularCountries from './PopularCountries'
import MissionSection from './MissionSection'
import AboutProject from './AboutProject'

import { Site } from '../types/site'

// Remove the ref type from dynamic import to fix lint error if it persists, 
// though we don't strictly use the ref for flyTo anymore since FeaturedSites links directly.
// But we might keep it if we want to allow map control later.
const Map = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-100 animate-pulse" />
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedSite, setSelectedSite] = useState<Site | null>(null)
  const router = useRouter()
  // const mapRef = useRef<MapRef>(null) // Not currently used as Featured Sites link directly

  const handleSiteClick = async (site: Site) => {
    // Keep the current site data while we fetch
    setSelectedSite(site);
    setSidebarOpen(true);

    // Fetch full site data including images
    const { data: fullSite } = await supabase
      .from('sites')
      .select('*, images')
      .eq('id', site.id)
      .single();

    if (fullSite) {
      // Transform the data to match our Site type
      const transformedSite: Site = {
        ...fullSite,
        location: site.location, // Keep the original location data
        images: fullSite.images
      };

      console.log('Fetched full site data:', transformedSite);
      setSelectedSite(transformedSite);
    }
  }

  /* Scroll to top on mount */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handleLearnMore = (site: Site) => {
    router.push(`/sites/${site.country_slug}/${site.slug}`)
  }

  // Not used anymore as we link directly
  /* 
  const handleFeaturedClick = (site: Site) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
        // mapRef.current?.flyToSite(site); 
        handleSiteClick(site); 
    }, 500);
  }
  */

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-100 pt-8 pb-4 px-4 sm:px-6 lg:px-8 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-600 tracking-wide font-days-one text-center mx-auto">
          Explore Archaeological Sites from Around the World
        </h1>
      </div>

      {/* Hero Section with Map Window */}
      {/* 
          Mobile Layout: Flex Column. Map is fixed height. Sidebar is relative flowing block below map.
          Desktop Layout: Block relative. Map fills container. Sidebar is absolute overlay.
      */}
      <div className="relative w-full border-b border-gray-200 shadow-sm group z-30 flex flex-col sm:block">

        {/* Map Container */}
        <div className="relative w-full h-[75vh] sm:h-[65vh]">
          <Map
            // ref={mapRef}
            onSiteClick={handleSiteClick}
            selectedSite={selectedSite}
            isSidebarOpen={sidebarOpen}
          />
        </div>

        {/* Sidebar contained within the Hero Section but flow-based on mobile */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          site={selectedSite}
          onLearnMore={handleLearnMore}
          onOpen={() => { }}
        />
      </div>

      <FeaturedSites />

      <PopularCountries />

      <MissionSection />

      <AboutProject />

      {/* Global Components */}
      <WelcomePopup />
    </div>
  )
}