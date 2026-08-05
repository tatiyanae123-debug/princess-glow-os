import { describe, it, expect } from 'vitest';
import { normalizeEvent } from '@/lib/google/calendar-client';

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
});
