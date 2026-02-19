// src/lib/metadata.ts

import { Metadata } from 'next'

const siteConfig = {
  name: 'Archaeolist',
  description: 'Discover archaeological sites worldwide on our interactive map. Explore ancient history and plan your next adventure with Archaeolist.',
  url: 'https://archaeolist.com',
  ogImage: 'https://images.archaeolist.com/archaeolist_map_preview.png',
  logoImage: 'https://archaeolist.com/logo.png',
  twitter: '@merakivatravel'
}

interface OpenGraphExtensions {
  type?: string;
  locale?: string;
  [key: string]: string | undefined;
}

interface MetadataProps {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  additionalOpenGraph?: OpenGraphExtensions;
  keywords?: string;
  canonicalUrl?: string; // Add this
}

export function generateBaseMetadata({
  title,
  description,
  path = '',
  image,
  additionalOpenGraph = {},
  keywords,
  canonicalUrl
}: MetadataProps = {}): Metadata {
  const finalTitle = title 
    ? `${title}`
    : siteConfig.name;
  
  const finalDescription = description || siteConfig.description;
  const url = `${siteConfig.url}${path}`;
  const ogImage = image || siteConfig.ogImage;

  return {
    title: finalTitle,
    description: finalDescription,
    keywords,
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: canonicalUrl || url, // Add canonical URL support
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: finalTitle,
      description: finalDescription,
      url: canonicalUrl || url, // Use canonical URL in OpenGraph if available
      siteName: siteConfig.name,
      images: [{
        url: ogImage,
        width: 1200,
        height: 630,
        alt: finalTitle,
      }],
      ...additionalOpenGraph
    }
  };
}
