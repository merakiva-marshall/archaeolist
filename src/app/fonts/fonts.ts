// src/app/fonts/fonts.ts

import localFont from 'next/font/local'
import { Space_Grotesk, Noto_Serif, Inter } from 'next/font/google'

export const daysOne = localFont({
  src: './DaysOne-Regular.ttf',
  display: 'swap',
  variable: '--font-days-one',
})

export const geistMono = localFont({
  src: './GeistMonoVF.woff',
  display: 'swap',
  variable: '--font-geist-mono',
})

export const geist = localFont({
  src: './GeistVF.woff',
  display: 'swap',
  variable: '--font-geist',
})

// New design system fonts
export const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-space-grotesk',
})

export const notoSerif = Noto_Serif({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-noto-serif',
})

export const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-inter',
})