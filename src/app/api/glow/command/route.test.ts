import { beforeEach, describe, expect, it, vi } from 'vitest';

const deps = vi.hoisted(() => ({
  auth: vi.fn(),
  createTask: vi.fn(),
  createNote: vi.fn(),
  readKernelScenario: vi.fn(),
  claimKernelScenario: vi.fn(),
  readScenarioOutcome: vi.fn(),
  recordKernelReceipt: vi.fn(),
  interpret: vi.fn(),
}));

vi.mock('@/auth', () => ({ auth: deps.auth }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/data/tasks', () => ({ createTask: deps.createTask }));
vi.mock('@/lib/data/notes', () => ({ createNote: deps.createNote }));
vi.mock('@/lib/intelligence/glow-semantic-intent', () => ({ interpretGlowUtterance: deps.interpret }));
vi.mock('@/lib/intelligence/universal-intake', () => ({ ingestText: vi.fn(), classifyUniversalInput: vi.fn() }));
vi.mock('@/lib/intelligence/living-kernel', () => ({ getLivingKernelContext: vi.fn(), kernelContextPrompt: vi.fn() }));
vi.mock('@/lib/intelligence/living-kernel-sync', () => ({ markLivingKernelDirty: vi.fn(), syncLivingLifeModel: vi.fn() }));
vi.mock('@/lib/intelligence/living-kernel-registry', () => ({
  canonicalGlowObjectId: (kind: string, id: string) => kind + ':' + id,
  claimKernelScenario: deps.claimKernelScenario,
  readKernelScenario: deps.readKernelScenario,
  readScenarioOutcome: deps.readScenarioOutcome,
  recordKernelReceipt: deps.recordKernelReceipt,
}));

import { POST } from './route';

const scenario = { id: 'scenario-1', status: 'draft', sourceRoute: '/today', sourceText: 'Make a task and a note', confidence: .8 };
const changes = [
  { actionType: 'note', patch: { title: 'Studio note', position: 1, sourceText: 'Note from saved draft' } },
  { actionType: 'task', patch: { title: 'Send studio brief', position: 0 } },
];
const approve = (overrides = {}) => POST(new Request('http://localhost/api/glow/command', {
  method: 'POST',
  body: JSON.stringify({ approved: true, text: scenario.sourceText, scenarioId: scenario.id, selectedChanges: [0], ...overrides }),
}));

beforeEach(() => {
  vi.resetAllMocks();
  deps.auth.mockResolvedValue({ user: { id: 'owner' } });
  deps.readKernelScenario.mockResolvedValue({ scenario, changes: [...changes] });
  deps.claimKernelScenario.mockResolvedValue({ id: scenario.id });
  deps.createTask.mockResolvedValue({ id: 'task-1', title: 'Send studio brief' });
  deps.recordKernelReceipt.mockResolvedValue('receipt-1');
});

describe('Shakti scenario approval', () => {
  it('executes the selected saved change, without interpreting the request again', async () => {
    const response = await approve();
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ scenarioId: scenario.id, receipt: { id: 'receipt-1', status: 'completed' } });
    expect(deps.claimKernelScenario).toHaveBeenCalledWith('owner', scenario.id, 'accepted');
    expect(deps.createTask).toHaveBeenCalledOnce();
    expect(deps.createNote).not.toHaveBeenCalled();
    expect(deps.interpret).not.toHaveBeenCalled();
  });

  it('reuses the original receipt when approval is retried', async () => {
    deps.claimKernelScenario.mockResolvedValue(null);
    deps.readScenarioOutcome.mockResolvedValue({ id: 'receipt-1', result: 'completed', action: 'Saved', details: { status: 'completed' } });
    const response = await approve();
    expect(await response.json()).toMatchObject({ scenarioId: scenario.id, receipt: { id: 'receipt-1' } });
    expect(deps.createTask).not.toHaveBeenCalled();
    expect(deps.recordKernelReceipt).not.toHaveBeenCalled();
  });

  it('rejects approval if the saved request or selection does not match', async () => {
    expect((await approve({ text: 'Changed request' })).status).toBe(404);
    expect((await approve({ scenarioId: '' })).status).toBe(400);
    expect((await approve({ selectedChanges: [2] })).status).toBe(400);
    expect(deps.claimKernelScenario).not.toHaveBeenCalled();
  });

  it('reports partial execution with the original scenario ID', async () => {
    deps.createNote.mockRejectedValue(new Error('Test failure'));
    const response = await approve({ selectedChanges: [0, 1] });
    expect(await response.json()).toMatchObject({
      scenarioId: scenario.id,
      receipt: { status: 'partially-completed', failed: ['Studio note'], needsAttention: true },
    });
  });
});
