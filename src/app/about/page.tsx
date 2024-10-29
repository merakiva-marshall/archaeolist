// src/app/about/page.tsx

'use client'

import { ExternalLink, Compass, Map, Globe, Book } from 'lucide-react'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <main className="flex-1 relative w-full h-full overflow-auto">
      <div className="mx-auto px-4 py-12 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-[#1855ED] via-[#4777e6] to-[#161eb5] bg-clip-text text-transparent">
            Making Archaeology Accessible
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Archaeolist is your gateway to discovering archaeological wonders 
            around the world, making historical exploration easier and more 
            accessible than ever before.
          </p>
        </div>

        {/* Mission Section */}
        <div className="mb-12 rounded-lg border p-8">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <Compass className="h-5 w-5 text-[#1855ED]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                We&apos;re building the world&apos;s most comprehensive list of visitable archaeological sites. 
                Our goal is to democratize access to archaeological knowledge, making it easier for everyone—from 
                everyday travelers to serious historians—to discover and learn about humanity&apos;s shared heritage.
              </p>
            </div>
          </div>
        </div>

        {/* Vision Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="rounded-lg border p-8">
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <Map className="h-5 w-5 text-[#1855ED]" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4">What We&apos;re Building</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1.5 w-5 h-5 rounded-full bg-[#F8FAFF] flex items-center justify-center">
                      <span className="text-[#1855ED] text-sm">1</span>
                    </div>
                    <span className="text-gray-600">A comprehensive database of every visitable archaeological site worldwide</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1.5 w-5 h-5 rounded-full bg-[#F8FAFF] flex items-center justify-center">
                      <span className="text-[#1855ED] text-sm">2</span>
                    </div>
                    <span className="text-gray-600">Detailed information about site history, features, and accessibility</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1.5 w-5 h-5 rounded-full bg-[#F8FAFF] flex items-center justify-center">
                      <span className="text-[#1855ED] text-sm">3</span>
                    </div>
                    <span className="text-gray-600">Practical travel information to help you plan your visits</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-8">
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <Globe className="h-5 w-5 text-[#1855ED]" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4">Why It Matters</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1.5 w-5 h-5 rounded-full bg-[#F8FAFF] flex items-center justify-center">
                      <span className="text-[#1855ED] text-sm">✓</span>
                    </div>
                    <span className="text-gray-600">Archaeological knowledge accessible to everyone</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1.5 w-5 h-5 rounded-full bg-[#F8FAFF] flex items-center justify-center">
                      <span className="text-[#1855ED] text-sm">✓</span>
                    </div>
                    <span className="text-gray-600">Preserving and sharing our shared heritage</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1.5 w-5 h-5 rounded-full bg-[#F8FAFF] flex items-center justify-center">
                      <span className="text-[#1855ED] text-sm">✓</span>
                    </div>
                    <span className="text-gray-600">Empowering people to explore history firsthand</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Who We Are Section */}
        <div className="rounded-lg border p-8 mb-12">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <Book className="h-5 w-5 text-[#1855ED]" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Who We Are</h3>
              <div className="space-y-6 text-gray-600">
                <p>
                  Archaeolist was created by Dr. Marshall Schurtz, an archaeologist and founder of Merakiva Travel. After years of fieldwork 
                  in Spain, Lebanon, and Iraq, followed by a career in corporate strategy, Marshall 
                  founded Merakiva Travel to make archaeology interesting, unique, and accessible to everyone.
                </p>
                <p>
                  <span className="font-semibold text-gray-800">Merakiva Travel</span> is a specialized travel company 
                  offering immersive group experiences that go beyond typical sightseeing, using archaeology and history to make 
                  each journey uniquely engaging.
                </p>
                <p>
                  The idea for Archaeolist emerged from visiting archaeological sites and being unable to understand what&apos;s there and why it&apos;s important.
                  With Archaeolist, anyone will be able to visit and appreciate the past that is all around us.
                  It&apos;s designed to bridge the gap between academic publications and public interest, 
                  making it easier for everyone to discover and explore our shared human heritage.
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <Link 
                    href="https://merakivatravel.com" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center bg-[#1855ED] text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Visit Merakiva Travel
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                  <Link 
                    href="https://instagram.com/merakiva.travel" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center border border-[#1855ED] text-[#1855ED] px-4 py-2 rounded-md hover:bg-blue-50 transition-colors"
                  >
                    Follow on Instagram
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}