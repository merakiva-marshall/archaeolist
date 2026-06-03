// Ingestion endpoint for the raw behavioral event log (public.events).
// The browser never writes to Supabase directly — trackEvent() in
// lib/analytics.ts beacons here, and this route inserts a single row using the
// service-role key. Returns 204 immediately (beacons don't read the response).

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Only these event types are accepted, so the table can't fill with garbage.
const ALLOWED_EVENT_TYPES = new Set([
  'page_view',
  'viator_click',
  'viator_impression',
]);

interface TrackPayload {
  type?: string;
  site_id?: string | null;
  tour_id?: string | null;
  country_slug?: string | null;
  path?: string | null;
  session_id?: string | null;
  metadata?: Record<string, unknown> | null;
}

export async function POST(request: Request) {
  try {
    let body: TrackPayload;
    try {
      body = await request.json();
    } catch {
      return new NextResponse(null, { status: 400 });
    }

    const type = body.type;
    if (!type || !ALLOWED_EVENT_TYPES.has(type)) {
      // Unknown / missing event type — reject silently.
      return new NextResponse(null, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const referrer = request.headers.get('referer');

    const { error } = await supabase.from('events').insert({
      event_type: type,
      site_id: body.site_id ?? null,
      tour_id: body.tour_id ?? null,
      country_slug: body.country_slug ?? null,
      path: body.path ?? null,
      session_id: body.session_id ?? null,
      referrer: referrer ?? null,
      metadata: body.metadata ?? {},
    });

    if (error) {
      console.error('Failed to insert event:', error);
      return new NextResponse(null, { status: 500 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error('Error in /api/track:', e);
    return new NextResponse(null, { status: 500 });
  }
}
