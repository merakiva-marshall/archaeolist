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
  } catch (error) {
    console.error('Error checking location:', error);
    return false; // Fail safe to hidden if strict restriction desired
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
}



export default function VisitSection({
  siteName,
  slug,
  country,
  country_slug,
  hasTours = false,
  hasDirections = false,
  tours = []
}: VisitSectionProps) {
  const [showMerakiva, setShowMerakiva] = useState(false);

  useEffect(() => {
    isAllowedCountry().then(setShowMerakiva);
  }, []);

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
                    unoptimized
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