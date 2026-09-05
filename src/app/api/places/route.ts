import { auth } from '@/auth';
import { getUpcomingGoogleEvents } from '@/lib/google/calendar-client';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ ok: false, reason: 'not_signed_in' }, { status: 401 });
  }

  const result = await getUpcomingGoogleEvents(session.user.id);
  if (!result.ok) {
    const status = result.reason === 'insufficient_scope' ? 403 : result.reason === 'not_connected' ? 401 : 502;
    return Response.json(result, { status });
  }

  const seen = new Set<string>();
  const places = result.events
    .filter((event) => event.location?.trim())
    .filter((event) => {
      const key = event.location!.trim().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 12)
    .map((event) => ({
      id: event.id,
      name: event.location!.trim(),
      eventTitle: event.title,
      startAt: event.startAt.toISOString(),
      mapsUrl: `https://maps.apple.com/?q=${encodeURIComponent(event.location!.trim())}`,
      calendarUrl: event.htmlLink,
    }));

  return Response.json({ ok: true, places }, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
