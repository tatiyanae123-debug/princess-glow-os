'use client';

import { useState } from 'react';
import { BellRing, CheckCircle2, KeyRound } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function AppleRemindersCard({ configured, lastUsedAt }: { configured: boolean; lastUsedAt: Date | null }) {
  const [token, setToken] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generateKey() {
    setPending(true);
    setError(null);
    try {
      const response = await fetch('/api/integrations/apple-reminders/token', { method: 'POST' });
      if (!response.ok) throw new Error('Could not create the Shortcut key.');
      const data = (await response.json()) as { token: string };
      setToken(data.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create the Shortcut key.');
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: 'var(--glow-text-muted)' }}>Apple</p>
          <h2 className="mt-2 flex items-center gap-2 text-xl font-semibold" style={{ color: 'var(--glow-text)' }}><BellRing size={18} /> Reminders</h2>
        </div>
        <span className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium" style={configured ? { background: 'rgb(16 185 129 / 0.12)', color: 'rgb(5 150 105)' } : { background: 'var(--glow-surface-muted)', color: 'var(--glow-text-muted)' }}>
          {configured && <CheckCircle2 size={13} />}{configured ? 'Shortcut ready' : 'Not configured'}
        </span>
      </div>

      <p className="text-sm" style={{ color: 'var(--glow-text-muted)' }}>
        Apple does not provide Glow OS with a Google-style Reminders OAuth API. Phase 3C uses an iPhone Shortcut that sends only the reminder fields you choose to Glow OS over HTTPS.
      </p>

      <Button type="button" onClick={generateKey} disabled={pending}>
        <KeyRound size={14} /> {pending ? 'Creating…' : configured ? 'Rotate Shortcut Key' : 'Create Shortcut Key'}
      </Button>
      {error && <p className="text-sm text-rose-500">{error}</p>}

      {token && (
        <div className="space-y-2 rounded-2xl border p-4" style={{ borderColor: 'var(--glow-border)', background: 'var(--glow-surface-muted)' }}>
          <p className="text-sm font-semibold" style={{ color: 'var(--glow-text)' }}>Copy this key now</p>
          <p className="break-all font-mono text-xs" style={{ color: 'var(--glow-text-muted)' }}>{token}</p>
          <p className="text-xs" style={{ color: 'var(--glow-text-muted)' }}>For security, Glow OS stores only a hash. This key will not be shown again. Rotating it disables the previous key.</p>
        </div>
      )}

      <div className="rounded-2xl border p-3 text-sm" style={{ borderColor: 'var(--glow-border)', background: 'var(--glow-surface-muted)', color: 'var(--glow-text-muted)' }}>
        Imported reminders are read-only inside Glow OS for this phase and appear as tasks labeled Apple Reminders. Glow OS does not delete or change reminders on your iPhone.
      </div>
      {lastUsedAt && <p className="text-xs" style={{ color: 'var(--glow-text-muted)' }}>Last Shortcut sync: {new Date(lastUsedAt).toLocaleString()}</p>}
    </Card>
  );
}
