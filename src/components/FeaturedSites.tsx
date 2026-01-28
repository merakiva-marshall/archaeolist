
import { Site } from '../types/site'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import Image from 'next/image'

// Helper to truncate text
const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function FeaturedSites() {
    let featuredSites: Site[] = [];

    try {
        const { data } = await supabase
            .from('sites')
            .select('*, images')
            .eq('featured', true)
            .limit(5);

        if (data && data.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            featuredSites = data.map((site: any) => ({
                ...site,
                location: site.location?.coordinates || site.location
            }));
        } else {
            // Fallback: fetch 4 random UNESCO sites.
            const { data: fallbackData } = await supabase
                .from('sites')
                .select('*, images')
                .eq('is_unesco', true)
                .limit(4);

            if (fallbackData) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                featuredSites = fallbackData.map((site: any) => ({
                    ...site,
                    location: site.location?.coordinates || site.location
                }));
            }
        }
    } catch (err) {
        console.error("Error loading featured sites:", err);
    }

    if (featuredSites.length === 0) return null;

    return (
        <section className="py-12 bg-white relative shadow-sm border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Sites</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {featuredSites.slice(0, 4).map((site) => (
                        <Link
                            key={site.id}
                            href={`/sites/${site.country_slug}/${site.slug}`}
                            className="group block bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col h-full"
                        >
                            {/* Image */}
                            <div className="relative h-48 overflow-hidden bg-gray-100 flex-shrink-0">
                                {site.images && site.images.length > 0 ? (
                                    <Image
                                        src={site.images[0].url}
                                        alt={site.name}
                                        fill
                                        className="object-cover transform group-hover:scale-105 transition-transform duration-500"
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <span className="text-sm">No Image</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                    <span className="text-white text-sm font-medium">Explore Details</span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4 flex-1 flex flex-col">
                                <div className="mb-2">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">{site.country}</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors line-clamp-1">{site.name}</h3>
                                <p className="text-gray-600 text-sm mb-4 flex-1">
                                    {truncateText(site.description || site.short_description || "", 150)}
                                </p>
                                <div className="mt-auto pt-2">
                                    <span className="text-sm font-medium text-blue-600 group-hover:text-blue-800 transition-colors">
                                        Learn More →
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}
