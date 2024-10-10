'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

export default function WelcomePopup() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div className="relative p-6">
          <button 
            onClick={() => setIsVisible(false)}
            className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-6 w-6" />
          </button>
          <h2 className="text-2xl font-bold mb-4">Welcome to Archaeolist</h2>
          <div>
            <p className="text-gray-600 mb-4">
              Discover archaeological sites from around the world. Browse the map, 
              click on sites to learn more, and plan your next historical adventure.
            </p>
            <ul className="space-y-2 text-gray-600 mb-6">
              <li>🗺️ Explore sites on the interactive map</li>
              <li>📚 Access detailed information about each location</li>
              <li>🔍 Search for specific sites or regions</li>
              <li>🌍 Plan your visits with practical information</li>
            </ul>
            <button
              onClick={() => setIsVisible(false)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            >
              Start Exploring
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}