
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader } from './ui/card'
import SitePlaceholder from './SitePlaceholder'
import { Site } from '../types/site'

interface RelatedSitesProps {
    sites: Pick<Site, 'name' | 'slug' | 'country_slug' | 'short_description' | 'images'>[]
    country: string
}

export default function RelatedSites({ sites, country }: RelatedSitesProps) {
    if (!sites || sites.length === 0) return null

    return (
        <Card>
            <CardHeader className="pb-2">
                <h2 className="text-2xl font-semibold">More Sites in {country}</h2>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                    {sites.map((site) => (
                        <Link
                            key={`${site.country_slug}-${site.slug}`}
                            href={`/sites/${site.country_slug}/${site.slug}`}
                            className="block h-full transition-transform hover:-translate-y-1"
                        >
                            <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow border border-gray-200">
                                <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
                                    {site.images && site.images.length > 0 ? (
                                        <Image
                                            src={site.images[0].url}
                                            alt={site.name}
                                            fill
                                            className="object-cover transition-transform duration-300 hover:scale-105"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        />
                                    ) : (
                                        <SitePlaceholder name={site.name} />
                                    )}
                                </div>
                                <CardHeader className="p-4 pb-2">
                                    <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-blue-600">
                                        {site.name}
                                    </h3>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <p className="text-sm text-gray-600 line-clamp-2">
                                        {site.short_description || 'Explore this archaeological site.'}
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>

                <div className="flex justify-center pt-8">
                    <Link
                        href={`/sites/${sites[0].country_slug}`}
                        className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        View all sites in {country}
                    </Link>
                </div>
            </CardContent>
        </Card>
    )
}
