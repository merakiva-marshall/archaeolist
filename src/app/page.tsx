// src/app/page.tsx

import HomepageClient from '../components/HomepageClient'
import FeaturedSites from '../components/FeaturedSites'
import PopularCountries from '../components/PopularCountries'
import MissionSection from '../components/MissionSection'
import AboutProject from '../components/AboutProject'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <HomepageClient />
      <FeaturedSites />
      <PopularCountries />
      <MissionSection />
      <AboutProject />
    </main>
  )
}