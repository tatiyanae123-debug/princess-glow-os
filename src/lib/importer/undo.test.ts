import { describe, it, expect, vi, beforeEach } from 'vitest';

const updateCalls: { values: unknown }[] = [];
let selectResult: unknown[] = [];
let updateReturningResult: unknown[] = [];

function makeUpdateChain() {
  return {
    set: (values: unknown) => ({
      where: () => {
        updateCalls.push({ values });
        return {
          returning: () => Promise.resolve(updateReturningResult),
          then: (resolve: (v: unknown) => void) => resolve(undefined),
        };
      },
    }),
  };
}

vi.mock('@/db', () => ({
  db: {
    select: () => ({
      from: () => ({
        where: () => Promise.resolve(selectResult),
      }),
    }),
    update: () => makeUpdateChain(),
  },
}));

const { undoImportBatch } = await import('@/lib/importer/confirm');

describe('undoImportBatch', () => {
  beforeEach(() => {
    updateCalls.length = 0;
    selectResult = [];
    updateReturningResult = [];
  });

  it('returns null when the batch does not exist (nothing to undo)', async () => {
    selectResult = [];
    const result = await undoImportBatch('user-1', 'nonexistent-batch');
    expect(result).toBeNull();
  });

  it('returns null when the batch is already undone (guards against double-undo)', async () => {
    selectResult = [{ id: 'batch-1', userId: 'user-1', status: 'undone' }];
    const result = await undoImportBatch('user-1', 'batch-1');
    expect(result).toBeNull();
  });

  it('archives records across all target tables and flips the batch to "undone" for a confirmed batch', async () => {
    selectResult = [{ id: 'batch-1', userId: 'user-1', status: 'confirmed' }];
    updateReturningResult = [{ id: 'batch-1', status: 'undone', undoneAt: new Date() }];

    const result = await undoImportBatch('user-1', 'batch-1');

    expect(result).not.toBeNull();
    expect(result?.status).toBe('undone');
    // Five archive updates (routines/habits/tasks/beauty_routines/calendar_events) + one batch-status update
    expect(updateCalls.length).toBe(6);
    expect(updateCalls.every((call) => (call.values as { archived?: boolean; status?: string }).archived === true || (call.values as { status?: string }).status === 'undone')).toBe(true);
  });
});
