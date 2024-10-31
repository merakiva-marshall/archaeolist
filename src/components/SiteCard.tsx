// src/components/SiteCard.tsx

import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from './ui/card'
import { Site } from '../types/site'
import SitePlaceholder from './SitePlaceholder'

interface SiteCardProps {
  site: Site;
}

export default function SiteCard({ site }: SiteCardProps) {
  return (
    <Link
      href={`/sites/${site.country_slug}/${site.slug}`}
      className="group block h-full"
    >
      <Card className="h-full transition-shadow hover:shadow-lg">
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          {site.images && site.images[0] ? (
            <Image
              src={site.images[0].url}
              alt={site.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0">
              <SitePlaceholder name={site.name} />
            </div>
          )}
        </div>
        <CardHeader>
          <h2 className="text-xl font-semibold group-hover:text-blue-600 transition-colors">
            {site.name}
          </h2>
        </CardHeader>
        {site.short_description && (
          <CardContent>
            <p className="text-gray-600 line-clamp-3">{site.short_description}</p>
          </CardContent>
        )}
      </Card>
    </Link>
  );
}