// src/components/StructuredData.tsx

import { Site } from '../types/site'

interface StructuredDataProps {
  site: Site
}

export default function StructuredData({ site }: StructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': ['TouristAttraction', 'ArchaeologicalSite'],
    '@id': `https://archaeolist.com/sites/${site.country_slug}/${site.slug}`,
    name: site.name,
    description: site.description,
    url: `https://archaeolist.com/sites/${site.country_slug}/${site.slug}`,
    address: {
      '@type': 'PostalAddress',
      addressCountry: site.country,
      ...(site.address && { streetAddress: site.address })
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: site.location[1],
      longitude: site.location[0]
    },
    ...(site.images && site.images.length > 0 && {
      image: site.images.map(img => ({
        '@type': 'ImageObject',
        url: img.url,
        width: img.width,
        height: img.height,
        contentUrl: img.url
      }))
    }),
    ...(site.wikipedia_url && {
      sameAs: [site.wikipedia_url]
    }),
    ...(site.processed_periods && {
      temporalCoverage: Object.keys(site.processed_periods).join(', ')
    }),
    ...(site.timeline && {
      event: Object.entries(site.timeline).map(([title, item]) => ({
        '@type': 'Event',
        name: title,
        ...(item.date.length > 0 && { startDate: item.date[0] }),
        description: item.description.join(' ')
      }))
    }),
    ...(site.processed_features && {
      amenityFeature: Object.entries(site.processed_features).flatMap(([category, features]) =>
        features.map(feature => ({
          '@type': 'LocationFeatureSpecification',
          name: feature,
          category: category
        }))
      )
    }),
    isAccessibleForFree: true,
    publicAccess: true,
    touristType: ['Archaeologist', 'Historian', 'Tourist']
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}