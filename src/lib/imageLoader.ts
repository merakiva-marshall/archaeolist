import type { ImageLoaderProps } from 'next/image'

/**
 * Custom image loader:
 * - images.archaeolist.com is already a CDN — pass the URL through directly
 *   so Next.js doesn't proxy it (which gets 403'd by CDN hotlink protection).
 * - All other images go through Next.js built-in optimization as normal.
 */
export default function imageLoader({ src, width, quality }: ImageLoaderProps): string {
  if (src.includes('images.archaeolist.com')) {
    // Pass width as a query param so Next.js is satisfied; CDN serves the image directly.
    const url = new URL(src)
    url.searchParams.set('w', String(width))
    return url.toString()
  }
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality ?? 75}`
}
