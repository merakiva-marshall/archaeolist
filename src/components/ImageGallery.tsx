// src/components/ImageGallery.tsx

'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Dialog } from "./ui/dialog"
import { Card } from "./ui/card"
import { Site, SiteImage } from '../types/site'
import { X } from 'lucide-react'

interface ImageGalleryProps {
  site: Site;
}

export default function ImageGallery({ site }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<SiteImage | null>(null);

  const hasImages = site.images && Array.isArray(site.images) && site.images.length > 0;
  if (!hasImages) return null;

  const images = site.images as SiteImage[]; // Type assertion after check

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Gallery</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <Card 
            key={index}
            className="overflow-hidden cursor-pointer hover:shadow-lg transition-transform hover:scale-105"
            onClick={() => setSelectedImage(image)}
          >
            <div className="relative aspect-[4/3]">
              <Image
                src={image.url}
                alt={image.filename}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          </Card>
        ))}
      </div>

      {selectedImage && (
        <Dialog 
          open={!!selectedImage} 
          onOpenChange={(open) => !open && setSelectedImage(null)}
        >
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="relative w-[80vw] h-[80vh]">
              <div className="absolute inset-0">
                <Image
                  src={selectedImage.url}
                  alt={selectedImage.filename}
                  fill
                  className="object-contain"
                  sizes="80vw"
                />
              </div>
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/75 rounded-full text-white z-[60]"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}