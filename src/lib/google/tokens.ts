import 'server-only';

import { db } from '@/db';
import { accounts } from '@/db/schema/auth';
import { eq, and } from 'drizzle-orm';

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_REVOKE_URL = 'https://oauth2.googleapis.com/revoke';

// Refresh proactively if the token expires within this window, so a request
// never starts with a token that's about to die mid-flight.
const EXPIRY_BUFFER_SECONDS = 60;

export const REQUIRED_SCOPES = {
  calendar: 'https://www.googleapis.com/auth/calendar.readonly',
  gmail: 'https://www.googleapis.com/auth/gmail.readonly',
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
      // Google returns 400 invalid_grant when the refresh token was revoked
      // or expired. Never log the response body — it can echo back token
      // material — only the status code.
      if (response.status === 400 || response.status === 401) {
        return { ok: false, reason: 'revoked' };
      }
      return { ok: false, reason: 'network_error' };
    }

    const data = (await response.json()) as {
      access_token: string;
      expires_in: number;
      scope?: string;
    };

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

/**
 * Returns a valid Google access token for the given user, refreshing it
 * against the stored refresh_token if it's missing or near expiry.
 * Never logs or returns the refresh token. Callers get back either a
 * usable access token or a specific, user-safe failure reason — never a
 * thrown error with token contents in it.
 */
export async function getValidGoogleAccessToken(
  userId: string,
  requiredScope?: string,
): Promise<GoogleTokenResult> {
  const account = await getGoogleAccount(userId);
  if (!account) return { ok: false, reason: 'not_connected' };

  if (requiredScope && !hasScope(account.scope, requiredScope)) {
    return { ok: false, reason: 'insufficient_scope' };
  }

  if (account.access_token && !isExpired(account.expires_at)) {
    return { ok: true, accessToken: account.access_token, scope: account.scope ?? '' };
  }

  if (!account.refresh_token) {
    return { ok: false, reason: 'missing_refresh_token' };
  }

  const refreshed = await refreshAccessToken(account.refresh_token);
  if (!refreshed.ok) {
    return { ok: false, reason: refreshed.reason };
  }

  await db
    .update(accounts)
    .set({
      access_token: refreshed.accessToken,
      expires_at: refreshed.expiresAt,
      scope: refreshed.scope ?? account.scope,
    })
    .where(and(eq(accounts.userId, userId), eq(accounts.provider, 'google')));

  return { ok: true, accessToken: refreshed.accessToken, scope: refreshed.scope ?? account.scope ?? '' };
}

export type GoogleConnectionStatus = {
  connected: boolean;
  email: string | null;
  grantedScopes: string[];
  hasCalendarScope: boolean;
  hasGmailScope: boolean;
  tokenExpiresAt: Date | null;
};

/**
 * Read-only connection status for the Connections page and dashboard.
 * Does not refresh or return any token value.
 */
export async function getGoogleConnectionStatus(userId: string): Promise<GoogleConnectionStatus> {
  const account = await getGoogleAccount(userId);
  if (!account) {
    return { connected: false, email: null, grantedScopes: [], hasCalendarScope: false, hasGmailScope: false, tokenExpiresAt: null };
  }
  const grantedScopes = account.scope ? account.scope.split(' ') : [];
  return {
    connected: true,
    email: null, // pulled from the users table by the caller if needed
    grantedScopes,
    hasCalendarScope: grantedScopes.includes(REQUIRED_SCOPES.calendar),
    hasGmailScope: grantedScopes.includes(REQUIRED_SCOPES.gmail),
    tokenExpiresAt: account.expires_at ? new Date(account.expires_at * 1000) : null,
  };
}

/**
 * Disconnects Google: best-effort revoke with Google, then removes only
 * the stored Google account/token row. Never touches the user record or
 * any Glow OS data (tasks, habits, routines, etc.).
 */
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
      // Best-effort — even if Google's revoke call fails (e.g. network
      // blip), we still remove our stored copy below so Glow OS stops
      // using it either way.
    }
  }

  await db.delete(accounts).where(and(eq(accounts.userId, userId), eq(accounts.provider, 'google')));
  return { ok: true };
}
