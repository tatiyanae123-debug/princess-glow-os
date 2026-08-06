import { describe, it, expect } from 'vitest';
import { deduplicateGoogleEvents, normalizeEvent } from '@/lib/google/calendar-client';

describe('normalizeEvent (Calendar normalization)', () => {
  it('normalizes a timed event as not all-day', () => {
    const result = normalizeEvent({
      id: 'evt-1',
      summary: 'Pilates',
      start: { dateTime: '2026-08-10T10:00:00-04:00' },
      end: { dateTime: '2026-08-10T11:00:00-04:00' },
    });
    expect(result).not.toBeNull();
    expect(result?.allDay).toBe(false);
    expect(result?.source).toBe('google');
    expect(result?.title).toBe('Pilates');
  });

  it('normalizes a date-only event as all-day', () => {
    const result = normalizeEvent({
      id: 'evt-2',
      summary: 'Doctor Appointment',
      start: { date: '2026-08-12' },
      end: { date: '2026-08-13' },
    });
    expect(result?.allDay).toBe(true);
  });

  it('falls back to "(No title)" when summary is missing or blank', () => {
    const result = normalizeEvent({ id: 'evt-3', start: { dateTime: '2026-08-10T10:00:00Z' } });
    expect(result?.title).toBe('(No title)');
  });

  it('returns null for an event with no start time at all (malformed)', () => {
    const result = normalizeEvent({ id: 'evt-4', summary: 'Broken event' });
    expect(result).toBeNull();
  });

  it('preserves location and htmlLink when present', () => {
    const result = normalizeEvent({
      id: 'evt-5',
      summary: 'Lunch',
      location: 'Home',
      htmlLink: 'https://calendar.google.com/event?eid=abc',
      start: { dateTime: '2026-08-10T12:00:00Z' },
    });
    expect(result?.location).toBe('Home');
    expect(result?.htmlLink).toBe('https://calendar.google.com/event?eid=abc');
  });

  it('preserves timezone and recurrence identity for recurring events', () => {
    const result = normalizeEvent({
      id: 'instance-1', recurringEventId: 'series-1', status: 'tentative',
      start: { dateTime: '2026-11-01T09:00:00-05:00', timeZone: 'America/New_York' },
      end: { dateTime: '2026-11-01T10:00:00-05:00', timeZone: 'America/New_York' },
    }, 'work@example.com');
    expect(result).toMatchObject({ calendarId: 'work@example.com', recurringEventId: 'series-1', timezone: 'America/New_York', status: 'tentative' });
    expect(result?.startAt.toISOString()).toBe('2026-11-01T14:00:00.000Z');
  });

  it('normalizes cancelled instances so sync can archive rather than delete them', () => {
    const result = normalizeEvent({ id: 'cancelled-1', status: 'cancelled', originalStartTime: { date: '2026-08-20' } }, 'primary');
    expect(result).toMatchObject({ id: 'cancelled-1', status: 'cancelled', allDay: true });
  });

  it('prevents duplicate event IDs within the same calendar while preserving IDs across calendars', () => {
    const first = normalizeEvent({ id: 'shared-id', summary: 'First', start: { date: '2026-08-20' } }, 'calendar-a')!;
    const updated = normalizeEvent({ id: 'shared-id', summary: 'Updated', start: { date: '2026-08-21' } }, 'calendar-a')!;
    const otherCalendar = normalizeEvent({ id: 'shared-id', summary: 'Other', start: { date: '2026-08-20' } }, 'calendar-b')!;
    const result = deduplicateGoogleEvents([first, updated, otherCalendar]);
    expect(result).toHaveLength(2);
    expect(result.find((event) => event.calendarId === 'calendar-a')?.title).toBe('Updated');
  });
});
