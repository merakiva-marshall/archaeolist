// src/lib/metadata.ts

import { Metadata } from 'next'

const siteConfig = {
  name: 'Archaeolist',
  description: 'Discover archaeological sites worldwide on our interactive map. Explore ancient history and plan your next adventure with Archaeolist.',
  url: 'https://archaeolist.com',
  ogImage: 'https://images.archaeolist.com/archaeolist_map_preview.png', 
  logoImage: 'https://archaeolist.com/logo.png',
  twitter: '@merakivatravel' // Replace with your Twitter handle
}

export function generateBaseMetadata({
  title,
  description,
  path = '',
  image,
}: {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
} = {}): Metadata {
  const finalTitle = title 
    ? `${title} | ${siteConfig.name}`
    : siteConfig.name;
  
  const finalDescription = description || siteConfig.description;
  const url = `${siteConfig.url}${path}`;
  const ogImage = image || siteConfig.ogImage;

  return {
    title: finalTitle,
    description: finalDescription,
    metadataBase: new URL(siteConfig.url),
    icons: {
      icon: '/favicon.ico',
      apple: '/apple-touch-icon.png',
    },
    openGraph: {
      type: 'website',
      siteName: siteConfig.name,
      title: finalTitle,
      description: finalDescription,
      url,
      images: [{
        url: ogImage,
        width: 1200,
        height: 630,
        alt: finalTitle,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      site: siteConfig.twitter,
      creator: siteConfig.twitter,
      title: finalTitle,
      description: finalDescription,
      images: [ogImage],
    },
    alternates: {
      canonical: url,
    },
  }
}