import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the DB layer so these are true unit tests — no real database needed.
// Each test configures what "existing rows" the mocked query should return.
let mockRows: unknown[] = [];

vi.mock('@/db', () => ({
  db: {
    select: () => ({
      from: () => ({
        where: () => Promise.resolve(mockRows),
      }),
    }),
  },
}));

const { isDuplicate, normalizeTitle } = await import('@/lib/importer/duplicate-detection');

describe('normalizeTitle', () => {
  it('lowercases, trims, and collapses whitespace', () => {
    expect(normalizeTitle('  Morning   Activation  ')).toBe('morning activation');
  });
});

describe('isDuplicate', () => {
  beforeEach(() => {
    mockRows = [];
  });

  it('flags a routine as a duplicate when a routine with the same normalized name exists', async () => {
    mockRows = [{ name: 'Morning Activation' }];
    const result = await isDuplicate('user-1', {
      category: 'routines',
      name: 'morning   activation',
      description: '',
      timeOfDay: 'morning',
    });
    expect(result).toBe(true);
  });

  it('does not flag a routine as a duplicate when no matching name exists', async () => {
    mockRows = [{ name: 'Evening Wind-down' }];
    const result = await isDuplicate('user-1', {
      category: 'routines',
      name: 'Morning Activation',
      description: '',
      timeOfDay: 'morning',
    });
    expect(result).toBe(false);
  });

  it('flags a calendar template as duplicate only when title, time, AND recurrence all match', async () => {
    mockRows = [{ title: 'Workout Block', startAt: new Date('2026-08-10T17:00:00'), recurrenceDaysOfWeek: ['monday', 'tuesday'] }];

    const sameEverything = await isDuplicate('user-1', {
      category: 'calendar_templates',
      title: 'Workout Block',
      description: '',
      startTime: '17:00',
      durationMinutes: 60,
      daysOfWeek: ['monday', 'tuesday'],
    });
    expect(sameEverything).toBe(true);

    const differentTime = await isDuplicate('user-1', {
      category: 'calendar_templates',
      title: 'Workout Block',
      description: '',
      startTime: '18:00',
      durationMinutes: 60,
      daysOfWeek: ['monday', 'tuesday'],
    });
    expect(differentTime).toBe(false);

    const differentRecurrence = await isDuplicate('user-1', {
      category: 'calendar_templates',
      title: 'Workout Block',
      description: '',
      startTime: '17:00',
      durationMinutes: 60,
      daysOfWeek: ['monday', 'tuesday', 'wednesday'],
    });
    expect(differentRecurrence).toBe(false);
  });

  it('never flags across unrelated categories (e.g. a habit never collides with a task of the same name)', async () => {
    mockRows = [];
    const result = await isDuplicate('user-1', {
      category: 'habits',
      name: 'Hydration',
      description: '',
      frequency: 'daily',
    });
    expect(result).toBe(false);
  });
});
