'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Header from '../components/Header'
import WelcomePopup from '../components/WelcomePopup'
import Sidebar from '../components/Sidebar'

const Map = dynamic(() => import('../components/Map'), {
  ssr: false,
  loading: () => <div className="w-full h-screen bg-slate-100 animate-pulse" />
})

interface Site {
  id: string;
  name: string;
  description: string;
  address: string;
  period: string[];
  features: string[];
}

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedSite, setSelectedSite] = useState<Site | null>(null)

  const handleSiteClick = (site: Site) => {
    setSelectedSite(site)
    setSidebarOpen(true)
  }

  return (
    <main className="h-screen flex flex-col">
      <Header />
      <div className="flex-1 relative">
        <Map onSiteClick={handleSiteClick} />
        <WelcomePopup />
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          site={selectedSite}
        />
      </div>
    </main>
  )
}