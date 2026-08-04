import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/google/tokens', async () => {
  const actual = await vi.importActual<typeof import('@/lib/google/tokens')>('@/lib/google/tokens');
  return {
    ...actual,
    getValidGoogleAccessToken: vi.fn(),
  };
});

describe('disconnected / degraded account behavior', () => {
  it('Calendar client returns not_connected when there is no stored Google account', async () => {
    const tokens = await import('@/lib/google/tokens');
    (tokens.getValidGoogleAccessToken as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: false, reason: 'not_connected' });
    const { getUpcomingGoogleEvents } = await import('@/lib/google/calendar-client');
    const result = await getUpcomingGoogleEvents('user-without-google');
    expect(result).toEqual({ ok: false, reason: 'not_connected' });
  });

  it('Calendar client maps a revoked token to reason "revoked"', async () => {
    const tokens = await import('@/lib/google/tokens');
    (tokens.getValidGoogleAccessToken as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: false, reason: 'revoked' });
    const { getUpcomingGoogleEvents } = await import('@/lib/google/calendar-client');
    const result = await getUpcomingGoogleEvents('user-revoked');
    expect(result).toEqual({ ok: false, reason: 'revoked' });
  });

  it('Calendar client maps insufficient_scope through unchanged', async () => {
    const tokens = await import('@/lib/google/tokens');
    (tokens.getValidGoogleAccessToken as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: false, reason: 'insufficient_scope' });
    const { getUpcomingGoogleEvents } = await import('@/lib/google/calendar-client');
    const result = await getUpcomingGoogleEvents('user-missing-scope');
    expect(result).toEqual({ ok: false, reason: 'insufficient_scope' });
  });

  it('Gmail client returns not_connected when there is no stored Google account', async () => {
    const tokens = await import('@/lib/google/tokens');
    (tokens.getValidGoogleAccessToken as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: false, reason: 'not_connected' });
    const { getRecentInboxMessages } = await import('@/lib/google/gmail-client');
    const result = await getRecentInboxMessages('user-without-google');
    expect(result).toEqual({ ok: false, reason: 'not_connected' });
  });

  it('Gmail client maps missing_refresh_token to "revoked" (must reconnect either way)', async () => {
    const tokens = await import('@/lib/google/tokens');
    (tokens.getValidGoogleAccessToken as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: false, reason: 'missing_refresh_token' });
    const { getRecentInboxMessages } = await import('@/lib/google/gmail-client');
    const result = await getRecentInboxMessages('user-no-refresh-token');
    expect(result).toEqual({ ok: false, reason: 'revoked' });
  });
});
