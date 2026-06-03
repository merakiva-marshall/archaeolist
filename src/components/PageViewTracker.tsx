'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackEvent } from '@/lib/analytics';

// Fires one `page_view` event per route, including client-side (SPA) navigations.
// Mounted once globally in the root layout. The path itself is canonical, so
// per-site view counts are resolved by joining events.path -> sites at read time;
// no site_id needs to be threaded through here.
export default function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    trackEvent('page_view', { path: pathname });
  }, [pathname]);

  return null;
}
