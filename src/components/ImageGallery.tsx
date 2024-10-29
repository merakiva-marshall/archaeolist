// src/components/ImageGallery.tsx

'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Dialog } from "./ui/dialog"
import { Card } from "./ui/card"
import { Site, SiteImage } from '../types/site'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './ui/button'

interface ImageGalleryProps {
  site: Site;
}

export default function ImageGallery({ site }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<SiteImage | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const hasImages = site.images && Array.isArray(site.images) && site.images.length > 0;
  if (!hasImages) return null;

  const images = site.images as SiteImage[];
  const visibleImages = isExpanded ? images : images.slice(0, 3);

  const handleImageClick = (image: SiteImage, index: number) => {
    setSelectedImage(image);
    setSelectedIndex(index);
  };

  const handlePrevious = () => {
    const newIndex = selectedIndex > 0 ? selectedIndex - 1 : images.length - 1;
    setSelectedIndex(newIndex);
    setSelectedImage(images[newIndex]);
  };

  const handleNext = () => {
    const newIndex = selectedIndex < images.length - 1 ? selectedIndex + 1 : 0;
    setSelectedIndex(newIndex);
    setSelectedImage(images[newIndex]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'Escape') setSelectedImage(null);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleImages.map((image, index) => (
          <Card 
            key={index}
            className="overflow-hidden cursor-pointer hover:shadow-lg transition-transform hover:scale-105"
            onClick={() => handleImageClick(image, index)}
          >
            <div className="relative aspect-[4/3]">
              <Image
                src={image.url}
                alt={image.filename}
                fill
                className="object-cover"
                unoptimized
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          </Card>
        ))}
      </div>

      {images.length > 3 && !isExpanded && (
        <div className="text-center">
          <Button
            variant="secondary"
            onClick={() => setIsExpanded(true)}
            className="mt-4"
          >
            See All {images.length} Images
          </Button>
        </div>
      )}

      {selectedImage && (
        <Dialog 
          open={!!selectedImage} 
          onOpenChange={() => setSelectedImage(null)}
        >
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
            onKeyDown={handleKeyDown}
            onClick={() => setSelectedImage(null)}
            tabIndex={0}
          >
            <div 
              className="relative w-[98vw] h-[98vh] sm:w-[90vw] sm:h-[90vh] max-w-6xl max-h-[90vh] bg-white rounded-2xl flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-12 flex justify-end items-center px-4 shrink-0">
                <button
                  onClick={() => setSelectedImage(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Close gallery"
                >
                  <X className="h-6 w-6 text-gray-800 hover:text-blue-600" />
                </button>
              </div>

              <div className="flex-1 relative">
                <div className="relative h-full">
                  <Image
                    src={selectedImage.url}
                    alt={selectedImage.filename}
                    fill
                    className="object-contain"
                    unoptimized
                    sizes="100vw"
                    priority
                  />
                </div>
              </div>

              <div className="h-16 shrink-0 flex items-center justify-center border-t">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handlePrevious}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-8 w-8 text-gray-800" />
                  </button>
                  <div className="text-sm font-medium text-gray-600 min-w-[4rem] text-center">
                    {selectedIndex + 1} / {images.length}
                  </div>
                  <button
                    onClick={handleNext}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-8 w-8 text-gray-800" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}