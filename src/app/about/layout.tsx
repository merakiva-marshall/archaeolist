// src/app/about/layout.tsx

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About | Archaeolist',
  description: 'Learn about Archaeolist and our mission to make archaeology accessible to everyone.',
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}