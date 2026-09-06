import { describe, expect, it } from 'vitest';
import {
  applyAcceptedScenario,
  buildLivingLifeModelSnapshot,
  createGlowActionReceipt,
  createGlowScenario,
} from './living-life-model';

const now = new Date('2026-09-06T19:30:00-04:00');

function makeSnapshot() {
  return buildLivingLifeModelSnapshot({
    generatedAt: now,
    tasks: [
      { id: 'task-1', title: 'Prepare interview materials', status: 'todo', priority: 'high', dueDate: new Date('2026-09-06T20:00:00-04:00') },
    ],
    habits: [
      { id: 'habit-1', name: 'Night routine', completedToday: false },
    ],
    routines: [
      { id: 'routine-1', name: 'Evening reset', timeOfDay: 'evening' },
    ],
    goals: [
      { id: 'goal-1', title: 'Build a calmer week' },
    ],
    events: [
      { id: 'event-1', title: 'Interview', startAt: new Date('2026-09-06T20:30:00-04:00'), allDay: false, source: 'google' },
    ],
    reminders: [
      { id: 'reminder-1', title: 'Bring portfolio', dueAt: new Date('2026-09-06T20:00:00-04:00'), completed: false, listName: 'Work' },
    ],
  });
}

describe('Glow living Life Model', () => {
  it('projects different systems into stable shared Glow Object identities', () => {
    const snapshot = makeSnapshot();
    expect(snapshot.objects.map((object) => object.id)).toEqual(expect.arrayContaining([
      'task:task-1',
      'habit:habit-1',
      'routine:routine-1',
      'goal:goal-1',
      'calendar-event:event-1',
      'reminder:reminder-1',
    ]));
    expect(new Set(snapshot.objects.map((object) => object.id)).size).toBe(snapshot.objects.length);
  });

  it('creates cross-domain Glow Graph relationships when time capacity overlaps', () => {
    const snapshot = makeSnapshot();
    expect(snapshot.relationships).toEqual(expect.arrayContaining([
      expect.objectContaining({
        fromObjectId: 'task:task-1',
        toObjectId: 'calendar-event:event-1',
        type: 'competes-for-time-with',
      }),
      expect.objectContaining({
        fromObjectId: 'routine:routine-1',
        toObjectId: 'calendar-event:event-1',
        type: 'competes-for-time-with',
      }),
    ]));
  });

  it('keeps simulations separate from Current Reality until accepted', () => {
    const snapshot = makeSnapshot();
    const scenario = createGlowScenario({
      kind: 'best-balanced-option',
      title: 'Move interview prep earlier',
      basedOnRealityId: snapshot.reality.id,
      now,
      changes: [{
        objectId: 'task:task-1',
        patch: { state: 'prepared' },
        rationale: 'Protect preparation time before the interview.',
        expectedEffects: ['lower time conflict'],
      }],
    });

    expect(applyAcceptedScenario(snapshot, scenario)).toBe(snapshot);
    const accepted = { ...scenario, status: 'accepted' as const };
    const applied = applyAcceptedScenario(snapshot, accepted);
    expect(applied).not.toBe(snapshot);
    expect(applied.objects.find((object) => object.id === 'task:task-1')?.state).toBe('prepared');
    expect(snapshot.objects.find((object) => object.id === 'task:task-1')?.state).toBe('todo');
  });

  it('clamps receipt confidence and preserves explanation data', () => {
    const receipt = createGlowActionReceipt({
      action: 'reschedule task',
      changedAt: now,
      reasons: ['Interview starts soon'],
      evidence: ['calendar-event:event-1'],
      affectedObjectIds: ['task:task-1'],
      affectedDomains: ['tasks', 'calendar'],
      confidence: 1.4,
      executor: 'planning executor',
      result: 'completed',
      reversible: true,
      undoRef: 'undo:1',
    });

    expect(receipt.confidence).toBe(1);
    expect(receipt.reasons).toContain('Interview starts soon');
    expect(receipt.undoRef).toBe('undo:1');
  });
});
