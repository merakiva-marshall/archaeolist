// src/app/sites/[country_slug]/[slug]/page.tsx

import { createClient } from '@supabase/supabase-js'
import { permanentRedirect } from 'next/navigation'
import Link from 'next/link'
import { ExternalLink, MapPin } from 'lucide-react'
import { Site } from '../../../../types/site'
import { Metadata } from 'next'
import ImageGallery from '../../../../components/ImageGallery'
import SiteFeatures from '../../../../components/SiteFeatures'
import SitePeriods from '../../../../components/SitePeriods'
import SiteTimeline from '../../../../components/SiteTimeline'
import StructuredData from '../../../../components/StructuredData'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../../components/ui/card'
import { generateBaseMetadata } from '../../../../lib/metadata'
import ErrorBoundary from '../../../../components/ErrorBoundary'
import VisitSection from '../../../../components/VistSection'
import SiteFAQ from '../../../../components/SiteFAQ'
import RelatedSites from '../../../../components/RelatedSites'
import { ViatorTour } from '@/lib/viator/types';
import dynamic from 'next/dynamic'

const SingleSiteMap = dynamic(() => import('../../../../components/SingleSiteMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-100 animate-pulse rounded-xl" />
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)


export const revalidate = 86400; // Revalidate every 24 hours
// export const dynamic = 'force-dynamic';


export async function generateMetadata(
  { params }: { params: { country_slug: string; slug: string } }
): Promise<Metadata> {
  const { data } = await supabase
    .from('sites')
    .select('name, short_description, images, country')
    .eq('country_slug', params.country_slug)
    .eq('slug', params.slug)
    .eq('archaeological_site_yn', true)
    .single()

  if (!data) return generateBaseMetadata()

  const mainImage = data.images?.[0]?.url
  const title = `${data.name} | ${data.country} | ${process.env.NEXT_PUBLIC_SITE_NAME || 'Archaeolist'}`
  const canonicalUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/sites/${params.country_slug}/${params.slug}`

  return generateBaseMetadata({
    title,
    description: `${data.short_description || ''} Explore ${data.name} on the map and discover thousands of archaeological sites.`.trim(),
    path: `/sites/${params.country_slug}/${params.slug}`,
    image: mainImage,
    canonicalUrl // Add this to the parameters
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
      .eq('archaeological_site_yn', true)
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
  console.log('Fetching site data for:', params.country_slug, params.slug);
  const { data, error } = await supabase
    .from('sites_with_ref_count')
    .select(`
        id,
        name,
        description,
        location,
        country,
        country_slug,
        slug,
        address,
        images,
        wikipedia_url,
        is_unesco,
        short_description,
        processed_features,
        processed_periods,
        timeline,
        archaeological_site_yn,
        faqs,
        features,
        period,
        metadata
      `)
    .eq('country_slug', params.country_slug)
    .eq('slug', params.slug)
    .maybeSingle()

  if (error) {
    console.error('Supabase error:', error);
  }

  if (data && data.archaeological_site_yn === false) {
    permanentRedirect(`/sites/${params.country_slug}`);
  }

  if (!data) {
    console.log(`No data found for site: ${params.country_slug}/${params.slug}`);

    // Tier 1: Check if the site exists under a different country (Smart Redirect)
    const { data: movedSite } = await supabase
      .from('sites')
      .select('country_slug')
      .eq('slug', params.slug)
      .single();

    if (movedSite && movedSite.country_slug && movedSite.country_slug !== params.country_slug) {
      console.log(`Site moved! Redirecting to: /sites/${movedSite.country_slug}/${params.slug}`);
      permanentRedirect(`/sites/${movedSite.country_slug}/${params.slug}`);
    }

    // Tier 2: Site not found at all, redirect to the country/category page (Graceful Fallback)
    console.log(`Site gone. Redirecting to country page: /sites/${params.country_slug}`);
    permanentRedirect(`/sites/${params.country_slug}`);
  }

  // Fetch a pool of related sites from the same country
  // We fetch more than 6 to perform client-side filtering for relevance (time periods) and randomization
  const { data: relatedSitesData } = await supabase
    .from('sites')
    .select('name, slug, country_slug, short_description, images, processed_periods')
    .eq('country_slug', params.country_slug)
    .neq('slug', params.slug)
    .limit(60); // Retrieve a pool of candidates

  // Fetch Viator Tours
  const { data: toursData } = await supabase
    .from('viator_tours')
    .select('*')
    .eq('site_id', data.id)
    .order('review_count', { ascending: false }) // Fetch most popular first
    .limit(100); // Fetch a larger pool for client-side sorting

  const toursDataTyped = (toursData as ViatorTour[]) || [];


  // 1. Bayesian Score (Quality)
  const m = 10; // Threshold
  const C = 4.5; // Mean
  const calculateBayesianScore = (rating: number, reviewCount: number) => {
    // If no reviews, return C (4.5) but with low confidence implicit in the math if reviewCount was 0? 
    // Actually the formula handles 0: (0 + m*C) / (0 + m) = C = 4.5
    return (reviewCount * rating + m * C) / (reviewCount + m);
  };

  // 2. Generate Search Keywords (Relevance)
  const stopWords = ['the', 'a', 'an', 'of', 'in', 'at', 'archaeological', 'site', 'ruins', 'park', 'great', 'complex'];
  const siteKeywords = data.name.toLowerCase().split(' ')
    .filter((word: string) => !stopWords.includes(word) && word.length > 2);

  // 3. Process & Filter Tours
  const processedTours = toursDataTyped
    .filter(t => {
      // Price Filter - Remove strictly 0 or negative prices. Allow null (treat as 'on request' or unknown)
      if (t.price !== null && t.price !== undefined && t.price <= 0) return false;

      // Relevance Filter
      const titleLower = t.title.toLowerCase();
      // Only strict match if we have keywords, otherwise safe-allow (shouldn't happen for valid sites)
      if (siteKeywords.length > 0) {
        const hasKeyword = siteKeywords.some((k: string) => titleLower.includes(k));
        if (!hasKeyword) return false;
      }

      return true;
    })
    .map(t => {
      const bayesian = calculateBayesianScore(t.rating || 0, t.review_count || 0);
      // Price Penalty: -1 point for every $1000
      // If price is null, no penalty
      const penalty = (t.price || 0) / 1000;
      const finalScore = bayesian - penalty;

      return { ...t, finalScore, bayesian };
    });

  // 4. Sort by Final Score (Descending)
  processedTours.sort((a, b) => b.finalScore - a.finalScore);

  // 5. Slice Top 6
  const tours: ViatorTour[] = processedTours.slice(0, 6);

  // Debug logs
  console.log(`Site: ${data.name} | Keywords: ${siteKeywords.join(', ')}`);
  console.log('Top 3 Tours:', tours.slice(0, 3).map(t => ({
    title: t.title.substring(0, 30) + '...',
    rating: t.rating,
    reviews: t.review_count,
    price: t.price,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    bayesian: ((t as any).bayesian as number).toFixed(3),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    final: ((t as any).finalScore as number).toFixed(3)
  })));



  let relatedSites = relatedSitesData || [];

  // Logic: Prioritize sites with matching time periods, then randomize.
  if (relatedSites.length > 0) {
    const currentPeriods = Object.keys(data.processed_periods || {});

    // Calculate score based on period overlap
    const scoredSites = relatedSites.map(site => {
      const sitePeriods = Object.keys(site.processed_periods || {});
      // Count matching periods
      const overlap = currentPeriods.filter(p => sitePeriods.includes(p)).length;
      return { ...site, score: overlap };
    });

    // Sort by score (descending) and shuffle entries with the same score
    // This ensures we show relevant sites but vary them (not always the same top 6)
    scoredSites.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return Math.random() - 0.5; // Randomize ties
    });

    // Take the top 6
    relatedSites = scoredSites.slice(0, 6);
  }

  const site: Site = {
    ...data,
    // Handle PostGIS location object (GeoJSON) -> [lng, lat]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    location: (data.location as any)?.coordinates || data.location,
  } as Site;
  console.log('Raw FAQs:', site.faqs);
  const faqs = site.faqs?.faqs || [];
  console.log('Processed FAQs:', faqs);

  const timeline = site.timeline || {};
  const processedFeatures = site.processed_features || {};
  const processedPeriods = site.processed_periods || {};

  return (
    <>
      <ErrorBoundary>
        <StructuredData site={site} />
        <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
          <div className="container mx-auto px-4 py-8 pb-16 max-w-4xl">

            <article className="space-y-8">
              {/* Header Section with H1 */}
              <Card className="relative overflow-hidden">
                {/* Unified UNESCO Top Bar */}
                {site.is_unesco && (
                  <div className="w-full bg-[#0077D4] flex items-center justify-end pr-4 py-1.5">
                    <Link href="/sites/unesco" className="inline-block transition-opacity hover:opacity-90">
                      <img
                        src="https://www.unesco.org/themes/custom/bunesco8/assets/images/logo/logo.svg"
                        alt="UNESCO World Heritage Site"
                        className="h-[20px] md:h-[30px] w-auto brightness-0 invert"
                      />
                      <span className="sr-only">UNESCO World Heritage Site</span>
                    </Link>
                  </div>
                )}

                <CardHeader className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <Link
                      href={`/sites/${site.country_slug}`}
                      className="group inline-flex items-center space-x-2 text-lg font-bold text-blue-600 underline-offset-4 hover:underline mb-4"
                    >
                      <MapPin className="h-5 w-5" />
                      <span>{site.country}</span>
                    </Link>
                    <h1 className="text-3xl sm:text-4xl font-bold">{site.name}</h1>
                    {site.short_description && (
                      <p className="text-lg text-gray-600 mt-4 leading-relaxed">
                        {site.short_description}
                      </p>
                    )}
                  </div>
                </CardHeader>
              </Card>

              {/* Mobile Periods */}
              <div className="lg:hidden space-y-8">
                <SitePeriods periods={processedPeriods} headingLevel="h2" variant="mobile" />
                <div className="my-8">
                  <h2 className="text-2xl font-bold mb-4 px-2">Location</h2>
                  <div className="px-2"> {/* Extra padding for scroll safety */}
                    <SingleSiteMap site={site} className="h-64 w-full" />
                  </div>
                </div>
              </div>

              <div className="flex gap-8">
                <div className="flex-1 space-y-8">
                  {/* Description Section */}
                  <Card>
                    <CardHeader>
                      <h2 className="text-2xl font-semibold">About</h2>
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
                        <h2 className="text-2xl font-semibold">Gallery</h2>
                        <p className="text-sm text-muted-foreground">
                          Explore photographs of ancient structures, artifacts, and archaeological excavations at {site.name}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <ImageGallery site={site} />
                      </CardContent>
                    </Card>
                  )}

                  {/* Features Section */}
                  {processedFeatures && Object.keys(processedFeatures).length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Archaeological Features</CardTitle>
                        <CardDescription>
                          Explore the unique architectural and cultural elements found at this historical site
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <SiteFeatures features={processedFeatures} siteId={site.id} />
                      </CardContent>
                    </Card>
                  )}

                  {/* Timeline Section */}
                  {timeline && Object.keys(timeline).length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Historical Timeline</CardTitle>
                        <CardDescription>
                          Journey through time and discover key events in this site&apos;s archaeological history
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <SiteTimeline timeline={timeline} />
                      </CardContent>
                    </Card>
                  )}

                  {/* FAQ Section */}
                  {(() => {
                    console.log('Rendering FAQ section, faqs:', faqs);
                    console.log('faqs type:', typeof faqs);
                    console.log('faqs is array:', Array.isArray(faqs));
                    console.log('faqs length:', faqs?.length);
                    return faqs && Array.isArray(faqs) && faqs.length > 0 && (
                      <SiteFAQ faqs={faqs} />
                    );
                  })()}

                  {/* Visit Section */}
                  <VisitSection
                    siteName={site.name}
                    slug={site.slug}
                    country={site.country}
                    country_slug={site.country_slug}
                    hasTours={tours.length > 0}
                    hasDirections={false}
                    tours={tours}
                  />

                  {/* Details Section */}
                  <Card>
                    <CardHeader>
                      <h2 className="text-2xl font-semibold">Details</h2>
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

                  {/* Related Sites */}
                  {relatedSites.length > 0 && (
                    <RelatedSites sites={relatedSites} country={site.country} />
                  )}

                </div>

                {/* Desktop Periods */}
                <div className="hidden lg:block w-72">
                  <div className="sticky top-24">
                    <SitePeriods
                      periods={processedPeriods}
                      isFloating={true}
                      headingLevel="h2"
                      variant="desktop"
                    />
                    <div className="mt-8">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Location</h3>
                      <SingleSiteMap site={site} className="h-64 w-full" />
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </ErrorBoundary>
    </>
  );
}
