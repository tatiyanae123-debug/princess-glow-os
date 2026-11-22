import { describe, expect, it } from 'vitest';
import {
  emptyPlannerDocument,
  movePlannerKey,
  parsePlannerDocument,
  plannerPeriodBounds,
  plannerProgress,
} from '@/lib/planning/planner-templates-v1';

describe('Planner Templates V1', () => {
  it('moves month and day keys without losing calendar semantics', () => {
    expect(movePlannerKey('month', '2026-12', 1)).toBe('2027-01');
    expect(movePlannerKey('today', '2026-09-15', 1)).toBe('2026-09-16');
  });

  it('preserves planner values through the stored JSON document', () => {
    const doc = emptyPlannerDocument('today', '2026-09-15');
    doc.values.focus = 'Finish the planner';
    const parsed = parsePlannerDocument(JSON.stringify(doc), 'today', '2026-09-15');
    expect(parsed.values.focus).toBe('Finish the planner');
  });

  it('calculates completion from populated priority fields only', () => {
    const doc = emptyPlannerDocument('week', '2026-W38');
    doc.values.driver1 = 'Protect Monday';
    doc.values.driver2 = 'Finish the draft';
    doc.values.driver1Done = true;
    expect(plannerProgress(doc)).toBe(50);
  });

  it('creates period bounds for a month', () => {
    const { start, end } = plannerPeriodBounds('month', '2026-02');
    expect(start.getMonth()).toBe(1);
    expect(end.getDate()).toBe(28);
  });
});
