// src/app/page.tsx

import type { Metadata } from 'next'
import HomepageClient from '../components/HomepageClient'
import FeaturedSites from '../components/FeaturedSites'
import PopularCountries from '../components/PopularCountries'
import MissionSection from '../components/MissionSection'
import AboutProject from '../components/AboutProject'

export const metadata: Metadata = {
  title: 'Archaeolist | Explore Archaeological Sites Worldwide',
  description: 'Discover thousands of archaeological sites on an interactive map. Explore ancient ruins, UNESCO World Heritage sites, and historical landmarks across every country.',
  alternates: {
    canonical: 'https://archaeolist.com',
  },
  openGraph: {
    title: 'Archaeolist | Explore Archaeological Sites Worldwide',
    description: 'Discover thousands of archaeological sites on an interactive map. Explore ancient ruins, UNESCO World Heritage sites, and historical landmarks across every country.',
    url: 'https://archaeolist.com',
    type: 'website',
  },
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <HomepageClient />
      <FeaturedSites />
      <PopularCountries />
      <MissionSection />
      <AboutProject />
    </div>
  )
}