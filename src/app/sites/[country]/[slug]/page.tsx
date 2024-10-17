// src/app/sites/[country]/[slug]/page.tsx

import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Site } from '../../../../types/site'
import { Metadata, ResolvingMetadata } from 'next'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function generateMetadata(
  { params }: { params: { country: string; slug: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { data } = await supabase
    .from('sites')
    .select('name')
    .eq('country', params.country)
    .eq('slug', params.slug)
    .single()

  const siteName = data?.name || 'Archaeological Site'

  return {
    title: `${siteName} | Archaeolist`,
    description: `Explore ${siteName}, on Archaeolist.com`,
  }
}

export async function generateStaticParams() {
  const { data: sites } = await supabase
    .from('sites')
    .select('country, slug')
  
  return sites?.map(({ country, slug }) => ({
    country,
    slug,
  })) || []
}

export default async function Page({ params }: { params: { country: string; slug: string } }) {
  const { data } = await supabase
    .from('sites')
    .select('*')
    .eq('country', params.country)
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
          Back to Map
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