import { GeistSans } from 'geist/font/sans'
import './globals.css'
import type { Metadata } from 'next'

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
    <html lang="en">
      <body className={GeistSans.className}>{children}</body>
    </html>
  )
}