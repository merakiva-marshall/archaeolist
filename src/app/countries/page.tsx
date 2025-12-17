
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

// Wait, this is app/countries/page.tsx, components are in ../../components ? No, src/components
// app is src/app. so ../../components is correct.
// But check layout.tsx, Header is usually in layout. I should not add Header here if it's in layout.
// layout.tsx has Header and Footer. So I don't need to add them here.

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Add revalidation to ensure data is fresh but cached for performance
export const revalidate = 3600;

export default async function AllCountriesPage() {
    const { data: sites } = await supabase
        .from('sites')
        .select('country, country_slug, images')
        .order('country');

    if (!sites) {
        return <div className="p-8 text-center">Failed to load countries.</div>;
    }

    // Aggregate countries
    const countryMap = new Map<string, {
        name: string,
        slug: string,
        count: number,
        image?: string
    }>();

    sites.forEach(site => {
        if (!countryMap.has(site.country)) {
            countryMap.set(site.country, {
                name: site.country,
                slug: site.country_slug,
                count: 0,
                // Use the first image found for the country thumbnail if available
                image: site.images && Array.isArray(site.images) && site.images.length > 0 ? site.images[0].url : undefined
            });
        }
        const country = countryMap.get(site.country)!;
        country.count++;
        if (!country.image && site.images && Array.isArray(site.images) && site.images.length > 0) {
            country.image = site.images[0].url;
        }
    });

    const countries = Array.from(countryMap.values()).sort((a, b) => a.name.localeCompare(b.name));

    return (
        <div className="bg-white min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-8">All Countries</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {countries.map((country) => (
                        <Link key={country.slug} href={`/sites/${country.slug}`} className="group relative block bg-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 h-64">
                            {country.image ? (
                                <img
                                    src={country.image}
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
                    ))}
                </div>
            </div>
        </div>
    )
}
