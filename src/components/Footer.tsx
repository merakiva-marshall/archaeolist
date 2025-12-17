// src/components/Footer.tsx

import { Heart } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand Column */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold font-days-one">Archaeolist</h3>
            <p className="text-gray-400 text-sm">
              Your Global History Guide. Discover archaeological sites worldwide on our interactive map.
            </p>
            <div className="flex space-x-4">
              {/* Social icons can go here */}
            </div>
            <div className="text-sm text-gray-500 pt-4">
              Made with <Heart className="inline-block w-3 h-3 text-red-500 mx-1" /> by{' '}
              <Link href="https://merakivatravel.com" className="text-blue-400 hover:text-blue-300">
                Merakiva Travel
              </Link>
            </div>
          </div>

          {/* Explore Column */}
          <div>
            <h4 className="font-bold text-gray-100 mb-4">Explore</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/sites" className="hover:text-white transition-colors">All Sites</Link></li>
              <li><Link href="/countries" className="hover:text-white transition-colors">All Countries</Link></li>
              <li><Link href="/sites/unesco" className="hover:text-white transition-colors">UNESCO Sites</Link></li>
              <li><Link href="/sites?period=Classical Period" className="hover:text-white transition-colors">Classical Period</Link></li>
              <li><Link href="/sites?period=Post-Classical Period" className="hover:text-white transition-colors">Post-Classical Period</Link></li>
              <li><Link href="/sites?period=Early Modern Period" className="hover:text-white transition-colors">Early Modern Period</Link></li>
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h4 className="font-bold text-gray-100 mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="https://merakivatravel.com/about-us" className="hover:text-white transition-colors">How to Use</Link></li>
              <li><Link href="https://merakivatravel.com/about-us" className="hover:text-white transition-colors">Data Sources</Link></li>
              <li><Link href="https://merakivatravel.com/about-us" className="hover:text-white transition-colors">FAQs</Link></li>
              <li><Link href="https://merakivatravel.com/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className="font-bold text-gray-100 mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

        </div>
      </div>
    </footer>
  )
}