// src/components/Sidebar.tsx

'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { Button } from './ui/button'
import { Site, SiteImage } from '../types/site'
import { Card } from './ui/card'
import { X } from 'lucide-react'

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  site: Site | null;
  onLearnMore: (site: Site) => void;
  onOpen: () => void;
}

export default function Sidebar({ isOpen, onClose, site, onLearnMore, onOpen }: SidebarProps) {
  useEffect(() => {
    if (isOpen && site) {
      console.log('Site data in sidebar:', site);
      console.log('Images:', site.images);
      if (site.images && Array.isArray(site.images)) {
        console.log('First image:', site.images[0]);
      }
      onOpen();
    }
  }, [isOpen, site, onOpen]);

  if (!site) return null;

  const firstImage = site.images && Array.isArray(site.images) && site.images.length > 0 
    ? site.images[0] 
    : null;

  return (
    <div 
      className={`fixed bg-white shadow-lg 
                  transition-transform duration-300 ease-in-out z-40
                  ${isOpen ? 'translate-x-0' : 'translate-x-[calc(100%+1rem)]'}
                  sm:w-[400px] sm:top-[5rem] sm:bottom-[5rem] sm:right-4
                  sm:rounded-l-2xl sm:rounded-tr-2xl sm:rounded-br-2xl
                  max-sm:w-[calc(100%-1rem)] max-sm:top-[33%] max-sm:bottom-16 max-sm:left-2 max-sm:right-[-0.5rem]
                  max-sm:rounded-2xl`}
    >
      <div className="h-full flex flex-col p-6">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 p-2"
          aria-label="Close sidebar"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-4 pr-8">{site.name}</h2>
        
        <div className="flex-grow overflow-y-auto px-0.5">
          {firstImage && (
            <div className="mb-4 w-full">
              <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={firstImage.url}
                  alt={firstImage.filename}
                  fill
                  className="object-cover"
                  sizes="(max-width: 400px) 100vw, 400px"
                  priority
                />
              </div>
            </div>
          )}
          
          <p className="text-gray-700">{site.description}</p>
        </div>

        <Button 
          onClick={() => onLearnMore(site)} 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4"
        >
          Learn More
        </Button>
      </div>
    </div>
  );
}