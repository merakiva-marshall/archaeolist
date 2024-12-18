// src/components/Footer.tsx

import { Heart } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-3">
      <div className="container mx-auto px-4 text-center text-xs sm:text-sm text-gray-600">
        Made with <Heart className="inline-block w-3 h-3 sm:w-4 sm:h-4 text-red-500 mx-1" /> in Philadelphia, PA by{' '}
        <Link href="https://merakivatravel.com" className="text-blue-600 hover:underline">
          Merakiva Travel
        </Link>
      </div>
    </footer>
  )
}