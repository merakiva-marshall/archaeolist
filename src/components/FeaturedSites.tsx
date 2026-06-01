
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
            .select('id, name, slug, country_slug, country, short_description, description, images, is_unesco, featured, featured_score')
            .eq('archaeological_site_yn', true)
            .order('featured', { ascending: false })
            .order('featured_score', { ascending: false, nullsFirst: false })
            .limit(5);

        if (data && data.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            featuredSites = data.map((site: any) => ({
                ...site,
                location: site.location?.coordinates || site.location
            }));
        }
    } catch (err) {
        console.error("Error loading featured sites:", err);
    }

    if (featuredSites.length === 0) return null;

    return (
        <section className="py-16 bg-surface relative border-b border-outline-variant">
            <div className="max-w-7xl mx-auto px-8">
                <span className="text-xs font-headline font-bold uppercase tracking-[0.2em] text-primary-brand">Featured</span>
                <h2 className="text-3xl font-headline font-black text-primary-brand tracking-tight mt-1 mb-8">Sites Worth Exploring</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {featuredSites.slice(0, 4).map((site) => (
                        <Link
                            key={site.id}
                            href={`/sites/${site.country_slug}/${site.slug}`}
                            className="group block bg-surface-container-lowest rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col h-full"
                        >
                            {/* Image */}
                            <div className="relative h-48 overflow-hidden bg-surface-container flex-shrink-0">
                                {site.images && site.images.length > 0 ? (
                                    <Image
                                        src={site.images[0].url}
                                        alt={site.name}
                                        fill
                                        className="object-cover transform group-hover:scale-105 transition-transform duration-500"
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                                        <span className="text-sm font-label">No Image</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                    <span className="text-white text-sm font-label font-medium">Explore Details</span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4 flex-1 flex flex-col">
                                <div className="mb-2">
                                    <span className="text-xs font-headline font-bold uppercase tracking-[0.15em] text-primary-brand">{site.country}</span>
                                </div>
                                <h3 className="text-lg font-headline font-black text-on-surface mb-2 group-hover:text-primary-brand transition-colors line-clamp-1">{site.name}</h3>
                                <p className="text-on-surface-variant text-sm font-body mb-4 flex-1 leading-relaxed">
                                    {truncateText(site.description || site.short_description || "", 150)}
                                </p>
                                <div className="mt-auto pt-2">
                                    <span className="text-sm font-label font-semibold text-primary-brand group-hover:text-primary-container transition-colors">
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
