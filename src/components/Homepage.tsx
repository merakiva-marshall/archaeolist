// src/app/components/Homepage.tsx

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from './Header'
import WelcomePopup from './WelcomePopup'
import Sidebar from './Sidebar'
import MapContainer from './map/mapContainer'
import { Site } from '../types/site'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedSite, setSelectedSite] = useState<Site | null>(null)
  const [allSites, setAllSites] = useState<Site[]>([])
  const [searchResults, setSearchResults] = useState<Site[]>([])
  const router = useRouter()

  useEffect(() => {
    const fetchSites = async () => {
      const { data, error } = await supabase
        .from('sites')
        .select('*')
      
      if (error) {
        console.error('Error fetching sites:', error)
      } else if (data) {
        setAllSites(data.map(site => ({
          ...site,
          location: site.location.coordinates as [number, number]
        })))
      }
    }

    fetchSites()
  }, [])

  const handleSiteClick = (site: Site) => {
    setSelectedSite(site)
    setSidebarOpen(true)
  }

  const handleLearnMore = (site: Site) => {
    router.push(`/sites/${site.country}/${site.slug}`)
  }

  return (
    <main className="h-screen flex flex-col">
      <Header />
      <div className="flex-1 relative">
        <MapContainer 
          onSiteClick={handleSiteClick} 
          sites={allSites}
          searchResults={searchResults}
        />
        <WelcomePopup />
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          site={selectedSite}
          onLearnMore={handleLearnMore}
        />
      </div>
    </main>
  )
}