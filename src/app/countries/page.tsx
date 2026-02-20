import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Archaeological Sites by Country | Archaeolist',
  description: 'Browse archaeological sites and ancient ruins organized by country. Explore ancient history from Egypt to Peru, China to Greece, and every corner of the world.',
  alternates: {
    canonical: 'https://archaeolist.com/countries',
  },
  openGraph: {
    title: 'Archaeological Sites by Country | Archaeolist',
    description: 'Browse archaeological sites and ancient ruins organized by country. Explore ancient history from Egypt to Peru, China to Greece, and every corner of the world.',
    url: 'https://archaeolist.com/countries',
    type: 'website',
  },
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const revalidate = 3600;

export default async function AllCountriesPage() {
    // Fetch all country+slug rows in batches (no images column — avoids payload truncation)
    const countryMap = new Map<string, { name: string; slug: string; count: number }>();
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
        const { data, error } = await supabase
            .from('sites')
            .select('country, country_slug')
            .eq('archaeological_site_yn', true)
            .order('country')
            .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error || !data) break;

        data.forEach(site => {
            if (!site.country || !site.country_slug) return;
            if (!countryMap.has(site.country_slug)) {
                countryMap.set(site.country_slug, { name: site.country, slug: site.country_slug, count: 0 });
            }
            countryMap.get(site.country_slug)!.count++;
        });

        hasMore = data.length === pageSize;
        page++;
    }

    // Fetch one representative image per country (separate lightweight query)
    const slugs = Array.from(countryMap.keys());
    const imageMap = new Map<string, string>();

    // Fetch in chunks of 50 to stay within URL limits
    for (let i = 0; i < slugs.length; i += 50) {
        const chunk = slugs.slice(i, i + 50);
        const { data: imgData } = await supabase
            .from('sites')
            .select('country_slug, images')
            .eq('archaeological_site_yn', true)
            .in('country_slug', chunk)
            .not('images', 'is', null)
            .limit(chunk.length * 3); // a few rows per country is enough

        imgData?.forEach(site => {
            if (!imageMap.has(site.country_slug) && Array.isArray(site.images) && site.images.length > 0) {
                imageMap.set(site.country_slug, site.images[0].url);
            }
        });
    }

    const countries = Array.from(countryMap.values()).sort((a, b) => a.name.localeCompare(b.name));

    if (countries.length === 0) {
        return <div className="p-8 text-center">Failed to load countries.</div>;
    }

    return (
        <div className="bg-white min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">All Countries</h1>
                <p className="text-gray-500 mb-8">{countries.length} countries with archaeological sites</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {countries.map((country) => {
                        const image = imageMap.get(country.slug);
                        return (
                            <Link key={country.slug} href={`/sites/${country.slug}`} className="group relative block bg-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 h-64">
                                {image ? (
                                    <img
                                        src={image}
                                        alt={country.name}
                                        className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                                        <span className="text-gray-400">No Image</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                                    <h2 className="text-2xl font-bold text-white mb-1 group-hover:text-blue-300 transition-colors">
                                        {country.name}
                                    </h2>
                                    <p className="text-gray-300 text-sm">
                                        {country.count} {country.count === 1 ? 'Site' : 'Sites'}
                                    </p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    )
}
