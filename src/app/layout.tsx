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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`h-full ${daysOne.variable} ${geist.variable} ${geistMono.variable}`}>
      <head>
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