// Client-side event tracking. Fires anonymous behavioral events to /api/track,
// which writes them to the raw `events` table in Supabase.
//
// Privacy: session_id is a random, first-party id kept in sessionStorage. It is
// not PII, not a cookie, and is not shared with any third party. It exists only
// to count unique viewers and dedupe rapid double-fires.

type EventType = 'page_view' | 'viator_click' | 'viator_impression';

interface TrackProps {
  site_id?: string | null;
  tour_id?: string | null;
  country_slug?: string | null;
  path?: string | null;
  metadata?: Record<string, unknown>;
}

const SESSION_KEY = 'al_session_id';

// Lazily create / read an anonymous per-tab session id.
function getSessionId(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    let id = window.sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2) + Date.now().toString(36);
      window.sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    // sessionStorage can throw in private mode / when disabled — track anonymously.
    return undefined;
  }
}

export function trackEvent(type: EventType, props: TrackProps = {}): void {
  if (typeof window === 'undefined') return;

  const payload = {
    type,
    site_id: props.site_id ?? null,
    tour_id: props.tour_id ?? null,
    country_slug: props.country_slug ?? null,
    path: props.path ?? window.location.pathname,
    session_id: getSessionId() ?? null,
    metadata: props.metadata ?? {},
  };

  try {
    const body = JSON.stringify(payload);

    // sendBeacon is the right tool: it fires reliably even as the page navigates
    // or a new tab opens (the Viator-click case). Fall back to keepalive fetch.
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' });
      const ok = navigator.sendBeacon('/api/track', blob);
      if (ok) return;
    }

    void fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    });
  } catch {
    // Never let analytics break the page.
  }
}
