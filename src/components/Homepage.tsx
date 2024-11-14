// src/components/Homepage.tsx

'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import WelcomePopup from './WelcomePopup'
import Sidebar from './Sidebar'
import { MapProps } from './Map'
import { Site } from '../types/site'
import { tileCache } from '../lib/cache/tileCache'
import { logger } from '../lib/logger'
import { validateImplementation } from '../lib/monitoring/test'

const Map = dynamic<MapProps>(() => import('./Map'), {
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

  useEffect(() => {
    // Clean expired cache entries every hour
    const interval = setInterval(() => {
      tileCache.clearExpired().catch((error: Error) => {
        logger.error(error, { context: 'Cache cleanup' });
      });
    }, 60 * 60 * 1000);
  
    // Only run validation in development
    if (process.env.NODE_ENV === 'development') {
      // Initial validation after map load
      setTimeout(() => {
        validateImplementation().then(passed => {
          console.log('Initial implementation validation:', passed ? 'PASSED' : 'FAILED');
        });
      }, 5000);
    }
  
    return () => clearInterval(interval);
  }, []);

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

  const handleLearnMore = (site: Site) => {
    router.push(`/sites/${site.country_slug}/${site.slug}`)
  }

  return (
    <div className="absolute inset-0">
      <Map 
        onSiteClick={handleSiteClick} 
        selectedSite={selectedSite} 
        isSidebarOpen={sidebarOpen} 
      />
      <WelcomePopup />
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        site={selectedSite}
        onLearnMore={handleLearnMore}
        onOpen={() => {}}
      />
    </div>
  )
}