// src/components/StructuredData.tsx

import { Site } from '../types/site'

interface StructuredDataProps {
  site: Site
}

export default function StructuredData({ site }: StructuredDataProps) {
  const baseUrl = 'https://archaeolist.com'
  const siteUrl = `${baseUrl}/sites/${site.country_slug}/${site.slug}`

  // Build main tourist attraction/landmark data
  const mainSiteData = {
    '@context': 'https://schema.org',
    '@type': 'LandmarksOrHistoricalBuildings',
    '@id': siteUrl,
    name: site.name,
    description: site.description,
    url: siteUrl,
    hasMap: baseUrl,
    
    // Only include address if we have valid data
    ...(site.address && {
      address: {
        '@type': 'PostalAddress',
        addressCountry: site.country,
        streetAddress: site.address
      }
    }),
    
    // Geo coordinates are required for our use case
    geo: {
      '@type': 'GeoCoordinates',
      latitude: site.location[1],
      longitude: site.location[0]
    },

    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': siteUrl
    },

    // Only include features if we have them
    ...(site.processed_features && {
      amenityFeature: Object.entries(site.processed_features).flatMap(([category, features]) =>
        features.map(feature => ({
          '@type': 'LocationFeatureSpecification',
          name: feature,
          value: true,
          category: category
        }))
      )
    }),

    // Only include images if we have them
    ...(site.images && site.images.length > 0 && {
      image: site.images.map(img => ({
        '@type': 'ImageObject',
        url: img.url,
        width: img.width,
        height: img.height
      }))
    }),

    // Only include Wikipedia if we have it
    ...(site.wikipedia_url && {
      sameAs: [site.wikipedia_url]
    }),
    
    // Additional properties for historical data and UNESCO status
    ...(site.processed_periods || site.is_unesco ? {
      additionalProperty: [
        ...(site.processed_periods ? [{
          '@type': 'PropertyValue',
          name: 'Historical Periods',
          value: Object.keys(site.processed_periods).join(', ')
        }] : []),
        ...(site.is_unesco ? [{
          '@type': 'PropertyValue',
          name: 'UNESCO World Heritage Site',
          value: 'true'
        }] : [])
      ]
    } : {})
  }

  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        item: {
          '@id': baseUrl,
          name: 'Home'
        }
      },
      {
        '@type': 'ListItem',
        position: 2,
        item: {
          '@id': `${baseUrl}/sites/${site.country_slug}`,
          name: site.country
        }
      },
      {
        '@type': 'ListItem',
        position: 3,
        item: {
          '@id': siteUrl,
          name: site.name
        }
      }
    ]
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(mainSiteData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
    </>
  )
}