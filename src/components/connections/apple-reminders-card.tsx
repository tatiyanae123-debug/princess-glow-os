'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { prepareAppleReminderBridgeAction } from '@/app/actions/intelligence-expansion';

type Connection = { status: string; lastImportedAt: Date | null; lastError: string | null } | null;

export function AppleRemindersCard({ connection }: { connection: Connection }) {
  const [key, setKey] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const status = !connection ? 'Not configured' : connection.status === 'connected' ? 'Connected' : 'Ready for Shortcut';

  function prepare() {
    startTransition(async () => {
      const result = await prepareAppleReminderBridgeAction();
      setKey(result.data.key);
    });
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Apple</p>
          <h2 className="mt-2 text-xl font-semibold">Reminders</h2>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium">{status}</span>
      </div>

      <p className="text-sm text-slate-500">Import your iPhone reminders with a private Shortcut bridge. Glow OS can read imported reminders, but it cannot edit or delete anything in the Reminders app.</p>

      {connection?.lastImportedAt && <p className="text-sm text-slate-500">Last imported: {new Date(connection.lastImportedAt).toLocaleString()}</p>}
      {connection?.lastError && <p className="text-sm text-rose-500">Last error: {connection.lastError}</p>}

      <Button type="button" onClick={prepare} disabled={pending}>{pending ? 'Preparing…' : key ? 'Rotate Shortcut Key' : 'Prepare iPhone Shortcut'}</Button>

      {key && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-slate-700">
          <p className="font-semibold">Copy this key now. It will not be shown again.</p>
          <code className="mt-2 block break-all rounded-xl bg-white p-3 text-xs">{key}</code>
        </div>
      )}

      <div className="space-y-2 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
        <p className="font-semibold text-slate-900">iPhone Shortcut setup</p>
        <p>1. Find Reminders and collect the lists you want to sync.</p>
        <p>2. Build a JSON list with externalId, listName, title, notes, dueAt and completed.</p>
        <p>3. Use Get Contents of URL with POST to <code>/api/integrations/apple-reminders/import</code>.</p>
        <p>4. Add header <code>Authorization: Bearer YOUR_KEY</code>.</p>
        <p>5. Run it once, then optionally automate the Shortcut on your iPhone.</p>
      </div>
    </Card>
  );
}
