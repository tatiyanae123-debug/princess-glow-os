import { describe, expect, it } from 'vitest';
import { getPlanningRuleDayEnd } from './planning-rule-constraints';

describe('getPlanningRuleDayEnd', () => {
  const now = new Date('2026-08-12T10:00:00');

  it('uses the earliest enabled high-priority scheduling cutoff', () => {
    const result = getPlanningRuleDayEnd([
      { enabled: true, ruleType: 'scheduling', priority: 80, title: 'Do not schedule after 9 PM' },
      { enabled: true, ruleType: 'time', priority: 70, title: 'Never plan anything after 8:30 PM' },
    ], now);

    expect(result?.getHours()).toBe(20);
    expect(result?.getMinutes()).toBe(30);
  });

  it('ignores disabled, low-priority, and domain-specific rules', () => {
    const result = getPlanningRuleDayEnd([
      { enabled: false, ruleType: 'scheduling', priority: 90, title: 'Do not schedule after 7 PM' },
      { enabled: true, ruleType: 'scheduling', priority: 20, title: 'Do not schedule after 6 PM' },
      { enabled: true, ruleType: 'fitness', priority: 90, title: 'Never schedule workouts after 8 PM' },
    ], now);

    expect(result).toBeNull();
  });
});
