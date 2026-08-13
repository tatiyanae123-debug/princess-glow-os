import 'server-only';

import { z } from 'zod';
import { getValidGoogleAccessToken, REQUIRED_SCOPES } from '@/lib/google/tokens';

const API = 'https://www.googleapis.com/calendar/v3';
const MAX_CALENDARS = 20;
const MAX_PAGES = 10;

const calendarListSchema = z.object({
  items: z.array(z.object({ id: z.string(), timeZone: z.string().optional(), selected: z.boolean().optional() })).optional(),
  nextPageToken: z.string().optional(),
});
const googleEventSchema = z.object({
  id: z.string(),
  status: z.enum(['confirmed', 'tentative', 'cancelled']).optional(),
  summary: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  htmlLink: z.string().optional(),
  recurringEventId: z.string().optional(),
  recurrence: z.array(z.string()).optional(),
  originalStartTime: z.object({ dateTime: z.string().optional(), date: z.string().optional(), timeZone: z.string().optional() }).optional(),
  start: z.object({ dateTime: z.string().optional(), date: z.string().optional(), timeZone: z.string().optional() }).optional(),
  end: z.object({ dateTime: z.string().optional(), date: z.string().optional(), timeZone: z.string().optional() }).optional(),
});
const eventsListSchema = z.object({ items: z.array(googleEventSchema).optional(), nextPageToken: z.string().optional() });

export type NormalizedGoogleEvent = {
  id: string;
  calendarId: string;
  title: string;
  description: string | null;
  location: string | null;
  source: 'google';
  htmlLink: string | null;
  startAt: Date;
  endAt: Date | null;
  allDay: boolean;
  timezone: string | null;
  recurringEventId: string | null;
  recurrenceRule: string | null;
  status: 'confirmed' | 'tentative' | 'cancelled';
};

export type CalendarFetchResult =
  | { ok: true; events: NormalizedGoogleEvent[]; calendarsRead: number; partial: boolean }
  | { ok: false; reason: 'not_connected' | 'insufficient_scope' | 'revoked' | 'error' };

export function deduplicateGoogleEvents(events: NormalizedGoogleEvent[]) {
  return [...new Map(events.map((event) => [`${event.calendarId}\u0000${event.id}`, event])).values()];
}

export function normalizeEvent(
  raw: z.infer<typeof googleEventSchema>,
  calendarId = 'primary',
  calendarTimezone?: string,
): NormalizedGoogleEvent | null {
  const startRaw = raw.start?.dateTime ?? raw.start?.date ?? raw.originalStartTime?.dateTime ?? raw.originalStartTime?.date;
  if (!startRaw) return null;
  const startAt = new Date(startRaw);
  const endRaw = raw.end?.dateTime ?? raw.end?.date;
  const endAt = endRaw ? new Date(endRaw) : null;
  if (Number.isNaN(startAt.getTime()) || (endAt && Number.isNaN(endAt.getTime()))) return null;

  return {
    id: raw.id,
    source: 'google',
    htmlLink: raw.htmlLink ?? null,
    calendarId,
    title: raw.summary?.trim().slice(0, 255) || '(No title)',
    description: raw.description?.trim().slice(0, 500) || null,
    location: raw.location?.trim().slice(0, 500) || null,
    startAt,
    endAt,
    allDay: Boolean(raw.start?.date ?? raw.originalStartTime?.date),
    timezone: raw.start?.timeZone ?? raw.originalStartTime?.timeZone ?? calendarTimezone ?? null,
    recurringEventId: raw.recurringEventId ?? null,
    recurrenceRule: raw.recurrence?.join('\n').slice(0, 2000) || null,
    status: raw.status ?? 'confirmed',
  };
}

async function googleJson(url: string, token: string) {
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
  if (response.status === 401) return { ok: false as const, reason: 'revoked' as const };
  if (response.status === 403) return { ok: false as const, reason: 'insufficient_scope' as const };
  if (!response.ok) return { ok: false as const, reason: 'error' as const };
  return { ok: true as const, value: await response.json() };
}

async function getSelectedCalendars(token: string) {
  const calendars: NonNullable<z.infer<typeof calendarListSchema>['items']> = [];
  let pageToken: string | undefined;
  let partial = false;

  for (let page = 0; page < MAX_PAGES && calendars.length < MAX_CALENDARS; page += 1) {
    const params = new URLSearchParams({ maxResults: String(MAX_CALENDARS) });
    if (pageToken) params.set('pageToken', pageToken);
    const response = await googleJson(`${API}/users/me/calendarList?${params}`, token);
    if (!response.ok) return response;
    const parsed = calendarListSchema.safeParse(response.value);
    if (!parsed.success) return { ok: false as const, reason: 'error' as const };
    calendars.push(...(parsed.data.items ?? []).filter((calendar) => calendar.selected !== false));
    pageToken = parsed.data.nextPageToken;
    if (!pageToken) break;
    if (page === MAX_PAGES - 1 || calendars.length >= MAX_CALENDARS) partial = true;
  }

  return { ok: true as const, calendars: calendars.slice(0, MAX_CALENDARS), partial };
}

async function getCalendarEvents(
  calendar: { id: string; timeZone?: string },
  token: string,
  timeMin: string,
  timeMax: string,
) {
  const events: NormalizedGoogleEvent[] = [];
  let pageToken: string | undefined;
  let partial = false;

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const params = new URLSearchParams({ timeMin, timeMax, maxResults: '250', singleEvents: 'true', showDeleted: 'true' });
    if (pageToken) params.set('pageToken', pageToken);
    const response = await googleJson(`${API}/calendars/${encodeURIComponent(calendar.id)}/events?${params}`, token);
    if (!response.ok) { partial = true; break; }
    const parsed = eventsListSchema.safeParse(response.value);
    if (!parsed.success) { partial = true; break; }
    for (const raw of parsed.data.items ?? []) {
      const event = normalizeEvent(raw, calendar.id, calendar.timeZone);
      if (event) events.push(event);
    }
    pageToken = parsed.data.nextPageToken;
    if (!pageToken) break;
    if (page === MAX_PAGES - 1) partial = true;
  }

  return { events, partial };
}

export async function getUpcomingGoogleEvents(userId: string): Promise<CalendarFetchResult> {
  const token = await getValidGoogleAccessToken(userId, REQUIRED_SCOPES.calendar);
  if (!token.ok) {
    if (token.reason === 'not_connected') return { ok: false, reason: 'not_connected' };
    if (token.reason === 'insufficient_scope') return { ok: false, reason: 'insufficient_scope' };
    if (token.reason === 'revoked' || token.reason === 'missing_refresh_token') return { ok: false, reason: 'revoked' };
    return { ok: false, reason: 'error' };
  }

  try {
    const calendarResult = await getSelectedCalendars(token.accessToken);
    if (!calendarResult.ok) return calendarResult;
    const timeMin = new Date(Date.now() - 30 * 86400000).toISOString();
    const timeMax = new Date(Date.now() + 365 * 86400000).toISOString();

    const calendarReads = await Promise.all(
      calendarResult.calendars.map((calendar) => getCalendarEvents(calendar, token.accessToken, timeMin, timeMax)),
    );
    const events = calendarReads.flatMap((result) => result.events);
    const partial = calendarResult.partial || calendarReads.some((result) => result.partial);

    return { ok: true, events: deduplicateGoogleEvents(events), calendarsRead: calendarResult.calendars.length, partial };
  } catch {
    return { ok: false, reason: 'error' };
  }
}
