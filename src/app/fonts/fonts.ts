// src/app/fonts/fonts.ts

import localFont from 'next/font/local'

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