// src/app/sites/[country_slug]/[slug]/page.tsx

import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Home } from 'lucide-react'
import { Site } from '../../../../types/site'
import { Metadata } from 'next'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function generateMetadata(
  { params }: { params: { country_slug: string; slug: string } }
): Promise<Metadata> {
  const { data } = await supabase
    .from('sites')
    .select('name')
    .eq('country_slug', params.country_slug)
    .eq('slug', params.slug)
    .single()

  const siteName = data?.name || 'Archaeological Site'

  return {
    title: `${siteName} | Archaeolist`,
    description: `Explore ${siteName}, and other archaeological sites on Archaeolist's interactive map.`,
  }
}

export async function generateStaticParams() {
  console.log('Starting generateStaticParams');
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

    if (error) {
      console.error('Error fetching sites for static params:', error);
      break;
    }

    if (data) {
      allSites = [...allSites, ...data];
    }

    hasMore = data && data.length === pageSize;
    page++;
  }

  console.log(`Generated static params for ${allSites.length} sites`);

  // Filter out any sites without country_slug
  const validSites = allSites.filter(site => site.country_slug && site.slug);

  return validSites.map(({ country_slug, slug }) => ({
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

  return (
    <div className="flex flex-col min-h-[calc(100vh-theme(spacing.16))] bg-gray-50">
      <main className="flex-grow container mx-auto px-4 py-8 max-w-3xl">
        <Link 
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          To Map <Home className="h-4 w-4 ml-2" />
        </Link>
        <article className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6 sm:p-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{site.name}</h1>
            <p className="text-lg text-gray-700 mb-6">{site.description}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Details</h2>
                <p className="mb-1"><span className="font-medium">Country:</span> {site.country}</p>
                <p className="mb-1"><span className="font-medium">Address:</span> {site.address}</p>
                <p className="mb-1">
                  <span className="font-medium">Period:</span> {Array.isArray(site.period) ? site.period.join(', ') : site.period}
                </p>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Features</h2>
                <ul className="list-disc list-inside">
                  {Array.isArray(site.features) ? (
                    site.features.map((feature, index) => (
                      <li key={index} className="text-gray-700">{feature}</li>
                    ))
                  ) : (
                    <li className="text-gray-700">{site.features}</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </article>
      </main>
    </div>
  )
}