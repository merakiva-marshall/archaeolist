// src/app/page.tsx

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const HomePage = dynamic(() => import('../components/Homepage'), {
  ssr: false,
  loading: () => <div className="w-full h-screen bg-slate-100 animate-pulse" />
})

export default function Home() {
  return (
    <Suspense fallback={<div className="w-full h-screen bg-slate-100 animate-pulse" />}>
      <HomePage />
    </Suspense>
  )
}