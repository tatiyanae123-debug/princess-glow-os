import { describe, it, expect } from 'vitest';
import { parseMessageMetadata } from '@/lib/google/gmail-client';

describe('parseMessageMetadata (Gmail normalization)', () => {
  it('extracts from/subject/date from headers and marks unread correctly', () => {
    const result = parseMessageMetadata({
      id: 'msg-1',
      threadId: 'thread-1',
      snippet: 'Hey, following up on...',
      labelIds: ['INBOX', 'UNREAD'],
      payload: {
        headers: [
          { name: 'From', value: 'sender@example.com' },
          { name: 'Subject', value: 'Follow up' },
          { name: 'Date', value: 'Mon, 10 Aug 2026 10:00:00 -0400' },
        ],
      },
    });

    expect(result.from).toBe('sender@example.com');
    expect(result.subject).toBe('Follow up');
    expect(result.unread).toBe(true);
    expect(result.date).toBeInstanceOf(Date);
  });

  it('marks read messages (no UNREAD label) correctly', () => {
    const result = parseMessageMetadata({ id: 'msg-2', threadId: 'thread-2', labelIds: ['INBOX'] });
    expect(result.unread).toBe(false);
  });

  it('falls back to "(No subject)" when the Subject header is missing', () => {
    const result = parseMessageMetadata({ id: 'msg-3', threadId: 'thread-3', payload: { headers: [] } });
    expect(result.subject).toBe('(No subject)');
  });

  it('never surfaces a raw Authorization header value — only normalized fields exist on the result', () => {
    const result = parseMessageMetadata({ id: 'msg-4', threadId: 'thread-4' });
    expect(Object.keys(result)).toEqual(['id', 'threadId', 'from', 'subject', 'date', 'snippet', 'unread']);
  });
});

describe('Gmail remains read-only', () => {
  it('the Gmail client module exposes no send/delete/archive/label/forward capability', async () => {
    const gmailClient = await import('@/lib/google/gmail-client');
    const exportedNames = Object.keys(gmailClient).map((name) => name.toLowerCase());
    const forbiddenPatterns = ['send', 'delete', 'archive', 'label', 'forward', 'modify', 'trash'];
    for (const pattern of forbiddenPatterns) {
      expect(exportedNames.some((name) => name.includes(pattern))).toBe(false);
    }
  });

  it('"Create task from email" only imports read-only Gmail normalization, not the Gmail client itself', async () => {
    // Regression guard: the create-task module should have no reason to
    // import the Gmail API client at all — it only receives already-fetched
    // message fields as plain input, so it can never call Gmail's write
    // endpoints even indirectly.
    const source = await import('node:fs/promises').then((fs) =>
      fs.readFile(new URL('../gmail/create-task.ts', import.meta.url), 'utf-8'),
    );
    expect(source).not.toMatch(/gmail-client/);
  });
});
