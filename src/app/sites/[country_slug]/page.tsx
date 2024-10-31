// src/app/sites/[country_slug]/page.tsx

import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { Database } from '../../../types/supabase'
import { generateBaseMetadata } from '../../../lib/metadata'
import SiteGrid from '../../../components/SiteGrid'
import StructuredData from '../../../components/StructuredData'
import ErrorBoundary from '../../../components/ErrorBoundary'
import { Card, CardContent } from '../../../components/ui/card'
import { Building2, MapPin, Award } from 'lucide-react'
import Link from 'next/link'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const revalidate = 0;

interface CountryInfo {
  country: string;
  site_count: number;
  earliest_site?: string;
  unesco_count: number;
}

interface PageParams {
  params: {
    country_slug: string;
  };
}

async function getCountryInfo(country_slug: string): Promise<CountryInfo | null> {
  const { data: sites, error } = await supabase
    .from('sites')
    .select('country, is_unesco, processed_periods')
    .eq('country_slug', country_slug);

  if (error || !sites.length) return null;

  return {
    country: sites[0].country,
    site_count: sites.length,
    unesco_count: sites.filter(site => site.is_unesco).length,
  };
}

export async function generateMetadata(
    { params }: PageParams
  ): Promise<Metadata> {
    const countryInfo = await getCountryInfo(params.country_slug);
    if (!countryInfo) return generateBaseMetadata();
  
    return generateBaseMetadata({
      title: `${countryInfo.country} Archaeological Sites | Archaeolist`,
      description: `Explore ${countryInfo.site_count} archaeological sites and ruins in ${
        countryInfo.country
      }, including ${countryInfo.unesco_count} UNESCO World Heritage sites. Discover ancient history, plan your visits, and find detailed information about historical landmarks and archaeological treasures.`,
      path: `/sites/${params.country_slug}`,
      keywords: [
        `${countryInfo.country} archaeological sites`,
        `${countryInfo.country} ancient ruins`,
        `${countryInfo.country} historical sites`,
        `${countryInfo.country} UNESCO sites`,
        'archaeological sites',
        'ancient ruins',
        'historical landmarks',
        'archaeological tourism',
        'cultural heritage',
        'historical places'
      ].join(', '),
      additionalOpenGraph: {
        type: 'website',
        locale: 'en_US'
      }
    });
  }

export async function generateStaticParams() {
  const { data: countries } = await supabase
    .from('sites')
    .select('country_slug')
    .eq('country_slug', 'country_slug')
    .limit(1);

  return (countries || []).map(({ country_slug }) => ({
    country_slug,
  }));
}

export default async function CountryPage({ params }: PageParams) {
    const countryInfo = await getCountryInfo(params.country_slug);
  
    if (!countryInfo) {
      notFound();
    }
  
    return (
        <>
          <ErrorBoundary>
            <StructuredData countryInfo={countryInfo} />
            <main className="flex-1 relative w-full h-full overflow-y-auto">
              <div className="min-h-screen bg-gray-50">
                <div className="container mx-auto px-4 py-8">
              {/* Header Section */}
              <div className="space-y-6 mb-8">
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-800 via-blue-700 to-indigo-800 text-white p-8">
                  <div className="relative z-10">
                    <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                      {countryInfo.country}
                    </h1>
                    <p className="text-xl text-white max-w-3xl font-medium">
                      Discover the rich archaeological heritage of {countryInfo.country}, featuring ancient ruins, 
                      historical landmarks, and cultural treasures spanning millennia of human history.
                    </p>
                  </div>
                  {/* Add subtle overlay pattern */}
                  <div className="absolute inset-0 bg-black/10" 
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='0.05' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                  />
                </div>
  
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Building2 className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{countryInfo.site_count}</div>
                          <div className="text-sm text-gray-600">Archaeological Sites</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-amber-100 rounded-lg">
                          <Award className="h-6 w-6 text-amber-600" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{countryInfo.unesco_count}</div>
                          <div className="text-sm text-gray-600">UNESCO World Heritage Sites</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
  
                  <Link href="/">
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <MapPin className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <div className="text-2xl font-bold">Interactive Map</div>
                            <div className="text-sm text-gray-600">& Detailed Guides</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              </div>
  
              {/* Sites Grid */}
              <SiteGrid countrySlug={params.country_slug} />
              </div>
        </div>
      </main>
    </ErrorBoundary>
  </>
);
  }