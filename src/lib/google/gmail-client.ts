import 'server-only';

import { getValidGoogleAccessToken, REQUIRED_SCOPES } from '@/lib/google/tokens';

const GMAIL_API_BASE = 'https://gmail.googleapis.com/gmail/v1/users/me';
const MAX_RESULTS = 10;
// Excludes spam, trash, and the Promotions tab by default.
const INBOX_QUERY = '-in:spam -in:trash -category:promotions';

export type NormalizedGmailMessage = {
  id: string;
  threadId: string;
  from: string;
  subject: string;
  date: Date | null;
  snippet: string;
  unread: boolean;
};

export type GmailFetchResult =
  | { ok: true; messages: NormalizedGmailMessage[]; unreadCount: number }
  | { ok: false; reason: 'not_connected' | 'insufficient_scope' | 'expired' | 'revoked' | 'error' };

function findHeader(headers: { name: string; value: string }[] | undefined, name: string) {
  return headers?.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? '';
}

export function parseMessageMetadata(data: {
  id: string;
  threadId: string;
  snippet?: string;
  labelIds?: string[];
  payload?: { headers?: { name: string; value: string }[] };
}): NormalizedGmailMessage {
  const headers = data.payload?.headers;
  const dateHeader = findHeader(headers, 'Date');

  return {
    id: data.id,
    threadId: data.threadId,
    from: findHeader(headers, 'From'),
    subject: findHeader(headers, 'Subject') || '(No subject)',
    date: dateHeader ? new Date(dateHeader) : null,
    snippet: data.snippet ?? '',
    unread: (data.labelIds ?? []).includes('UNREAD'),
  };
}

async function fetchMessageMetadata(accessToken: string, id: string): Promise<NormalizedGmailMessage | null> {
  const params = new URLSearchParams({ format: 'metadata' });
  params.append('metadataHeaders', 'From');
  params.append('metadataHeaders', 'Subject');
  params.append('metadataHeaders', 'Date');

  const response = await fetch(`${GMAIL_API_BASE}/messages/${id}?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!response.ok) return null;

  const data = (await response.json()) as Parameters<typeof parseMessageMetadata>[0];
  return parseMessageMetadata(data);
}

/**
 * Reads a bounded set of recent inbox message metadata only — never the
 * full message body, and never a raw Authorization header value is
 * returned to callers. Excludes spam/trash/promotions by default.
 * Read-only: no send, delete, archive, forward, or label action exists
 * anywhere in this module.
 */
export async function getRecentInboxMessages(userId: string): Promise<GmailFetchResult> {
  const token = await getValidGoogleAccessToken(userId, REQUIRED_SCOPES.gmail);
  if (!token.ok) {
    if (token.reason === 'not_connected') return { ok: false, reason: 'not_connected' };
    if (token.reason === 'insufficient_scope') return { ok: false, reason: 'insufficient_scope' };
    if (token.reason === 'revoked' || token.reason === 'missing_refresh_token') return { ok: false, reason: 'revoked' };
    return { ok: false, reason: 'error' };
  }

  const listParams = new URLSearchParams({ q: INBOX_QUERY, maxResults: String(MAX_RESULTS) });

  try {
    const listResponse = await fetch(`${GMAIL_API_BASE}/messages?${listParams.toString()}`, {
      headers: { Authorization: `Bearer ${token.accessToken}` },
      cache: 'no-store',
    });

    if (listResponse.status === 401) return { ok: false, reason: 'revoked' };
    if (listResponse.status === 403) return { ok: false, reason: 'insufficient_scope' };
    if (!listResponse.ok) return { ok: false, reason: 'error' };

    const listData = (await listResponse.json()) as { messages?: { id: string }[] };
    const ids = (listData.messages ?? []).map((m) => m.id);

    const messages = (
      await Promise.all(ids.map((id) => fetchMessageMetadata(token.accessToken, id)))
    ).filter((m): m is NormalizedGmailMessage => m !== null);

    return { ok: true, messages, unreadCount: messages.filter((m) => m.unread).length };
  } catch {
    return { ok: false, reason: 'error' };
  }
}
