import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import { GoogleConnectionCard } from '@/components/connections/google-connection-card';
import { AppleRemindersCard } from '@/components/connections/apple-reminders-card';
import { getConnectionsOverview } from '@/lib/data/connections';
import { getAppleReminderConnection } from '@/lib/apple-reminders/service';
import { ArrowRight, ArrowUpRight, CheckCircle2, Link2, LockKeyhole, RefreshCw, ShieldCheck, Smartphone } from 'lucide-react';

const shortcuts = [
  { name: 'Instagram', description: 'Open Instagram for content planning and publishing.', href: 'https://www.instagram.com/' },
  { name: 'Peacock', description: 'Open Peacock. Login credentials are never stored in Glow OS.', href: 'https://www.peacocktv.com/' },
  { name: 'Hulu', description: 'Open Hulu. Login credentials are never stored in Glow OS.', href: 'https://www.hulu.com/' },
  { name: 'BILH MyChart', description: 'Open the general BILH MyChart sign-in page. Visit-specific links are not stored.', href: 'https://mychart.bilh.org/MyChart-BILH/' },
];
export const dynamic = 'force-dynamic';

function stateLabel(state: string) {
  if (state === 'connected') return 'Connected';
  if (state === 'needs_reauthorization') return 'Needs reauthorization';
  if (state === 'error') return 'Attention needed';
  return 'Not connected';
}

