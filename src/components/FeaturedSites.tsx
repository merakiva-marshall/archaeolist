
import { useEffect, useState } from 'react'
import { Site } from '../types/site'
import { fetchSites } from '../lib/supabase'
import Link from 'next/link'



// Helper to truncate text
const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}

export default function FeaturedSites() {
    const [featuredSites, setFeaturedSites] = useState<Site[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadFeatured() {
            try {
                // Fetch all fields to be safe, assuming 'featured' is in the schema now
                // We fetch everything (*) so if 'featured' exists it will be returned
                const sites = await fetchSites();

                // Explicitly check for true. If the column is missing/undefined, this will be falsy.
                // We use type assertion or optional chaining safely if Typescript complains about 'featured'
                // being purely optional, but we added it to the type so it should be fine.
                const featured = sites.filter(s => s.featured === true);

                console.log(`Found ${featured.length} featured sites in database.`);

                if (featured.length > 0) {
                    setFeaturedSites(featured.slice(0, 5));
                } else {
                    console.log("No featured sites found, falling back to defaults.");
                    // Fallback names
                    const fallbackNames = ['Great Wall of China', 'Petra', 'Machu Picchu', 'Giza Pyramids'];
                    const fallbacks = sites.filter(s => fallbackNames.some(name => s.name.includes(name))).slice(0, 4);
                    setFeaturedSites(fallbacks.length > 0 ? fallbacks : sites.slice(0, 4));
                }
            } catch (err) {
                console.error("Error loading featured sites:", err);
            } finally {
                setLoading(false);
            }
        }
        loadFeatured();
    }, [])

    if (loading) {
        return (
            <section className="py-12 bg-white relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Sites</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-64 bg-gray-100 rounded-lg animate-pulse" />
                        ))}
                    </div>
                </div>
            </section>
        )
    }

    if (featuredSites.length === 0) return null;

    return (
        <section className="py-12 bg-white relative shadow-sm border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Sites</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {featuredSites.map((site) => (
                        <Link
                            key={site.id}
                            href={`/sites/${site.country_slug}/${site.slug}`}
                            className="group block bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col h-full"
                        >
                            {/* Image */}
                            <div className="relative h-48 overflow-hidden bg-gray-100 flex-shrink-0">
                                {site.images && site.images.length > 0 ? (
                                    <img
                                        src={site.images[0].url}
                                        alt={site.name}
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
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
                                    {truncateText(site.description || site.short_description || "", 300)}
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
