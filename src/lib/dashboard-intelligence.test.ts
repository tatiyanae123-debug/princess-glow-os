import { describe, expect, it } from 'vitest';
import { chooseBigThree, rankTasks } from './dashboard-intelligence';
import type { PersonalTask } from './personal-context/types';

const now = new Date('2026-10-07T14:00:00-04:00');
const base = (overrides: Partial<PersonalTask>): PersonalTask => ({
  id: 'x',
  title: 'Task',
  description: null,
  status: 'pending',
  priority: 'medium',
  dueDate: null,
  ...overrides,
});

describe('dashboard intelligence', () => {
  it('prioritizes urgent and imminent work', () => {
    const ranked = rankTasks({
      tasks: [
        base({ id: 'low', title: 'Closet cleanup', priority: 'low' }),
        base({ id: 'urgent', title: 'Call dermatologist', priority: 'urgent', dueDate: '2026-10-07T16:00:00-04:00' }),
      ],
      now,
      nextEvent: null,
      energy: 'Medium',
    });
    expect(ranked[0].task.id).toBe('urgent');
    expect(ranked[0].reasons.join(' ')).toMatch(/urgent|24 hours/i);
  });

  it('balances Big 3 across inferred life lanes when real tasks exist', () => {
    const picks = chooseBigThree([
      base({ id: 'career', title: 'Prepare interview answers', priority: 'high' }),
      base({ id: 'body', title: 'Upper body workout', priority: 'medium' }),
      base({ id: 'life', title: 'Open bank account', priority: 'medium' }),
    ], now, null, 'Medium');
    expect(picks.map((pick) => pick.label)).toEqual(['Career', 'Body', 'Life']);
    expect(picks.every((pick) => pick.task)).toBe(true);
  });

  it('does not invent a priority when no source task exists', () => {
    const picks = chooseBigThree([], now, null, null);
    expect(picks.every((pick) => pick.task === null)).toBe(true);
  });
});
