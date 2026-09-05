import 'server-only';

import { db } from '@/db';
import { accounts } from '@/db/schema/auth';
import { eq, and } from 'drizzle-orm';

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_REVOKE_URL = 'https://oauth2.googleapis.com/revoke';
const EXPIRY_BUFFER_SECONDS = 60;

export const REQUIRED_SCOPES = {
  calendar: 'https://www.googleapis.com/auth/calendar.readonly',
  gmail: 'https://www.googleapis.com/auth/gmail.readonly',
  contacts: 'https://www.googleapis.com/auth/contacts.readonly',
} as const;

export type GoogleTokenFailureReason =
  | 'not_connected'
  | 'missing_refresh_token'
  | 'revoked'
  | 'insufficient_scope'
  | 'network_error';

export type GoogleTokenResult =
  | { ok: true; accessToken: string; scope: string }
  | { ok: false; reason: GoogleTokenFailureReason };

async function getGoogleAccount(userId: string) {
  const [account] = await db
    .select()
    .from(accounts)
    .where(and(eq(accounts.userId, userId), eq(accounts.provider, 'google')));
  return account ?? null;
}

export function hasScope(scope: string | null, required: string) {
  if (!scope) return false;
  return scope.split(' ').includes(required);
}

export function isExpired(expiresAt: number | null) {
  if (expiresAt === null) return true;
  const nowSeconds = Math.floor(Date.now() / 1000);
  return expiresAt <= nowSeconds + EXPIRY_BUFFER_SECONDS;
}

export async function refreshAccessToken(refreshToken: string): Promise<
  | { ok: true; accessToken: string; expiresAt: number; scope: string | null }
  | { ok: false; reason: 'revoked' | 'network_error' }
> {
  try {
    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.PRINCESS_GOOGLE_CLIENT_ID ?? '',
        client_secret: process.env.PRINCESS_GOOGLE_CLIENT_SECRET ?? '',
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      if (response.status === 400 || response.status === 401) return { ok: false, reason: 'revoked' };
      return { ok: false, reason: 'network_error' };
    }

    const data = (await response.json()) as { access_token: string; expires_in: number; scope?: string };
    return {
      ok: true,
      accessToken: data.access_token,
      expiresAt: Math.floor(Date.now() / 1000) + data.expires_in,
      scope: data.scope ?? null,
    };
  } catch {
    return { ok: false, reason: 'network_error' };
  }
}

/** Stored scope metadata may lag behind a newly-granted token. The Google API
 * being called is the authority, so callers are allowed to test the token and
 * remember a successful scope afterwards instead of being trapped in a loop. */
export async function getValidGoogleAccessToken(
  userId: string,
  requiredScope?: string,
): Promise<GoogleTokenResult> {
  const account = await getGoogleAccount(userId);
  if (!account) return { ok: false, reason: 'not_connected' };
  void requiredScope;

  if (account.access_token && !isExpired(account.expires_at)) {
    return { ok: true, accessToken: account.access_token, scope: account.scope ?? '' };
  }
  if (!account.refresh_token) return { ok: false, reason: 'missing_refresh_token' };

  const refreshed = await refreshAccessToken(account.refresh_token);
  if (!refreshed.ok) return { ok: false, reason: refreshed.reason };

  await db
    .update(accounts)
    .set({ access_token: refreshed.accessToken, expires_at: refreshed.expiresAt, scope: refreshed.scope ?? account.scope })
    .where(and(eq(accounts.userId, userId), eq(accounts.provider, 'google')));

  return { ok: true, accessToken: refreshed.accessToken, scope: refreshed.scope ?? account.scope ?? '' };
}

export async function rememberGoogleScope(userId: string, scope: string) {
  const account = await getGoogleAccount(userId);
  if (!account) return;
  const scopes = new Set((account.scope ?? '').split(' ').filter(Boolean));
  if (scopes.has(scope)) return;
  scopes.add(scope);
  await db
    .update(accounts)
    .set({ scope: Array.from(scopes).join(' ') })
    .where(and(eq(accounts.userId, userId), eq(accounts.provider, 'google')));
}

export type GoogleConnectionStatus = {
  connected: boolean;
  email: string | null;
  grantedScopes: string[];
  hasCalendarScope: boolean;
  hasGmailScope: boolean;
  tokenExpiresAt: Date | null;
  needsReauthorization: boolean;
};

export async function getGoogleConnectionStatus(userId: string): Promise<GoogleConnectionStatus> {
  const account = await getGoogleAccount(userId);
  if (!account) {
    return {
      connected: false,
      email: null,
      grantedScopes: [],
      hasCalendarScope: false,
      hasGmailScope: false,
      tokenExpiresAt: null,
      needsReauthorization: false,
    };
  }
  const grantedScopes = account.scope ? account.scope.split(' ') : [];
  return {
    connected: true,
    email: null,
    grantedScopes,
    hasCalendarScope: grantedScopes.includes(REQUIRED_SCOPES.calendar),
    hasGmailScope: grantedScopes.includes(REQUIRED_SCOPES.gmail),
    tokenExpiresAt: account.expires_at ? new Date(account.expires_at * 1000) : null,
    needsReauthorization: !account.refresh_token && isExpired(account.expires_at),
  };
}

export async function disconnectGoogleAccount(userId: string): Promise<{ ok: boolean }> {
  const account = await getGoogleAccount(userId);
  if (!account) return { ok: true };

  if (account.access_token) {
    try {
      await fetch(`${GOOGLE_REVOKE_URL}?token=${encodeURIComponent(account.access_token)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
    } catch {
      // Best-effort only. Stored access is removed below either way.
    }
  }

  await db.delete(accounts).where(and(eq(accounts.userId, userId), eq(accounts.provider, 'google')));
  return { ok: true };
}
