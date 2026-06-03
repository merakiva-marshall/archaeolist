// src/components/Sidebar.tsx

'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { Button } from './ui/button'
import { Site } from '../types/site'
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
      onClick={(e) => e.stopPropagation()}
      className={`absolute bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden
                  transition-all duration-300 ease-in-out z-[120]

                  /* Mobile (<640): bottom sheet whose lower edge spills past the
                     map, overlapping the filter bar below it */
                  inset-x-2 top-[46%] -bottom-14 rounded-2xl
                  ${isOpen ? 'translate-y-0' : 'translate-y-[150%]'}

                  /* Tablet & up (>=640): right-side overlay card */
                  sm:inset-x-auto sm:top-3 sm:bottom-3 sm:right-3 sm:h-auto sm:w-[330px] sm:max-h-[calc(100%-1.5rem)] sm:rounded-xl
                  ${isOpen
          ? 'sm:translate-y-0 sm:translate-x-0'
          : 'sm:translate-y-0 sm:translate-x-[calc(100%+1rem)]'
        }

                  /* Desktop (>=1024): a touch wider */
                  lg:w-[380px]`}
    >
      <div className="h-full min-h-0 flex flex-col p-5 sm:p-6">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 p-2 z-50 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Close sidebar"
          type="button"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-4 pr-8">{site.name}</h2>

        <div className="flex-grow min-h-0 overflow-y-auto px-0.5">
          {firstImage && (
            <div className="mb-4 w-full">
              <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={firstImage.url}
                  alt={firstImage.filename}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 400px"
                />
              </div>
            </div>
          )}

          <p className="text-gray-700">{site.description}</p>
        </div>

        <Button
          onClick={() => onLearnMore(site)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4 mb-2"
        >
          Learn More
        </Button>
      </div>
    </div>
  );
}