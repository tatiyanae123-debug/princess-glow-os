'use client';

import { useState, useTransition } from 'react';
import { Check, Copy, ExternalLink, Play, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { prepareAppleReminderBridgeAction } from '@/app/actions/intelligence-expansion';

type Connection = { status: string; lastImportedAt: Date | null; lastError: string | null } | null;

const shortcutName='Sync Apple Reminders to Glow OS';
const runShortcut=`shortcuts://run-shortcut?name=${encodeURIComponent(shortcutName)}`;
const openShortcut=`shortcuts://open-shortcut?name=${encodeURIComponent(shortcutName)}`;
const createShortcut='shortcuts://create-shortcut';
const importUrl='https://princess-glow-os.vercel.app/api/integrations/apple-reminders/import';

export function AppleRemindersCard({ connection }: { connection: Connection }) {
  const [key, setKey] = useState<string | null>(null);
  const [copied,setCopied]=useState(false);
  const [pending, startTransition] = useTransition();
  const status = !connection ? 'Not configured' : connection.status === 'connected' ? 'Connected' : 'Ready for Shortcut';

  function prepare() {
    startTransition(async () => {
      const result = await prepareAppleReminderBridgeAction();
      setKey(result.data.key);
      setCopied(false);
    });
  }

  async function copyKey(){
    if(!key)return;
    await navigator.clipboard.writeText(key);
    setCopied(true);
    window.setTimeout(()=>setCopied(false),1800);
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

      <p className="text-sm text-slate-500">Glow can import your iPhone reminders, understand what each one means, and surface it in the right rooms. Apple stays the original read-only source.</p>

      {connection?.lastImportedAt && <p className="text-sm text-slate-500">Last imported: {new Date(connection.lastImportedAt).toLocaleString()}</p>}
      {connection?.lastError && <p className="text-sm text-rose-500">Last error: {connection.lastError}</p>}

      {connection?.status==='connected' ? (
        <div className="grid gap-2 sm:grid-cols-2">
          <a href={runShortcut} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#302724] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#6f4a4e]"><Play size={15}/>Sync Reminders Now</a>
          <a href={openShortcut} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700"><Smartphone size={15}/>Open Shortcut</a>
        </div>
      ) : null}

      <Button type="button" onClick={prepare} disabled={pending}>{pending ? 'Preparing…' : key ? 'Rotate Shortcut Key' : 'Prepare Easy iPhone Sync'}</Button>

      {key && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-slate-700">
          <p className="font-semibold">Private sync key</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">You only need this once while setting up the Shortcut. It will not be shown again after you leave this page.</p>
          <code className="mt-3 block break-all rounded-xl bg-white p-3 text-xs">{key}</code>
          <button type="button" onClick={copyKey} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs font-medium text-slate-700">{copied?<Check size={13}/>:<Copy size={13}/>} {copied?'Copied':'Copy key'}</button>
        </div>
      )}

      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 text-sm text-slate-600">
        <p className="font-semibold text-slate-900">Easy Mode · no Repeat, Dictionary, or variables</p>
        <p className="mt-2 text-xs leading-5">Glow now accepts the Reminders magic variable directly. Your Shortcut only needs <strong>two actions</strong>:</p>
        <div className="mt-3 space-y-3">
          <div className="rounded-xl bg-white/80 p-3"><p className="font-medium text-slate-900">1 · Find Reminders</p><p className="mt-1 text-xs">Choose all reminders or the lists you want Glow to understand.</p></div>
          <div className="rounded-xl bg-white/80 p-3"><p className="font-medium text-slate-900">2 · Get Contents of URL</p><p className="mt-1 text-xs leading-5">POST to <code>{importUrl}</code>. Header: <code>Authorization: Bearer YOUR_KEY</code>. Request Body: <code>JSON</code> with one field: <code>reminders → Reminders</code> using the blue Find Reminders magic variable directly.</p></div>
        </div>
        <p className="mt-3 text-xs leading-5"><strong>Delete the Repeat, Dictionary, Glow Reminders variable, and End Repeat steps.</strong> Glow now normalizes the reminder information on the server for you.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a href={openShortcut} className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-medium text-slate-700"><ExternalLink size={12}/>Open your existing Shortcut</a>
          <a href={createShortcut} className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-medium text-slate-700"><Smartphone size={12}/>Create fresh Shortcut</a>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-50 p-4 text-xs leading-5 text-slate-500">
        <p className="font-semibold text-slate-800">Why there is still one Apple setup step</p>
        <p className="mt-1">A website cannot silently install or read Apple Reminders. Apple requires a Shortcut to be installed on your device. Once that tiny two-action Shortcut exists, the <strong>Sync Reminders Now</strong> button above becomes your one-button sync.</p>
      </div>
    </Card>
  );
}
