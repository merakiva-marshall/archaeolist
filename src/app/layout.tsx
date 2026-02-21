// src/app/layout.tsx

import './globals.css'
import type { Metadata } from 'next'
import Script from 'next/script'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { daysOne, geist, geistMono } from './fonts/fonts'
import 'mapbox-gl/dist/mapbox-gl.css';

export const metadata: Metadata = {
  title: 'Archaeolist | Archaeological Sites Worldwide',
  description: 'Discover archaeological sites worldwide on our interactive map. Explore ancient history and plan your next adventure with Archaeolist.',
  metadataBase: new URL('https://archaeolist.com'),
  openGraph: {
    title: 'Archaeolist',
    description: 'Discover archaeological sites worldwide on our interactive map. Explore ancient history and plan your next adventure with Archaeolist.',
    url: 'https://archaeolist.com',
    siteName: 'Archaeolist',
    images: [{
      url: 'https://images.archaeolist.com/archaeolist_map_preview.png',
      width: 1200,
      height: 630,
      alt: 'Archaeolist - Interactive Archaeological Sites Map'
    }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Archaeolist',
    description: 'Discover archaeological sites worldwide on our interactive map. Explore ancient history and plan your next adventure with Archaeolist.',
    creator: '@merakivatravel',
    images: ['https://images.archaeolist.com/archaeolist_map_preview.png'],
  }
}

function OrganizationSchema() {
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://archaeolist.com',
    name: 'Archaeolist',
    url: 'https://archaeolist.com',
    logo: {
      '@type': 'ImageObject',
      url: 'https://archaeolist.com/logo.png',
      width: 100,  // Update with your logo's dimensions
      height: 100,
    },
    description: 'Discover archaeological sites worldwide on our interactive map. Explore ancient history and plan your next adventure with Archaeolist.',
    sameAs: [
      'https://merakivatravel.com',
      'https://instagram.com/merakiva.travel'
    ]
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
    />
  )
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`h-full ${daysOne.variable} ${geist.variable} ${geistMono.variable}`}>
      <head>
        <OrganizationSchema />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="https://images.archaeolist.com/archaeolist_map_preview.png" />
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-NDXB6JDJ');`}
        </Script>
      </head>
      <body className={`${geist.className} flex flex-col min-h-screen`}>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-NDXB6JDJ"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        <Header />
        <main className="flex-1 relative">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
