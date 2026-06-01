// src/app/sites/[country_slug]/page.tsx

import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { Suspense } from 'react'
import { Database } from '../../../types/supabase'
import { generateBaseMetadata } from '../../../lib/metadata'
import SiteGrid from '../../../components/SiteGrid'
import { Site } from '../../../types/site'
import StructuredData from '../../../components/StructuredData'
import ErrorBoundary from '../../../components/ErrorBoundary'
import { Building2, Award } from 'lucide-react'
import countryRedirects from '../../../data/country-redirects.json'
import dynamic from 'next/dynamic'

const CountryMap = dynamic(() => import('../../../components/CountryMap'), {
  ssr: false,
  loading: () => <div className="w-full h-[400px] bg-surface-container animate-pulse rounded-2xl" />
})

const NON_COUNTRY_SLUGS = new Set(
  countryRedirects.redirects.map((r: { old_country_slug: string }) => r.old_country_slug)
)

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const revalidate = 86400;

interface CountryInfo {
  country: string;
  country_slug: string;
  site_count: number;
  earliest_site?: string;
  unesco_count: number;
  sites: Site[]; // add this
}

interface PageParams {
  params: {
    country_slug: string;
  };
}

async function getCountryInfo(country_slug: string): Promise<CountryInfo | null> {
  const { data: sites, error } = await supabase
    .from('sites')
    .select('id, name, slug, country_slug, short_description, images, is_unesco, location, country, archaeological_site_yn, featured, featured_score')
    .eq('country_slug', country_slug)
    .eq('archaeological_site_yn', true)
    .order('featured', { ascending: false, nullsFirst: false })
    .order('featured_score', { ascending: false, nullsFirst: false });

  const countrySites = sites as unknown as Site[];

  if (error || !countrySites || !countrySites.length) return null;

  // Supabase returns PostGIS geography as {type, coordinates} — extract the array
  const normalizedSites = countrySites.map(site => ({
    ...site,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    location: (site.location as any)?.coordinates ?? site.location,
  }));

  return {
    country: normalizedSites[0].country,
    country_slug: normalizedSites[0].country_slug,
    site_count: normalizedSites.length,
    unesco_count: normalizedSites.filter(site => site.is_unesco).length,
    sites: normalizedSites
  };
}

export async function generateMetadata(
  { params }: PageParams
): Promise<Metadata> {
  const countryInfo = await getCountryInfo(params.country_slug);
  if (!countryInfo) return generateBaseMetadata();

  return generateBaseMetadata({
    title: `${countryInfo.country} Archaeological Sites | Archaeolist`,
    description: `Explore ${countryInfo.site_count} archaeological sites and ruins in ${countryInfo.country}, including ${countryInfo.unesco_count} UNESCO World Heritage sites. Discover ancient history, plan your visits, and find detailed information about historical landmarks and archaeological treasures.`,
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

interface CountrySlugRow {
  country_slug: string;
}
export async function generateStaticParams() {
  const { data } = await supabase
    .from('sites')
    .select<'country_slug', CountrySlugRow>('country_slug')
    .eq('archaeological_site_yn', true);

  const uniqueSlugs = Array.from(
    new Set(data?.map(row => row.country_slug))
  ).filter(slug => !NON_COUNTRY_SLUGS.has(slug));

  return uniqueSlugs.map((slug: string) => ({
    country_slug: slug
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
        <div className="min-h-screen bg-surface">

          {/* Hero Header */}
          <div className="bg-surface border-b border-outline-variant px-8 pt-10 pb-8">
            <div className="max-w-6xl mx-auto">
              <span className="text-xs font-headline font-bold uppercase tracking-[0.2em] text-primary-brand">Archaeological Heritage</span>
              <h1 className="text-5xl md:text-6xl font-black text-primary-brand font-headline tracking-tighter leading-[0.95] mt-1">
                Explore {countryInfo.country}
              </h1>
            </div>
          </div>

          {/* Country Map + Stats */}
          <section className="px-8 py-12 bg-surface-container-low border-b border-outline-variant">
            <div className="max-w-6xl mx-auto">
              <div className="bg-surface-container rounded-2xl overflow-hidden shadow-xl">
                <CountryMap
                  sites={countryInfo.sites}
                  className="w-full h-[420px]"
                />
                <div className="flex flex-wrap gap-6 px-6 py-5 border-t border-outline-variant">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-surface-container-low rounded-lg text-primary-brand">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-2xl font-headline font-black text-primary-brand leading-none">{countryInfo.site_count}</div>
                      <div className="text-xs font-label text-on-surface-variant mt-0.5">Archaeological Sites</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-surface-container-low rounded-lg text-primary-brand">
                      <Award className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-2xl font-headline font-black text-primary-brand leading-none">{countryInfo.unesco_count}</div>
                      <div className="text-xs font-label text-on-surface-variant mt-0.5">UNESCO World Heritage Sites</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Sites Grid */}
          <section className="px-8 py-16 bg-surface">
            <div className="max-w-6xl mx-auto">
              <span className="text-xs font-headline font-bold uppercase tracking-[0.2em] text-primary-brand">Explore</span>
              <h2 className="text-3xl font-headline font-black text-primary-brand tracking-tight mt-1 mb-8">
                All Sites in {countryInfo.country}
              </h2>
              <Suspense fallback={
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => <div key={i} className="h-64 bg-surface-container rounded-2xl animate-pulse" />)}
                </div>
              }>
                <SiteGrid
                  countrySlug={params.country_slug}
                  initialSites={countryInfo.sites}
                />
              </Suspense>
            </div>
          </section>

        </div>
      </ErrorBoundary>
    </>
  );
}