import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { SettingsControlCenter } from '@/components/settings/settings-control-center';
import { getConnectionsOverview } from '@/lib/data/connections';
import { getAppleReminderConnection } from '@/lib/apple-reminders/service';
import { signOutAction } from '@/app/actions/account';
import { CheckCircle2, LogOut, Plug, RefreshCw, Smartphone, UserRound } from 'lucide-react';

export const dynamic = 'force-dynamic';

function stateLabel(state: string) {
  if (state === 'connected') return 'Connected';
  if (state === 'needs_reauthorization') return 'Needs reauthorization';
  if (state === 'error') return 'Attention needed';
  return 'Not connected';
}

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const [overview, appleConnection] = await Promise.all([
    getConnectionsOverview(session.user.id),
    getAppleReminderConnection(session.user.id),
  ]);
  const googleHealthy = overview.connected && overview.calendarState === 'connected' && overview.hasCalendarScope && overview.hasGmailScope;
  const appleHealthy = appleConnection?.status === 'connected';
  const googleStatus = googleHealthy
    ? 'Calendar + Gmail ready'
    : overview.connected && overview.calendarState === 'connected'
      ? `Partial · Calendar ${overview.hasCalendarScope ? '✓' : '—'} · Gmail ${overview.hasGmailScope ? '✓' : '—'}`
      : `${stateLabel(overview.calendarState)} · Calendar ${overview.hasCalendarScope ? '✓' : '—'} · Gmail ${overview.hasGmailScope ? '✓' : '—'}`;

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[.14em] text-[#C9727E]">Settings</p>
          <h1 className="glow-display mt-1 text-[38px] leading-none text-[#2B2420] sm:text-[44px]">Make Glow OS yours.</h1>
          <p className="mt-2 max-w-xl text-[13px] text-[#8A8078]">Quiet, precise control over appearance, intelligence, notifications, and your data — nothing here changes without your say.</p>
        </div>

        <div className="rounded-[20px] border border-[#F1E7E3] bg-white p-5">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F1E0D9] text-[#8A5A56]"><UserRound size={22} /></span>
            <div className="min-w-0 flex-1">
              <p className="text-[16px] font-medium text-[#2B2420]">{session.user.name ?? 'Glow Member'}</p>
              <p className="text-[12px] text-[#9A9088]">{session.user.email ?? 'No email on file'}</p>
            </div>
            <form action={signOutAction}>
              <button type="submit" className="flex items-center gap-1.5 rounded-full border border-[#F1E7E3] px-4 py-2 text-[12px] font-medium text-[#8A8078] hover:bg-[#FDFAF8]"><LogOut size={13} />Sign out</button>
            </form>
          </div>
        </div>

        <SettingsControlCenter />

        <div className="rounded-[20px] border border-[#F1E7E3] bg-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5"><Plug size={14} className="text-[#C9727E]" /><p className="text-[13px] font-medium text-[#2B2420]">Connections</p></div>
            <Link href="/connections" className="text-[11px] font-medium text-[#C9727E]">Manage connections →</Link>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Link href="/connections#google-connection" className="rounded-[14px] border border-[#F1E7E3] p-3.5 transition hover:bg-[#FDFAF8]">
              <div className="flex items-center gap-2 text-[12px] font-medium text-[#2B2420]">{googleHealthy ? <CheckCircle2 size={13} className="text-[#5A6E52]" /> : <RefreshCw size={13} className="text-[#9A7A3D]" />}Google Calendar + Gmail</div>
              <p className="mt-1 text-[10.5px] text-[#9A9088]">{googleStatus}</p>
            </Link>
            <Link href="/connections#apple-reminders" className="rounded-[14px] border border-[#F1E7E3] p-3.5 transition hover:bg-[#FDFAF8]">
              <div className="flex items-center gap-2 text-[12px] font-medium text-[#2B2420]"><Smartphone size={13} className={appleHealthy ? 'text-[#5A6E52]' : 'text-[#9A7A3D]'} />Apple Reminders</div>
              <p className="mt-1 text-[10.5px] text-[#9A9088]">{appleHealthy ? 'Connected' : 'Shortcut setup required'}</p>
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
