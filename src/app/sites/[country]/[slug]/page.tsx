import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import { Site } from '../../../../types/site'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function generateStaticParams() {
  const { data: sites } = await supabase
    .from('sites')
    .select('country, slug')
  
  console.log('Sites for static generation:', sites)

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
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{site.name}</h1>
      <p className="mb-4">{site.description}</p>
      <p className="mb-2"><strong>Country:</strong> {site.country}</p>
      <p className="mb-2"><strong>Address:</strong> {site.address}</p>
      <p className="mb-2"><strong>Period:</strong> {Array.isArray(site.period) ? site.period.join(', ') : site.period}</p>
      <p className="mb-2"><strong>Features:</strong> {Array.isArray(site.features) ? site.features.join(', ') : site.features}</p>
    </div>
  )
}