import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { hasScope, isExpired, refreshAccessToken, REQUIRED_SCOPES } from '@/lib/google/tokens';

describe('hasScope', () => {
  it('returns true when the required scope is present', () => {
    expect(hasScope('openid email ' + REQUIRED_SCOPES.calendar, REQUIRED_SCOPES.calendar)).toBe(true);
  });

  it('returns false when the required scope is missing (insufficient permissions)', () => {
    expect(hasScope('openid email profile', REQUIRED_SCOPES.calendar)).toBe(false);
  });

  it('returns false for a null/absent scope string', () => {
    expect(hasScope(null, REQUIRED_SCOPES.gmail)).toBe(false);
  });
});

describe('isExpired', () => {
  it('treats a null expiry as expired (absent token)', () => {
    expect(isExpired(null)).toBe(true);
  });

  it('treats a timestamp far in the future as not expired', () => {
    const future = Math.floor(Date.now() / 1000) + 3600;
    expect(isExpired(future)).toBe(false);
  });

  it('treats a timestamp within the refresh buffer as expired', () => {
    const almostNow = Math.floor(Date.now() / 1000) + 10; // inside the 60s buffer
    expect(isExpired(almostNow)).toBe(true);
  });

  it('treats a timestamp in the past as expired', () => {
    const past = Math.floor(Date.now() / 1000) - 100;
    expect(isExpired(past)).toBe(true);
  });
});

describe('refreshAccessToken', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env.PRINCESS_GOOGLE_CLIENT_ID = 'test-client-id';
    process.env.PRINCESS_GOOGLE_CLIENT_SECRET = 'test-client-secret';
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('succeeds and returns a new access token + expiry when Google responds 200', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ access_token: 'new-access-token', expires_in: 3600, scope: REQUIRED_SCOPES.calendar }),
    }) as unknown as typeof fetch;

    const result = await refreshAccessToken('valid-refresh-token');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.accessToken).toBe('new-access-token');
      expect(result.scope).toBe(REQUIRED_SCOPES.calendar);
      expect(result.expiresAt).toBeGreaterThan(Math.floor(Date.now() / 1000));
    }
  });

  it('reports "revoked" when Google returns 400 invalid_grant (revoked access)', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: 'invalid_grant' }),
    }) as unknown as typeof fetch;

    const result = await refreshAccessToken('revoked-refresh-token');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('revoked');
  });

  it('reports "revoked" on a 401 response as well', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 401, json: async () => ({}) }) as unknown as typeof fetch;
    const result = await refreshAccessToken('bad-token');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('revoked');
  });

  it('reports "network_error" when the request throws (e.g. offline)', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network down')) as unknown as typeof fetch;
    const result = await refreshAccessToken('any-token');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('network_error');
  });

  it('reports "network_error" on a non-400/401 failure status (e.g. 500)', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({}) }) as unknown as typeof fetch;
    const result = await refreshAccessToken('any-token');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('network_error');
  });

  it('never includes the refresh token value in the returned failure result', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 400, json: async () => ({}) }) as unknown as typeof fetch;
    const result = await refreshAccessToken('super-secret-refresh-token-value');
    expect(JSON.stringify(result)).not.toContain('super-secret-refresh-token-value');
  });
});
