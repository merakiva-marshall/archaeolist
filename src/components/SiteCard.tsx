// src/components/SiteCard.tsx

import Image from 'next/image'
import Link from 'next/link'
import { Site } from '../types/site'
import SitePlaceholder from './SitePlaceholder'
import { MapPin } from 'lucide-react'

interface SiteCardProps {
  site: Site;
  showCountryContext?: boolean;
}

export default function SiteCard({ site, showCountryContext }: SiteCardProps) {
  return (
    <Link
      href={`/sites/${site.country_slug}/${site.slug}`}
      className="group block h-full"
    >
      <div className="h-full bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col">
        <div className="relative aspect-[4/3] overflow-hidden bg-surface-container flex-shrink-0">
          {site.images && site.images[0] ? (
            <Image
              src={site.images[0].url}
              alt={site.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0">
              <SitePlaceholder name={site.name} />
            </div>
          )}
        </div>
        <div className="p-4 flex-1 flex flex-col">
          {showCountryContext && site.country && (
            <div className="flex items-center gap-1 text-xs font-headline font-bold uppercase tracking-[0.15em] text-primary-brand mb-1">
              <MapPin className="h-3 w-3" />
              <span>{site.country}</span>
            </div>
          )}
          <h2 className="text-lg font-headline font-black text-on-surface group-hover:text-primary-brand transition-colors mb-2">
            {site.name}
          </h2>
          {site.short_description && (
            <p className="text-on-surface-variant text-sm font-body leading-relaxed line-clamp-3 flex-1">
              {site.short_description}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}