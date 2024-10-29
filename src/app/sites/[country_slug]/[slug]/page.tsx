// src/app/sites/[country_slug]/[slug]/page.tsx

import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Home, ExternalLink } from 'lucide-react'
import { Site } from '../../../../types/site'
import { Metadata } from 'next'
import ImageGallery from '../../../../components/ImageGallery'
import SiteFeatures from '../../../../components/SiteFeatures'
import SitePeriods from '../../../../components/SitePeriods'
import SiteTimeline from '../../../../components/SiteTimeline'
import StructuredData from '../../../../components/StructuredData'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card'
import { generateBaseMetadata } from '../../../../lib/metadata'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const revalidate = 0;

export async function generateMetadata(
  { params }: { params: { country_slug: string; slug: string } }
): Promise<Metadata> {
  const { data } = await supabase
    .from('sites')
    .select('name, short_description, images')
    .eq('country_slug', params.country_slug)
    .eq('slug', params.slug)
    .single()

  if (!data) return generateBaseMetadata()

  const mainImage = data.images?.[0]?.url

  return generateBaseMetadata({
    title: data.name,
    description: data.short_description,
    path: `/sites/${params.country_slug}/${params.slug}`,
    image: mainImage
  })
}

export async function generateStaticParams() {
  let allSites: Pick<Site, 'country_slug' | 'slug'>[] = [];
  let page = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('sites')
      .select('country_slug, slug')
      .range(page * pageSize, (page + 1) * pageSize - 1)
      .order('id', { ascending: true });

    if (error) break;
    if (data) allSites = [...allSites, ...data];
    hasMore = data && data.length === pageSize;
    page++;
  }

  return allSites
    .filter(site => site.country_slug && site.slug)
    .map(({ country_slug, slug }) => ({
      country_slug,
      slug,
    }));
}

export default async function Page({ params }: { params: { country_slug: string; slug: string } }) {
  const { data } = await supabase
    .from('sites')
    .select('*')
    .eq('country_slug', params.country_slug)
    .eq('slug', params.slug)
    .single()

  if (!data) {
    notFound()
  }

  const site: Site = data as Site;

  // Ensure we have valid objects even if the properties are undefined
  const timeline = site.timeline || {};
  const processedFeatures = site.processed_features || {};
  const processedPeriods = site.processed_periods || {};

  return (
    <>
      <StructuredData site={site} />
      <main className="relative min-h-[calc(100vh-4rem)] bg-gray-50">
      <div className="absolute inset-0 overflow-y-auto">
        <div className="container mx-auto px-4 py-8 pb-16 max-w-4xl">
          <Link 
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Map <Home className="h-4 w-4 ml-2" />
          </Link>
          
          <article className="space-y-8">
            {/* Header Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl sm:text-4xl">{site.name}</CardTitle>
                {site.short_description && (
                  <p className="text-lg text-gray-600 mt-4 leading-relaxed">{site.short_description}</p>
                )}
              </CardHeader>
            </Card>

            {/* Mobile Periods */}
            <div className="lg:hidden">
              <SitePeriods periods={processedPeriods} />
            </div>

            <div className="flex gap-8">
              <div className="flex-1 space-y-8">
                {/* Description Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <p className="text-gray-700">{site.description}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Image Gallery */}
                {site.images && site.images.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl">Gallery</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ImageGallery site={site} />
                    </CardContent>
                  </Card>
                )}

                {/* Features Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">Site Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SiteFeatures 
                      features={processedFeatures}
                      siteId={site.id}
                    />
                  </CardContent>
                </Card>

                {/* Timeline Section */}
                {Object.keys(timeline).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl">Site Timeline</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <SiteTimeline timeline={timeline} />
                    </CardContent>
                  </Card>
                )}

                {/* Details Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <dt className="font-medium text-gray-600">Country</dt>
                        <dd className="mt-1">{site.country}</dd>
                      </div>
                      {site.wikipedia_url && (
                        <div>
                          <dt className="font-medium text-gray-600">Source</dt>
                          <dd className="mt-1">
                            <a 
                              href={site.wikipedia_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 inline-flex items-center"
                            >
                              Wikipedia
                              <ExternalLink className="h-4 w-4 ml-1" />
                            </a>
                          </dd>
                        </div>
                      )}
                    </dl>
                  </CardContent>
                </Card>
              </div>

              {/* Desktop Periods */}
              <div className="hidden lg:block w-48">
                <div className="sticky top-8">
                  <SitePeriods 
                    periods={processedPeriods}
                    isFloating={true}
                  />
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
      </main>
    </>
  );
}