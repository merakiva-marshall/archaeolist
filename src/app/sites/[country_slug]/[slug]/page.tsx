// src/app/sites/[country_slug]/[slug]/page.tsx

import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Home, ExternalLink, MapPin } from 'lucide-react'
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
    .single()

  if (error) {
    console.error('Supabase error:', error);
  }

  if (!data) {
    console.log('No data found');
    notFound()
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
  const { data: toursData, error: toursError } = await supabase
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
    bayesian: (t as any).bayesian.toFixed(3),
    final: (t as any).finalScore.toFixed(3)
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

  console.log('Raw site data:', data);
  const site: Site = data as Site;
  console.log('Site object:', site);
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
        <main className="min-h-[calc(100vh-4rem)] bg-gray-50">
          <div className="container mx-auto px-4 py-8 pb-16 max-w-4xl">
            <Link
              href="/"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Map <Home className="h-4 w-4 ml-2" />
            </Link>

            <article className="space-y-8">
              {/* Header Section with H1 */}
              <Card>
                <CardHeader>
                  <Link
                    href={`/sites/${site.country_slug}`}
                    className="group inline-flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600 mb-4"
                  >
                    <MapPin className="h-4 w-4" />
                    <span className="font-medium">{site.country}</span>
                  </Link>
                  <h1 className="text-3xl sm:text-4xl font-bold">{site.name}</h1>
                  {site.short_description && (
                    <p className="text-lg text-gray-600 mt-4 leading-relaxed">
                      {site.short_description}
                    </p>
                  )}
                </CardHeader>
              </Card>

              {/* Mobile Periods */}
              <div className="lg:hidden">
                <SitePeriods periods={processedPeriods} headingLevel="h2" />
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
                <div className="hidden lg:block w-48">
                  <div className="sticky top-8">
                    <SitePeriods
                      periods={processedPeriods}
                      isFloating={true}
                      headingLevel="h2"
                    />
                  </div>
                </div>
              </div>
            </article>
          </div>
        </main>
      </ErrorBoundary>
    </>
  );
}
