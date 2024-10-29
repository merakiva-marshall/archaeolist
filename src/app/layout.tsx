// src/app/layout.tsx

import './globals.css'
import type { Metadata } from 'next'
import Script from 'next/script'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { daysOne, geist, geistMono } from './fonts/fonts'
import 'mapbox-gl/dist/mapbox-gl.css';

export const metadata: Metadata = {
  title: 'Archaeolist',
  description: 'Discover archaeological sites worldwide on our interactive map. Explore ancient history and plan your next adventure with Archaeolist.',
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
        <Script 
          src="https://www.googletagmanager.com/gtag/js?id=G-F1W4Y0LMJ0" 
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-F1W4Y0LMJ0');
          `}
        </Script>
      </head>
      <body className={`${geist.className} flex flex-col h-screen`}>
        <Header />
        <main className="flex-1 relative overflow-hidden">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}