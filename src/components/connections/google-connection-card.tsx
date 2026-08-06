'use client';

import { CheckCircle2, XCircle, ShieldOff } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useServerAction } from '@/lib/hooks/use-server-action';
import { disconnectGoogleAction, reconnectGoogleAction, syncGoogleCalendarAction } from '@/app/actions/connections';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { ConnectionsOverview } from '@/lib/data/connections';

const SCOPE_LABELS: Record<string, string> = {
  openid: 'Sign-in identity',
  email: 'Email address',
  profile: 'Basic profile',
  'https://www.googleapis.com/auth/calendar.readonly': 'Calendar (read-only)',
  'https://www.googleapis.com/auth/gmail.readonly': 'Gmail (read-only)',
};

export function GoogleConnectionCard({ overview }: { overview: ConnectionsOverview }) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const disconnect = useServerAction(disconnectGoogleAction);
  const sync = useServerAction(syncGoogleCalendarAction);

  function handleDisconnect() {
    disconnect.run(undefined, () => {
      setConfirmOpen(false);
      router.refresh();
    });
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: 'var(--glow-text-muted)' }}>
            Google
          </p>
          <h2 className="mt-2 text-xl font-semibold" style={{ color: 'var(--glow-text)' }}>
            Calendar + Gmail
          </h2>
        </div>
        <span
          className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
          style={
            overview.connected
              ? { background: 'rgb(16 185 129 / 0.12)', color: 'rgb(5 150 105)' }
              : { background: 'var(--glow-surface-muted)', color: 'var(--glow-text-muted)' }
          }
        >
          {overview.connected ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
          {overview.calendarState === 'needs_reauthorization' ? 'Needs reauthorization' : overview.calendarState === 'error' ? 'Error' : overview.connected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {overview.connected ? (
        <>
          <div className="space-y-1 text-sm" style={{ color: 'var(--glow-text-muted)' }}>
            {overview.email && <p>Account: {overview.email}</p>}
            <p>
              Calendar access: {overview.hasCalendarScope ? 'granted' : 'not granted'} · Gmail access:{' '}
              {overview.hasGmailScope ? 'granted' : 'not granted'}
            </p>
            {overview.tokenExpiresAt && (
              <p>Token refreshes automatically · next check {overview.tokenExpiresAt.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' })}</p>
            )}
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.15em]" style={{ color: 'var(--glow-text-muted)' }}>
              Granted permissions
            </p>
            <div className="flex flex-wrap gap-1.5">
              {overview.grantedScopes.map((scope) => (
                <span
                  key={scope}
                  className="rounded-full px-2.5 py-1 text-xs"
                  style={{ background: 'var(--glow-accent-soft)', color: 'var(--glow-accent)' }}
                >
                  {SCOPE_LABELS[scope] ?? scope}
                </span>
              ))}
            </div>
          </div>

          {(!overview.hasCalendarScope || !overview.hasGmailScope) && (
            <div
              className="rounded-2xl border p-3 text-sm"
              style={{ borderColor: 'var(--glow-border)', background: 'var(--glow-accent-soft)', color: 'var(--glow-text)' }}
            >
              Some permissions weren&rsquo;t granted. Reconnect and approve calendar and Gmail access to enable those features.
            </div>
          )}

          {disconnect.error && <p className="text-sm text-rose-500">{disconnect.error}</p>}

          <div className="flex flex-wrap gap-2">
            <Button type="button" disabled={sync.isPending || !overview.hasCalendarScope} onClick={() => { setSyncMessage(null); sync.run({ intent: 'sync' }, (result) => { setSyncMessage(`${result.status === 'partial' ? 'Partial sync completed' : 'Sync complete'} · ${result.count} events checked.`); router.refresh(); }); }}>
              {sync.isPending ? 'Syncing…' : 'Sync Calendar'}
            </Button>
            <form action={reconnectGoogleAction}>
              <Button type="submit" variant="secondary">Reconnect</Button>
            </form>
            <Button
              type="button"
              variant="ghost"
              className="flex items-center gap-1.5 text-rose-500"
              onClick={() => setConfirmOpen(true)}
            >
              <ShieldOff size={14} /> Disconnect
            </Button>
          </div>
          {sync.error && <p className="text-sm text-rose-500">{sync.error === 'revoked' ? 'Authorization expired. Reconnect Google to continue.' : sync.error === 'insufficient_scope' ? 'Calendar permission is missing. Reconnect Google.' : 'Calendar sync failed. Please try again.'}</p>}
          {syncMessage && <p className="text-sm text-emerald-600">{syncMessage}</p>}
          {overview.lastSync && <p className="text-xs" style={{ color: 'var(--glow-text-muted)' }}>Last sync: {overview.lastSync.startedAt.toLocaleString()} · {overview.lastSync.status}</p>}
        </>
      ) : (
        <>
          <p className="text-sm" style={{ color: 'var(--glow-text-muted)' }}>
            Connect Google to see your calendar and inbox inside Glow OS. Only read-only access is requested — nothing is ever changed on your real Google account.
          </p>
          <form action={reconnectGoogleAction}>
            <Button type="submit">Connect Google</Button>
          </form>
        </>
      )}

      <div
        className="rounded-2xl border p-3 text-sm"
        style={{ borderColor: 'var(--glow-border)', background: 'var(--glow-surface-muted)', color: 'var(--glow-text-muted)' }}
      >
        Passwords are never requested or stored. Glow OS only reads calendar events and inbox metadata — it can never send email, delete anything, or change your Google account. You can revoke access here or directly from your Google Account settings at any time.
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Disconnect Google?"
        description="Glow OS will stop reading your calendar and inbox. Your Glow OS tasks, habits, and routines are never affected."
        pending={disconnect.isPending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDisconnect}
      />
    </Card>
  );
}
