// src/components/Homepage.tsx

'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import WelcomePopup from './WelcomePopup'
import Sidebar from './Sidebar'
import { MapProps } from './Map'
import { Site } from '../types/site'

const Map = dynamic<MapProps>(() => import('./Map'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-100 animate-pulse" />
})

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedSite, setSelectedSite] = useState<Site | null>(null)
  const router = useRouter()

  const handleSiteClick = (site: Site) => {
    setSelectedSite(site)
    setSidebarOpen(true)
  }

  const handleLearnMore = (site: Site) => {
    router.push(`/sites/${site.country}/${site.slug}`)
  }

  return (
    <div className="flex-1 flex flex-col relative">
      <Map onSiteClick={handleSiteClick} />
      <WelcomePopup />
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        site={selectedSite}
        onLearnMore={handleLearnMore}
      />
    </div>
  )
}