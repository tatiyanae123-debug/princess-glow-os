import { describe, it, expect, vi, beforeEach } from 'vitest';

const insertedValues: unknown[] = [];
let existingTask: unknown = null;

vi.mock('@/db', () => ({
  db: {
    insert: () => ({
      values: (values: unknown) => {
        insertedValues.push(values);
        return {
          returning: () => Promise.resolve([{ id: 'new-task-id', ...(values as object) }]),
        };
      },
    }),
  },
}));

vi.mock('@/lib/data/tasks', () => ({
  getTaskByGmailMessageId: vi.fn(() => Promise.resolve(existingTask)),
}));

const { createTaskFromEmail } = await import('@/lib/gmail/create-task');

describe('createTaskFromEmail', () => {
  beforeEach(() => {
    insertedValues.length = 0;
    existingTask = null;
  });

  it('successfully creates a normal task with the expected fields', async () => {
    const result = await createTaskFromEmail('user-1', {
      messageId: 'msg-abc',
      threadId: 'thread-abc',
      subject: 'Follow up on invoice',
      from: 'billing@example.com',
      snippet: 'Please review the attached invoice.',
    });

    expect(result.created).toBe(true);
    expect(result.task).toMatchObject({
      title: 'Follow up on invoice',
      status: 'pending',
      priority: 'medium',
    });
    expect(insertedValues).toHaveLength(1);
  });

  it('preserves the Gmail message ID and thread ID as source metadata on the created task', async () => {
    await createTaskFromEmail('user-1', {
      messageId: 'msg-xyz',
      threadId: 'thread-xyz',
      subject: 'Test',
      from: 'sender@example.com',
      snippet: 'hi',
    });

    expect(insertedValues[0]).toMatchObject({
      source: 'gmail',
      sourceMessageId: 'msg-xyz',
      sourceThreadId: 'thread-xyz',
    });
  });

  it('prevents duplicate task creation for the same Gmail message', async () => {
    existingTask = { id: 'already-exists', title: 'Follow up on invoice', sourceMessageId: 'msg-abc' };

    const result = await createTaskFromEmail('user-1', {
      messageId: 'msg-abc',
      threadId: 'thread-abc',
      subject: 'Follow up on invoice',
      from: 'billing@example.com',
      snippet: 'Please review the attached invoice.',
    });

    expect(result.created).toBe(false);
    expect(result.task).toEqual(existingTask);
    // No insert should have happened — the existing task was returned instead.
    expect(insertedValues).toHaveLength(0);
  });

  it('includes the sender and snippet in the task description without altering the original email content', async () => {
    await createTaskFromEmail('user-1', {
      messageId: 'msg-desc',
      threadId: 'thread-desc',
      subject: 'Test',
      from: 'sender@example.com',
      snippet: 'Original snippet text.',
    });

    const inserted = insertedValues[0] as { description?: string };
    expect(inserted.description).toContain('sender@example.com');
    expect(inserted.description).toContain('Original snippet text.');
  });
});
