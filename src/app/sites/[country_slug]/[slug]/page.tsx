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
    .eq('archaeological_site_yn', true)
    .neq('slug', params.slug)
    .limit(15); // Retrieve a pool of candidates

  // Fetch Viator Tours — ordered by relevance_score (attraction-matched first), then review_count
  const { data: toursData } = await supabase
    .from('viator_tours')
    .select('tour_id, site_id, title, description, price, currency, url, image_url, rating, review_count, relevance_score')
    .eq('site_id', data.id)
    .order('relevance_score', { ascending: false })
    .order('review_count', { ascending: false })
    .limit(6);

  // Bayesian tiebreaker for tours with identical relevance_score
  const m = 10;
  const C = 4.5;
  const bayesian = (rating: number, reviewCount: number) =>
    (reviewCount * rating + m * C) / (reviewCount + m);

  const tours: ViatorTour[] = (toursData as ViatorTour[] || [])
    .filter(t => t.price === null || t.price === undefined || t.price > 0)
    .sort((a, b) => {
      if (b.relevance_score !== a.relevance_score) return (b.relevance_score ?? 0) - (a.relevance_score ?? 0);
      return bayesian(b.rating || 0, b.review_count || 0) - bayesian(a.rating || 0, a.review_count || 0);
    })
    .slice(0, 6);

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
  // DB stores faqs as a plain array; the FAQData wrapper type was aspirational.
  // Handle both shapes: raw array and { faqs: [...] } object.
  const rawFaqs = site.faqs;
  const faqs: import('@/types/site').FAQ[] = Array.isArray(rawFaqs)
    ? rawFaqs
    : Array.isArray((rawFaqs as { faqs?: unknown })?.faqs)
      ? (rawFaqs as { faqs: import('@/types/site').FAQ[] }).faqs
      : [];

  const timeline = site.timeline || {};
  const processedFeatures = site.processed_features || {};
  const processedPeriods = site.processed_periods || {};

  // Get the main image for hero background
  const heroImage = site.images?.[0]?.url;

  return (
    <>
      <ErrorBoundary>
        <StructuredData site={site} />

        {/* UNESCO Banner (conditional) */}
        {site.is_unesco && (
          <div className="w-full bg-unesco-blue flex items-center justify-center sm:justify-end px-6 py-2.5 sticky top-[64px] z-40">
            <Link
              href="/sites/unesco"
              className="flex items-center gap-3 opacity-90 hover:opacity-100 transition-opacity"
            >
              <span className="text-white text-[11px] font-label font-semibold uppercase tracking-widest hidden sm:inline">
                UNESCO World Heritage Site
              </span>
              <img
                src="https://www.unesco.org/themes/custom/bunesco8/assets/images/logo/logo.svg"
                alt="UNESCO World Heritage Site"
                className="h-[28px] w-auto brightness-0 invert"
              />
              <span className="text-white text-[11px] font-label font-semibold uppercase tracking-widest sm:hidden">
                UNESCO Heritage
              </span>
            </Link>
          </div>
        )}

        {/* Hero Section */}
        <section className={`relative flex items-end overflow-hidden ${heroImage ? 'h-[520px]' : 'h-[260px]'}`}>
          <div className="absolute inset-0 z-0">
            {heroImage ? (
              <>
                <img
                  alt={site.name}
                  className="w-full h-full object-cover"
                  style={{ filter: 'grayscale(60%) contrast(1.1)', opacity: 0.45 }}
                  src={heroImage}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(to top, #fbf9f8 0%, rgba(251,249,248,0.6) 40%, rgba(251,249,248,0.1) 70%, rgba(251,249,248,0) 100%)'
                  }}
                />
              </>
            ) : (
              <div
                className="w-full h-full"
                style={{
                  background: 'linear-gradient(135deg, #e8eef5 0%, #d5dde8 50%, #c5d0df 100%)'
                }}
              />
            )}
          </div>
          <div className="relative z-10 max-w-5xl px-8 pb-12">
            <Link
              href={`/sites/${site.country_slug}`}
              className="text-primary-brand font-headline text-sm font-semibold hover:underline underline-offset-4 flex items-center gap-1.5 mb-4"
            >
              <MapPin className="h-3.5 w-3.5" />
              {site.country}
            </Link>
            <h1 className="text-5xl md:text-7xl font-black text-primary-brand font-headline tracking-tighter leading-[0.95] mb-5">
              {site.name}
            </h1>
            {site.short_description && (
              <p className="text-lg md:text-xl font-body text-on-surface-variant max-w-2xl leading-relaxed italic">
                {site.short_description}
              </p>
            )}
          </div>
        </section>

        {/* Map Section */}
        <section className="py-16 px-8 bg-surface">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
              <div>
                <span className="text-xs font-headline font-bold uppercase tracking-[0.2em] text-primary-brand">
                  Location
                </span>
                <h2 className="text-3xl font-headline font-black text-primary-brand tracking-tight mt-1">
                  Explore the Map
                </h2>
              </div>
            </div>
            <div className="relative w-full bg-surface-container rounded-2xl overflow-hidden shadow-xl aspect-[4/3] md:aspect-[16/7]">
              <SingleSiteMap site={site} className="h-full w-full" />
              <div className="hidden md:block absolute bottom-6 left-6 p-5 bg-surface/75 backdrop-blur-2xl rounded-2xl border border-white/30 max-w-xs shadow-lg">
                <h3 className="font-headline font-bold text-primary-brand text-sm mb-1 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-secondary-brand rounded-full"></span>
                  {site.name}
                </h3>
                <p className="text-xs font-label text-on-surface-variant leading-relaxed">
                  {site.location?.[1]?.toFixed(4)}° N, {site.location?.[0]?.toFixed(4)}° E
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* About + Time Periods */}
        <section className="px-8 py-16 bg-surface-container-low">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8">
              <span className="text-xs font-headline font-bold uppercase tracking-[0.2em] text-primary-brand">
                Historical Context
              </span>
              <h2 className="text-3xl font-headline font-black text-primary-brand tracking-tight mt-1 mb-6">
                About
              </h2>
              <div className="space-y-5 text-base font-body text-on-surface leading-loose">
                <p>{site.description}</p>
              </div>
            </div>

            {/* Time Periods Sidebar */}
            <div className="lg:col-span-4">
              <SitePeriods
                periods={processedPeriods}
                headingLevel="h3"
                variant="redesign"
              />
            </div>
          </div>
        </section>

        {/* Image Gallery */}
        {site.images && site.images.length > 0 && (
          <section className="px-8 py-16 bg-surface">
            <div className="max-w-6xl mx-auto">
              <span className="text-xs font-headline font-bold uppercase tracking-[0.2em] text-primary-brand">
                Visual Archive
              </span>
              <h2 className="text-3xl font-headline font-black text-primary-brand tracking-tight mt-1 mb-2">
                Gallery
              </h2>
              <p className="text-sm text-on-surface-variant font-label mb-8">
                Explore photographs of ancient structures, artifacts, and archaeological excavations
              </p>
              <ImageGallery site={site} variant="redesign" />
            </div>
          </section>
        )}

        {/* Historical Timeline */}
        {timeline && Object.keys(timeline).length > 0 && (
          <section className="py-16 px-8 bg-surface-container-low overflow-hidden">
            <div className="max-w-6xl mx-auto">
              <span className="text-xs font-headline font-bold uppercase tracking-[0.2em] text-primary-brand">
                Temporal Epochs
              </span>
              <h2 className="text-3xl font-headline font-black text-primary-brand tracking-tight mt-1 mb-2">
                Historical Timeline
              </h2>
              <p className="text-sm text-on-surface-variant font-label mb-10">
                Journey through time and discover key events in this site&apos;s history
              </p>
              <SiteTimeline timeline={timeline} variant="redesign" />
            </div>
          </section>
        )}

        {/* Archaeological Features */}
        {processedFeatures && Object.keys(processedFeatures).length > 0 && (
          <section className="px-8 py-16 bg-surface">
            <div className="max-w-6xl mx-auto">
              <span className="text-xs font-headline font-bold uppercase tracking-[0.2em] text-primary-brand">
                Classification
              </span>
              <h2 className="text-3xl font-headline font-black text-primary-brand tracking-tight mt-1 mb-2">
                Archaeological Features
              </h2>
              <p className="text-sm text-on-surface-variant font-label mb-8">
                Unique architectural and cultural elements found at this historical site
              </p>
              <SiteFeatures features={processedFeatures} siteId={site.id} variant="redesign" />
            </div>
          </section>
        )}

        {/* FAQ Section */}
        {faqs.length > 0 && (
          <section className="px-8 py-16 bg-surface-container-low">
            <div className="max-w-6xl mx-auto">
              <span className="text-xs font-headline font-bold uppercase tracking-[0.2em] text-primary-brand">
                Knowledge Base
              </span>
              <h2 className="text-3xl font-headline font-black text-primary-brand tracking-tight mt-1 mb-8">
                Frequently Asked Questions
              </h2>
              <SiteFAQ faqs={faqs} variant="redesign" />
            </div>
          </section>
        )}

        {/* Plan Your Visit */}
        <section className="px-8 py-16 bg-surface">
          <div className="max-w-6xl mx-auto">
            <span className="text-xs font-headline font-bold uppercase tracking-[0.2em] text-primary-brand">
              Explore
            </span>
            <h2 className="text-3xl font-headline font-black text-primary-brand tracking-tight mt-1 mb-2">
              Plan Your Visit
            </h2>
            <p className="text-sm text-on-surface-variant font-label mb-8">
              Tours, travel arrangements, and practical information
            </p>
            <VisitSection
              siteName={site.name}
              slug={site.slug}
              country={site.country}
              country_slug={site.country_slug}
              hasTours={tours.length > 0}
              hasDirections={false}
              tours={tours}
              variant="redesign"
            />
          </div>
        </section>

        {/* Details Section */}
        <section className="px-8 py-16 bg-surface-container-low">
          <div className="max-w-6xl mx-auto">
            <span className="text-xs font-headline font-bold uppercase tracking-[0.2em] text-primary-brand">
              Reference
            </span>
            <h2 className="text-3xl font-headline font-black text-primary-brand tracking-tight mt-1 mb-8">
              Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/20">
                <span className="text-xs font-label uppercase tracking-widest text-outline">Country</span>
                <p className="font-headline font-semibold text-on-surface mt-1">{site.country}</p>
              </div>
              {site.wikipedia_url && (
                <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/20">
                  <span className="text-xs font-label uppercase tracking-widest text-outline">Source</span>
                  <a
                    href={site.wikipedia_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-headline font-semibold text-primary-brand mt-1 flex items-center gap-1 hover:underline"
                  >
                    Wikipedia <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              )}
              {site.location && (
                <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/20">
                  <span className="text-xs font-label uppercase tracking-widest text-outline">Coordinates</span>
                  <p className="font-headline font-semibold text-on-surface mt-1">
                    {site.location[1]?.toFixed(2)}° N, {site.location[0]?.toFixed(2)}° E
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Related Sites */}
        {relatedSites.length > 0 && (
          <section className="px-8 py-16 bg-surface">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <span className="text-xs font-headline font-bold uppercase tracking-[0.2em] text-primary-brand">
                    Discover More
                  </span>
                  <h2 className="text-3xl font-headline font-black text-primary-brand tracking-tight mt-1">
                    More Sites in {site.country}
                  </h2>
                </div>
                <Link
                  href={`/sites/${site.country_slug}`}
                  className="text-sm font-headline font-semibold text-primary-brand hover:underline underline-offset-4"
                >
                  View all →
                </Link>
              </div>
              <RelatedSites sites={relatedSites} country={site.country} variant="redesign" />
            </div>
          </section>
        )}

      </ErrorBoundary>
    </>
  );
}
