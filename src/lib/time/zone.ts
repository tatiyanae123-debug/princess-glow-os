export const DEFAULT_TIME_ZONE = 'America/New_York';

export function normalizeTimeZone(value?: string | null) {
  if (!value) return DEFAULT_TIME_ZONE;
  try {
    Intl.DateTimeFormat('en-US', { timeZone: value }).format(new Date());
    return value;
  } catch {
    return DEFAULT_TIME_ZONE;
  }
}

export function dateKeyInTimeZone(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

export function hourInTimeZone(date: Date, timeZone: string) {
  return Number(new Intl.DateTimeFormat('en-US', { timeZone, hour: 'numeric', hourCycle: 'h23' }).format(date));
}

export function weekdayInTimeZone(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'long' }).format(date).toLowerCase();
}