export default async function ConnectionsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const [overview, appleConnection] = await Promise.all([getConnectionsOverview(session.user.id), getAppleReminderConnection(session.user.id)]);
  const googleHealthy = overview.connected && overview.calendarState === 'connected';
  const appleHealthy = appleConnection?.status === 'connected';
  const connectedCount = [googleHealthy, appleHealthy].filter(Boolean).length;
  const lastGoogleSync = overview.lastSync?.startedAt ?? null;
  const lastAppleSync = appleConnection?.lastImportedAt ?? null;

  return (
    <AppShell>
      <SectionPage eyebrow="Connections" title="Your private digital world" description="Connect services securely through OAuth and private bridges while keeping passwords outside Glow OS.">
        <div className="space-y-4">
          <Card className="relative overflow-hidden bg-[linear-gradient(145deg,#FDF8F6,#F1E8D9)]">
            <Link2 size={52} strokeWidth={0.8} className="absolute right-5 top-4 text-[#9A7A3D]/22" />
            <p className="glow-eyebrow">Digital dock</p>
            <p className="glow-display mt-2 text-[24px] text-[#2B2420]">Bring services in without giving away the keys.</p>
            <div className="mt-3 flex items-center gap-2 text-[11px] text-[#8A8078]"><LockKeyhole size={12} />OAuth and approved bridges only. Passwords stay outside Glow OS.</div>
          </Card>

          <div className="grid gap-3 md:grid-cols-3">
            <Card><p className="glow-eyebrow">Live connections</p><p className="glow-display mt-2 text-[28px] text-[#2B2420]">{connectedCount}/2</p><p className="mt-1 text-[11px] leading-4 text-[#8A8078]">Google and Apple Reminders are the two data bridges currently supported.</p></Card>
            <Card><p className="glow-eyebrow">Google state</p><p className="mt-2 flex items-center gap-2 text-[13px] font-medium text-[#2B2420]">{googleHealthy ? <CheckCircle2 size={14} className="text-[#5A6E52]" /> : <RefreshCw size={14} className="text-[#9A7A3D]" />} {stateLabel(overview.calendarState)}</p><p className="mt-1 text-[11px] leading-4 text-[#8A8078]">Calendar {overview.hasCalendarScope ? 'read permission granted' : 'permission missing'} · Gmail {overview.hasGmailScope ? 'read permission granted' : 'permission missing'}.</p></Card>
            <Card><p className="glow-eyebrow">Apple bridge</p><p className="mt-2 flex items-center gap-2 text-[13px] font-medium text-[#2B2420]"><Smartphone size={14} className={appleHealthy ? 'text-[#5A6E52]' : 'text-[#9A7A3D]'} />{appleHealthy ? 'Connected' : 'Shortcut setup required'}</p><p className="mt-1 text-[11px] leading-4 text-[#8A8078]">Import-only bridge. Glow OS never receives your Apple ID or iCloud password.</p></Card>
          </div>

          <Card>
            <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="glow-eyebrow">Connection health</p><h2 className="glow-display mt-1 text-[20px] text-[#2B2420]">Sync state, permissions, and last activity</h2></div><ShieldCheck size={20} className="text-[#C9727E]" /></div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-[14px] border border-[#F1E7E3] bg-[#FDF8F6] p-4"><p className="text-[10.5px] font-semibold uppercase tracking-[.12em] text-[#8A8078]">Google Calendar + Gmail</p><p className="mt-2 text-[12.5px] text-[#2B2420]">State: {stateLabel(overview.calendarState)}</p><p className="mt-1 text-[11px] leading-4 text-[#8A8078]">Last calendar sync: {lastGoogleSync ? new Date(lastGoogleSync).toLocaleString() : 'No completed sync recorded yet'}.</p><p className="mt-1 text-[11px] leading-4 text-[#8A8078]">Permissions: Calendar read-only {overview.hasCalendarScope ? '✓' : '—'} · Gmail read-only {overview.hasGmailScope ? '✓' : '—'}.</p></div>
              <div className="rounded-[14px] border border-[#F1E7E3] bg-[#FDF8F6] p-4"><p className="text-[10.5px] font-semibold uppercase tracking-[.12em] text-[#8A8078]">Apple Reminders</p><p className="mt-2 text-[12.5px] text-[#2B2420]">State: {appleHealthy ? 'Connected' : 'Not connected'}</p><p className="mt-1 text-[11px] leading-4 text-[#8A8078]">Last import: {lastAppleSync ? new Date(lastAppleSync).toLocaleString() : 'No import recorded yet'}.</p><p className="mt-1 text-[11px] leading-4 text-[#8A8078]">Permission model: iPhone Shortcut sends selected reminders into Glow OS. No native Apple credentials are stored.</p></div>
            </div>
          </Card>

          <Card>
            <p className="glow-eyebrow">Data flow map</p>
            <h2 className="glow-display mt-1 text-[20px] text-[#2B2420]">What comes in, where it goes, and what Glow can change</h2>
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              <div className="rounded-[14px] border border-[#F1E7E3] bg-white p-4"><div className="flex items-center gap-2 text-[12px] font-semibold text-[#2B2420]"><span>Google</span><ArrowRight size={13} /><span>Glow intelligence</span></div><p className="mt-2 text-[11px] leading-4 text-[#8A8078]">Calendar events feed Calendar, Dashboard, Planning, Brain, Briefings, and smart scheduling context. Gmail metadata feeds Gmail Intelligence and can create Glow-side Tasks/Calendar/Project records only after your action. Glow OS does not edit your Google Calendar or Gmail.</p></div>
              <div className="rounded-[14px] border border-[#F1E7E3] bg-white p-4"><div className="flex items-center gap-2 text-[12px] font-semibold text-[#2B2420]"><span>Apple Reminders</span><ArrowRight size={13} /><span>Glow rooms</span></div><p className="mt-2 text-[11px] leading-4 text-[#8A8078]">The Shortcut imports reminder copies into Glow OS, where they can appear in Reminders, Dashboard, Brain, and relevant life rooms. Apple remains the original source and Glow does not delete or edit the original reminders.</p></div>
            </div>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <GoogleConnectionCard overview={overview} />
            <AppleRemindersCard connection={appleConnection} />
            <Card className="space-y-3 lg:col-span-2">
              <div><p className="glow-eyebrow">Private shortcuts</p><p className="mt-1 text-[11px] leading-4 text-[#8A8078]">Plain links, not live integrations. Glow OS never signs in, reads, or stores anything from these sites.</p></div>
              <div className="grid gap-3 md:grid-cols-2">
                {shortcuts.map((shortcut) => (
                  <a key={shortcut.name} href={shortcut.href} target="_blank" rel="noopener noreferrer" className="group block rounded-[14px] border border-[#F1E7E3] bg-[#FDF8F6] p-4 transition hover:-translate-y-0.5 hover:bg-white">
                    <div className="flex items-center justify-between"><p className="glow-display text-[14px] text-[#2B2420]">{shortcut.name}</p><ArrowUpRight size={12} className="text-[#C9727E]" /></div>
                    <p className="mt-2 text-[11px] leading-4 text-[#8A8078]">{shortcut.description}</p>
                  </a>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </SectionPage>
    </AppShell>
  );
}
