// src/components/StructuredData.tsx

import { Site } from '../types/site'

interface CountryInfo {
  country: string;
  site_count: number;
  earliest_site?: string;
  unesco_count: number;
}

interface StructuredDataProps {
  site?: Site;
  countryInfo?: CountryInfo;
}

export default function StructuredData({ site, countryInfo }: StructuredDataProps) {
  const baseUrl = 'https://archaeolist.com'

  if (site) {
    const siteUrl = `${baseUrl}/sites/${site.country_slug}/${site.slug}`

    // Safely handle images array
    const safeImages = Array.isArray(site.images) ? site.images : [];
    const hasValidImages = safeImages.length > 0;

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

      // Only include images if we have valid array with items
      ...(hasValidImages && {
        image: safeImages.map(img => ({
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

    // Rest of the component remains the same...

    const siteBreadcrumbData = {
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteBreadcrumbData) }}
        />
      </>
    )
  }

  if (countryInfo) {
    const countrySlug = countryInfo.country.toLowerCase().replace(/\s+/g, '-');
    const countryUrl = `${baseUrl}/sites/${countrySlug}`;

    const collectionData = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': countryUrl,
      name: `Archaeological Sites in ${countryInfo.country}`,
      description: `Explore ${countryInfo.site_count} archaeological sites in ${countryInfo.country}, including ${countryInfo.unesco_count} UNESCO World Heritage sites.`,
      url: countryUrl,
      numberOfItems: countryInfo.site_count,
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: {
          '@type': 'ListItem',
          position: 1,
          item: {
            '@type': 'Country',
            name: countryInfo.country,
            description: `Collection of ${countryInfo.site_count} archaeological sites and historical landmarks in ${countryInfo.country}.`
          }
        }
      }
    };

    const countryBreadcrumbData = {
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
            '@id': countryUrl,
            name: `Archaeological Sites in ${countryInfo.country}`
          }
        }
      ]
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(countryBreadcrumbData) }}
        />
      </>
    );
  }

  return null;
}