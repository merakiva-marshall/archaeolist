import dynamic from 'next/dynamic'

const HomePage = dynamic(() => import('../components/Homepage'), {
  ssr: false,
  loading: () => <div className="w-full h-screen bg-slate-100 animate-pulse" />
})

export default function Home() {
  return <HomePage />
}