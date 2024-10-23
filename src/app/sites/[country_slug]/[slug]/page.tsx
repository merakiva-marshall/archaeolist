// src/app/sites/[country_slug]/[slug]/page.tsx

import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Home } from 'lucide-react'
import { Site } from '../../../../types/site'
import { Metadata } from 'next'
import ImageGallery from '../../../../components/ImageGallery'


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const revalidate = 0;  // Add this at the top level of the file

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
    <main className="relative min-h-[calc(100vh-4rem)] bg-gray-50"> {/* Adjust for header height */}
      <div className="absolute inset-0 overflow-y-auto">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Link 
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Map <Home className="h-4 w-4 ml-2" />
          </Link>
          
          <article className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
            <div className="p-6 sm:p-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                {site.name}
              </h1>
              
              <div className="prose max-w-none mb-8">
                <p className="text-lg text-gray-700">{site.description}</p>
              </div>
              
              <div className="mb-8">
                <ImageGallery site={site} />
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Details</h2>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <dt className="font-medium text-gray-600">Country</dt>
                      <dd className="mt-1">{site.country}</dd>
                    </div>
                    {site.address && (
                      <div>
                        <dt className="font-medium text-gray-600">Address</dt>
                        <dd className="mt-1">{site.address}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </main>
  );
}