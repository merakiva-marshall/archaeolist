'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Card } from './ui/card'

export default function WelcomePopup() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('hasSeenWelcome')) {
      setIsVisible(true)
    }
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    localStorage.setItem('hasSeenWelcome', 'true')
  }

  const welcomeContent = (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">
        Discover Archaeological Sites Worldwide
      </h2>
      <div>
        <h3 className="text-xl font-semibold mb-3">
          Explore Ancient History Around the Globe
        </h3>
        <p className="text-gray-600 mb-4">
          Welcome to Archaeolist, your comprehensive guide to archaeological sites worldwide. 
          Browse our interactive map, discover ancient ruins, and plan your next historical adventure.
        </p>
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-3">How to Use Archaeolist</h3>
        <ul className="space-y-2 text-gray-600">
          <li>🗺️ Navigate the interactive map to find sites</li>
          <li>🎨 Look for darker blue areas with high concentrations of sites</li>
          <li>📚 Click on sites to access detailed historical information</li>
          <li>🔍 Use the search feature to find specific locations</li>
          <li>🌍 Get practical visiting information for each site</li>
        </ul>
      </div>
    </div>
  )

  return (
    <>
      {isVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4 z-50">
          <Card className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 relative">
            <button 
              onClick={handleClose}
              className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-lg"
              aria-label="Close welcome popup"
            >
              <X className="h-6 w-6" />
            </button>
            {welcomeContent}
            <button
              onClick={handleClose}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 mt-6"
            >
              Start Exploring
            </button>
          </Card>
        </div>
      )}
    </>
  )
}
