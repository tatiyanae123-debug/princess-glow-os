import { describe, it, expect, vi, beforeEach } from 'vitest';

const createTaskFromEmailMock = vi.fn();

vi.mock('@/lib/gmail/create-task', () => ({
  createTaskFromEmail: createTaskFromEmailMock,
}));

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`);
  }),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('createTaskFromEmailAction — missing user session', () => {
  beforeEach(() => {
    createTaskFromEmailMock.mockReset();
  });

  it('redirects to sign-in and never attempts to create a task when there is no session', async () => {
    const { auth } = await import('@/auth');
    (auth as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const { createTaskFromEmailAction } = await import('@/app/actions/gmail-task');

    await expect(
      createTaskFromEmailAction({ messageId: 'm1', threadId: 't1', subject: 'Test', from: 'a@b.com', snippet: 'hi' }),
    ).rejects.toThrow('REDIRECT:/sign-in');

    expect(createTaskFromEmailMock).not.toHaveBeenCalled();
  });

  it('proceeds to create a task when a valid session exists', async () => {
    const { auth } = await import('@/auth');
    (auth as ReturnType<typeof vi.fn>).mockResolvedValue({ user: { id: 'user-1' } });
    createTaskFromEmailMock.mockResolvedValue({ task: { id: 'task-1' }, created: true });

    const { createTaskFromEmailAction } = await import('@/app/actions/gmail-task');

    const result = await createTaskFromEmailAction({ messageId: 'm1', threadId: 't1', subject: 'Test', from: 'a@b.com', snippet: 'hi' });

    expect(createTaskFromEmailMock).toHaveBeenCalledWith('user-1', expect.objectContaining({ messageId: 'm1' }));
    expect(result.data?.created).toBe(true);
  });
});
