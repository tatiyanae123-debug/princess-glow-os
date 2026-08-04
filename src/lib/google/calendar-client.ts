import 'server-only';

import { getValidGoogleAccessToken, REQUIRED_SCOPES } from '@/lib/google/tokens';

const CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';
export const CALENDAR_TIMEZONE = 'America/New_York';

// Bounded window: from now through 14 days out. Capped result count so a
// heavily-booked calendar can't return an unbounded response.
const WINDOW_DAYS = 14;
const MAX_RESULTS = 25;

export type NormalizedGoogleEvent = {
  id: string;
  source: 'google';
  title: string;
  startAt: Date;
  endAt: Date | null;
  allDay: boolean;
  location: string | null;
  htmlLink: string | null;
};

export type CalendarFetchResult =
  | { ok: true; events: NormalizedGoogleEvent[] }
  | { ok: false; reason: 'not_connected' | 'insufficient_scope' | 'expired' | 'revoked' | 'error' };

export function normalizeEvent(raw: {
  id: string;
  summary?: string;
  htmlLink?: string;
  location?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
}): NormalizedGoogleEvent | null {
  const startRaw = raw.start?.dateTime ?? raw.start?.date;
  if (!startRaw) return null;
  const allDay = !raw.start?.dateTime;
  const endRaw = raw.end?.dateTime ?? raw.end?.date ?? null;

  return {
    id: raw.id,
    source: 'google',
    title: raw.summary?.trim() || '(No title)',
    startAt: new Date(startRaw),
    endAt: endRaw ? new Date(endRaw) : null,
    allDay,
    location: raw.location ?? null,
    htmlLink: raw.htmlLink ?? null,
  };
}

/**
 * Reads upcoming events from the signed-in user's primary Google Calendar.
 * Read-only — this module never creates, updates, or deletes anything on
 * the user's real Google Calendar.
 */
export async function getUpcomingGoogleEvents(userId: string): Promise<CalendarFetchResult> {
  const token = await getValidGoogleAccessToken(userId, REQUIRED_SCOPES.calendar);
  if (!token.ok) {
    if (token.reason === 'not_connected') return { ok: false, reason: 'not_connected' };
    if (token.reason === 'insufficient_scope') return { ok: false, reason: 'insufficient_scope' };
    if (token.reason === 'revoked' || token.reason === 'missing_refresh_token') return { ok: false, reason: 'revoked' };
    return { ok: false, reason: 'error' };
  }

  const now = new Date();
  const windowEnd = new Date(now.getTime() + WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const params = new URLSearchParams({
    timeMin: now.toISOString(),
    timeMax: windowEnd.toISOString(),
    maxResults: String(MAX_RESULTS),
    singleEvents: 'true',
    orderBy: 'startTime',
    timeZone: CALENDAR_TIMEZONE,
  });

  try {
    const response = await fetch(`${CALENDAR_API_BASE}/calendars/primary/events?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token.accessToken}` },
      // Calendar data is per-user and time-sensitive — never cache across requests.
      cache: 'no-store',
    });

    if (response.status === 401) return { ok: false, reason: 'revoked' };
    if (response.status === 403) return { ok: false, reason: 'insufficient_scope' };
    if (!response.ok) return { ok: false, reason: 'error' };

    const data = (await response.json()) as { items?: unknown[] };
    const events = (data.items ?? [])
      .map((item) => normalizeEvent(item as Parameters<typeof normalizeEvent>[0]))
      .filter((event): event is NormalizedGoogleEvent => event !== null);

    return { ok: true, events };
  } catch {
    return { ok: false, reason: 'error' };
  }
}
