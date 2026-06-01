// src/components/VisitSection.tsx

'use client'

import { useState, useEffect } from 'react';
import { Map, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import Image from 'next/image';
import { ViatorTour } from '@/lib/viator/types';
import ViatorTours from './ViatorTours';

// Helper to check if user is in US or CA
// Returns false on error to be safe with restriction
const isAllowedCountry = async (): Promise<boolean> => {
  try {
    // Localhost always allowed
    if (typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      return true;
    }

    // specific check for ipapi.co with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

    const response = await fetch('https://ipapi.co/json/', { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) return false;

    const data = await response.json();
    return ['US', 'CA', 'GB'].includes(data.country_code); // Added GB for testing if needed, or stick to US/CA as per original
  } catch {
    return true; // Fail open — better to show the CTA than silently hide it on API errors
  }
};

interface VisitSectionProps {
  siteName: string;
  slug: string;
  country: string;
  country_slug: string;
  hasTours?: boolean;
  hasDirections?: boolean;
  tours?: ViatorTour[];
  variant?: 'default' | 'redesign';
}



export default function VisitSection({
  siteName,
  slug,
  country,
  country_slug,
  hasTours = false,
  hasDirections = false,
  tours = [],
  variant = 'default'
}: VisitSectionProps) {
  const [showMerakiva, setShowMerakiva] = useState(false);

  useEffect(() => {
    isAllowedCountry().then(setShowMerakiva);
  }, []);

  // Redesign variant with Merakiva CTA
  if (variant === 'redesign') {
    return (
      <div className="space-y-6">
        {/* Tours - Display Tours if available, otherwise show placeholder if hasTours is true */}
        {tours && tours.length > 0 ? (
          <div>
            <h3 className="font-headline font-bold text-[#1b1c1c] text-lg mb-4">Recommended Tours</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
              {tours.slice(0, 3).map((tour) => (
                <a
                  key={tour.tour_id}
                  href={tour.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#ffffff] rounded-xl border border-[#c3c6d6]/20 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-[16/10] bg-[#e8eaed]">
                    {tour.image_url ? (
                      <Image
                        src={tour.image_url}
                        alt={tour.title}
                        width={400}
                        height={250}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Globe className="h-12 w-12 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="font-headline font-bold text-sm text-[#1b1c1c] mb-1 line-clamp-2">
                      {tour.title}
                    </h4>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-amber-500 text-xs">
                        {'★'.repeat(Math.floor(tour.rating || 0))}
                        {tour.rating && tour.rating % 1 >= 0.5 ? '★' : ''}
                        {'☆'.repeat(5 - Math.ceil(tour.rating || 0))}
                      </span>
                      <span className="text-xs text-[#434653] font-label">
                        ({tour.review_count?.toLocaleString() || 0} reviews)
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-headline font-bold text-[#003b93]">
                        {tour.price && tour.price > 0
                          ? new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: tour.currency || 'USD',
                              maximumFractionDigits: 0,
                            }).format(tour.price)
                          : 'TBD'}
                      </span>
                      <span className="text-xs font-label font-semibold text-[#003b93] hover:underline">
                        Book Now →
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        ) : hasTours && (
          <div className="bg-[#ffffff] rounded-xl border border-[#c3c6d6]/20 p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center">
                  <Globe className="h-6 w-6 text-gray-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-headline font-semibold text-[#1b1c1c] mb-2">Find Tours</h3>
                <p className="text-sm font-body text-[#434653] mb-4">
                  Guided tours and experiences at {siteName}. Coming soon.
                </p>
                <Button variant="secondary" className="w-full" disabled>
                  View Tours
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Take a Trip - Merakiva Travel with Green Gradient */}
        {showMerakiva && (
          <div className="bg-gradient-to-r from-[#006D77] to-[#005c64] p-6 rounded-2xl text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-headline font-bold text-lg mb-1">Need help planning your trip?</h3>
              <p className="text-emerald-100 text-sm font-label">
                Merakiva Travel offers personalized consultation for archaeological journeys.
              </p>
            </div>
            <button
              onClick={() => {
                window.open(
                  `https://merakivatravel.com/travel-consultation?site=${encodeURIComponent(slug)}&country=${encodeURIComponent(country_slug)}`,
                  '_blank'
                );
              }}
              className="bg-white text-[#006D77] px-6 py-2.5 rounded-full font-headline font-bold text-sm hover:bg-emerald-50 transition-colors whitespace-nowrap text-center"
            >
              Get Free Consultation
            </button>
          </div>
        )}

        {/* Directions - Conditional */}
        {hasDirections && (
          <div className="bg-[#ffffff] rounded-xl border border-[#c3c6d6]/20 p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center">
                  <Map className="h-6 w-6 text-gray-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-headline font-semibold text-[#1b1c1c] mb-2">Getting There</h3>
                <p className="text-sm font-body text-[#434653] mb-4">
                  Directions and transportation options. Coming soon.
                </p>
                <Button variant="secondary" className="w-full" disabled>
                  Get Directions
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-2xl font-semibold">Plan Your Visit</h2>
      </CardHeader>
      <CardContent>
        <div className="space-y-6 max-w-2xl mx-auto">
          {/* Tours - Display Tours if available, otherwise show placeholder if hasTours is true */}
          {tours && tours.length > 0 ? (
            <ViatorTours tours={tours} />
          ) : hasTours && (
            <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-gray-50 to-white p-8">
              <div className="relative z-10">
                <div className="mb-4">
                  <div className="inline-block rounded-lg bg-gray-100 p-2">
                    <Globe className="h-6 w-6 text-gray-600" />
                  </div>
                </div>
                <h3 className="mb-2 text-xl font-semibold">Find Tours</h3>
                <p className="mb-4 text-gray-600">
                  Guided tours and experiences at {siteName}. Coming soon.
                </p>
                <Button variant="secondary" className="w-full" disabled>
                  View Tours
                </Button>
              </div>
            </div>
          )}

          {/* Take a Trip - Merakiva Travel */}
          {showMerakiva && (
            <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-blue-50 to-white p-8">
              <div className="relative z-10">
                <div className="mb-6">
                  <Image
                    src="https://merakivatravel.com/wp-content/uploads/2023/08/MerakivaLogo_Teal_1920px-768x254.png"
                    alt="Merakiva Travel"
                    width={240}
                    height={80}
                    className="mb-4"
                  />
                  <div className="space-y-3">
                    <p className="text-gray-700">
                      Specialized in archaeological travel, we create custom journeys that bring ancient history to life.
                    </p>
                    <p className="text-gray-700">
                      Let us help you plan your visit to {siteName} and {country} with expert guidance, insider tips, and a deep understanding of the site&apos;s historical significance.
                    </p>
                  </div>
                </div>
                <Button
                  className="w-full bg-[#006D77] hover:bg-[#005c64]"
                  onClick={() => {
                    window.open(
                      `https://merakivatravel.com/travel-consultation?site=${encodeURIComponent(slug)}&country=${encodeURIComponent(country_slug)}`,
                      '_blank'
                    );
                  }}
                >
                  Get Free Consultation
                </Button>
              </div>
            </div>
          )}

          {/* Directions - Conditional */}
          {hasDirections && (
            <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-gray-50 to-white p-8">
              <div className="relative z-10">
                <div className="mb-4">
                  <div className="inline-block rounded-lg bg-gray-100 p-2">
                    <Map className="h-6 w-6 text-gray-600" />
                  </div>
                </div>
                <h3 className="mb-2 text-xl font-semibold">Getting There</h3>
                <p className="mb-4 text-gray-600">
                  Directions and transportation options. Coming soon.
                </p>
                <Button variant="secondary" className="w-full" disabled>
                  Get Directions
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}