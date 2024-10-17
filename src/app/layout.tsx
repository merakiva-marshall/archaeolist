import { GeistSans } from 'geist/font/sans'
import './globals.css'
import type { Metadata } from 'next'
import Script from 'next/script'
import Header from '../components/Header'
import Footer from '../components/Footer'

export const metadata: Metadata = {
  title: 'Archaeolist',
  description: 'Discover archaeological sites worldwide',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/* Load the gtag script asynchronously */}
        <Script 
          src="https://www.googletagmanager.com/gtag/js?id=G-F1W4Y0LMJ0" 
          strategy="afterInteractive"
        />
        {/* Initialize Google Analytics */}
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-F1W4Y0LMJ0');
          `}
        </Script>
      </head>
      <body className={`${GeistSans.className} flex flex-col min-h-screen`}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  )
}