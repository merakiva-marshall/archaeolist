// src/components/StructuredData.tsx

import { Site } from '../types/site'

interface StructuredDataProps {
  site: Site
}

// Define types for the structured data
interface ImageObject {
  '@type': 'ImageObject'
  url: string
  width: number
  height: number
  contentUrl: string
}

interface Event {
  '@type': 'Event'
  name: string
  startDate?: string
  description?: string
}

interface LocationFeatureSpecification {
  '@type': 'LocationFeatureSpecification'
  name: string
  category: string
}

interface StructuredDataObject {
  '@context': 'https://schema.org'
  '@type': ['TouristAttraction', 'ArchaeologicalSite']
  '@id': string
  name: string
  description: string
  url: string
  address: {
    '@type': 'PostalAddress'
    addressCountry: string
    streetAddress?: string
  }
  geo: {
    '@type': 'GeoCoordinates'
    latitude: number
    longitude: number
  }
  image?: ImageObject[]
  sameAs?: string[]
  temporalCoverage?: string
  event?: Event[]
  amenityFeature?: LocationFeatureSpecification[]
  isAccessibleForFree: boolean
  publicAccess: boolean
  touristType: string[]
}

export default function StructuredData({ site }: StructuredDataProps) {
  // Build the base structured data object
  const structuredData: StructuredDataObject = {
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
    isAccessibleForFree: true,
    publicAccess: true,
    touristType: ['Archaeologist', 'Historian', 'Tourist']
  }

  // Safely add images if they exist
  if (site.images && Array.isArray(site.images) && site.images.length > 0) {
    structuredData.image = site.images.map(img => ({
      '@type': 'ImageObject',
      url: img.url,
      width: img.width,
      height: img.height,
      contentUrl: img.url
    }))
  }

  // Safely add Wikipedia URL if it exists
  if (site.wikipedia_url) {
    structuredData.sameAs = [site.wikipedia_url]
  }

  // Safely add periods if they exist
  if (site.processed_periods && Object.keys(site.processed_periods).length > 0) {
    structuredData.temporalCoverage = Object.keys(site.processed_periods).join(', ')
  }

  // Safely add timeline events if they exist
  if (site.timeline && Object.keys(site.timeline).length > 0) {
    structuredData.event = Object.entries(site.timeline).map(([title, item]) => ({
      '@type': 'Event',
      name: title,
      ...(item.date && item.date.length > 0 && { startDate: item.date[0] }),
      ...(item.description && item.description.length > 0 && { 
        description: item.description.join(' ') 
      })
    }))
  }

  // Safely add features if they exist
  if (site.processed_features && Object.keys(site.processed_features).length > 0) {
    structuredData.amenityFeature = Object.entries(site.processed_features)
      .filter(([, features]) => Array.isArray(features) && features.length > 0)
      .flatMap(([category, features]) =>
        features.map(feature => ({
          '@type': 'LocationFeatureSpecification',
          name: feature,
          category: category
        }))
      )
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}