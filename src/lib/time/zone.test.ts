import { describe, expect, it } from 'vitest';
import { dateKeyInTimeZone, hourInTimeZone, normalizeTimeZone, weekdayInTimeZone } from './zone';

describe('Glow device time zone', () => {
  const instant = new Date('2026-09-01T02:30:00.000Z');

  it('uses the user day rather than the server UTC day', () => {
    expect(dateKeyInTimeZone(instant, 'America/New_York')).toBe('2026-08-31');
    expect(weekdayInTimeZone(instant, 'America/New_York')).toBe('monday');
    expect(hourInTimeZone(instant, 'America/New_York')).toBe(22);
  });

  it('falls back safely for invalid time zones', () => {
    expect(normalizeTimeZone('not/a-zone')).toBe('America/New_York');
  });
});
