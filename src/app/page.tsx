import dynamic from 'next/dynamic'
import Header from '../components/Header'
import WelcomePopup from '../components/WelcomePopup'

const Map = dynamic(() => import('../components/Map'), {
  ssr: false,
  loading: () => <div className="w-full h-screen bg-slate-100 animate-pulse" />
})

export default function Home() {
  return (
    <main className="h-screen flex flex-col">
      <Header />
      <div className="flex-1 relative">
        <Map />
        <WelcomePopup />
      </div>
    </main>
  )
}