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

const shortcuts=[
  {name:'Instagram',description:'Open Instagram for content planning and publishing.',href:'https://www.instagram.com/'},
  {name:'Peacock',description:'Open Peacock. Login credentials are never stored in Glow OS.',href:'https://www.peacocktv.com/'},
  {name:'Hulu',description:'Open Hulu. Login credentials are never stored in Glow OS.',href:'https://www.hulu.com/'},
  {name:'BILH MyChart',description:'Open the general BILH MyChart sign-in page. Visit-specific links are not stored.',href:'https://mychart.bilh.org/MyChart-BILH/'},
];
export const dynamic='force-dynamic';

function stateLabel(state:string){
  if(state==='connected')return 'Connected';
  if(state==='needs_reauthorization')return 'Needs reauthorization';
  if(state==='error')return 'Attention needed';
  return 'Not connected';
}

export default async function ConnectionsPage(){
  const session=await auth();if(!session?.user?.id)redirect('/sign-in');
  const [overview,appleConnection]=await Promise.all([getConnectionsOverview(session.user.id),getAppleReminderConnection(session.user.id)]);
  const googleHealthy=overview.connected&&overview.calendarState==='connected';
  const appleHealthy=appleConnection?.status==='connected';
  const connectedCount=[googleHealthy,appleHealthy].filter(Boolean).length;
  const lastGoogleSync=overview.lastSync?.startedAt??null;
  const lastAppleSync=appleConnection?.lastImportedAt??null;

  return <AppShell><SectionPage eyebrow="Connections" title="Your private digital world" description="Connect services securely through OAuth and private bridges while keeping passwords outside Glow OS.">
    <div className="space-y-4">
      <Card className="relative overflow-hidden bg-[linear-gradient(145deg,#eeeae5,#f7f0eb)] p-5"><Link2 size={52} strokeWidth={.8} className="absolute right-5 top-3 text-[#7e756d]/15"/><p className="glow-eyebrow">Digital dock</p><p className="glow-display mt-2 text-[24px] text-[#4b413b]">Bring services in without giving away the keys.</p><div className="mt-3 flex items-center gap-2 text-[8px] text-[#7b7069]"><LockKeyhole size={11}/>OAuth and approved bridges only. Passwords stay outside Glow OS.</div></Card>

      <div className="grid gap-3 md:grid-cols-3">
        <Card className="p-4"><p className="glow-eyebrow">Live connections</p><p className="glow-display mt-2 text-[28px] text-[#4b403a]">{connectedCount}/2</p><p className="mt-1 text-[8px] leading-4 text-[#87776f]">Google and Apple Reminders are the two data bridges currently supported.</p></Card>
        <Card className="p-4"><p className="glow-eyebrow">Google state</p><p className="mt-2 flex items-center gap-2 text-[12px] font-medium text-[#4b403a]">{googleHealthy?<CheckCircle2 size={14}/>:<RefreshCw size={14}/>} {stateLabel(overview.calendarState)}</p><p className="mt-1 text-[8px] leading-4 text-[#87776f]">Calendar {overview.hasCalendarScope?'read permission granted':'permission missing'} · Gmail {overview.hasGmailScope?'read permission granted':'permission missing'}.</p></Card>
        <Card className="p-4"><p className="glow-eyebrow">Apple bridge</p><p className="mt-2 flex items-center gap-2 text-[12px] font-medium text-[#4b403a]"><Smartphone size={14}/>{appleHealthy?'Connected':'Shortcut setup required'}</p><p className="mt-1 text-[8px] leading-4 text-[#87776f]">Import-only bridge. Glow OS never receives your Apple ID or iCloud password.</p></Card>
      </div>

      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="glow-eyebrow">Connection health</p><h2 className="glow-display mt-1 text-[20px] text-[#4b403a]">Sync state, permissions, and last activity</h2></div><ShieldCheck size={20} className="text-[#7d6b62]"/></div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-[10px] border border-[#e5d9d2] bg-[#faf5f1] p-4"><p className="text-[9px] font-semibold uppercase tracking-[.18em] text-[#75665e]">Google Calendar + Gmail</p><p className="mt-2 text-[10px] text-[#4b403a]">State: {stateLabel(overview.calendarState)}</p><p className="mt-1 text-[8px] leading-4 text-[#87776f]">Last calendar sync: {lastGoogleSync?new Date(lastGoogleSync).toLocaleString():'No completed sync recorded yet'}.</p><p className="mt-1 text-[8px] leading-4 text-[#87776f]">Permissions: Calendar read-only {overview.hasCalendarScope?'✓':'—'} · Gmail read-only {overview.hasGmailScope?'✓':'—'}.</p></div>
          <div className="rounded-[10px] border border-[#e5d9d2] bg-[#faf5f1] p-4"><p className="text-[9px] font-semibold uppercase tracking-[.18em] text-[#75665e]">Apple Reminders</p><p className="mt-2 text-[10px] text-[#4b403a]">State: {appleHealthy?'Connected':'Not connected'}</p><p className="mt-1 text-[8px] leading-4 text-[#87776f]">Last import: {lastAppleSync?new Date(lastAppleSync).toLocaleString():'No import recorded yet'}.</p><p className="mt-1 text-[8px] leading-4 text-[#87776f]">Permission model: iPhone Shortcut sends selected reminders into Glow OS. No native Apple credentials are stored.</p></div>
        </div>
      </Card>

      <Card className="p-5"><p className="glow-eyebrow">Data flow map</p><h2 className="glow-display mt-1 text-[20px] text-[#4b403a]">What comes in, where it goes, and what Glow can change</h2><div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="rounded-[10px] border border-[#e5d9d2] bg-white/60 p-4"><div className="flex items-center gap-2 text-[10px] font-semibold text-[#4b403a]"><span>Google</span><ArrowRight size={12}/><span>Glow intelligence</span></div><p className="mt-2 text-[8px] leading-4 text-[#87776f]">Calendar events feed Calendar, Dashboard, Planning, Brain, Briefings, and smart scheduling context. Gmail metadata feeds Gmail Intelligence and can create Glow-side Tasks/Calendar/Project records only after your action. Glow OS does not edit your Google Calendar or Gmail.</p></div>
        <div className="rounded-[10px] border border-[#e5d9d2] bg-white/60 p-4"><div className="flex items-center gap-2 text-[10px] font-semibold text-[#4b403a]"><span>Apple Reminders</span><ArrowRight size={12}/><span>Glow rooms</span></div><p className="mt-2 text-[8px] leading-4 text-[#87776f]">The Shortcut imports reminder copies into Glow OS, where they can appear in Reminders, Dashboard, Brain, and relevant life rooms. Apple remains the original source and Glow does not delete or edit the original reminders.</p></div>
      </div></Card>

      <div className="grid gap-4 lg:grid-cols-2"><GoogleConnectionCard overview={overview}/><AppleRemindersCard connection={appleConnection}/><Card className="space-y-3 lg:col-span-2"><div><p className="glow-eyebrow">Private shortcuts</p><p className="mt-1 text-[8px] leading-4 text-[#87776f]">Plain links, not live integrations. Glow OS never signs in, reads, or stores anything from these sites.</p></div><div className="grid gap-3 md:grid-cols-2">{shortcuts.map((shortcut)=><a key={shortcut.name} href={shortcut.href} target="_blank" rel="noopener noreferrer" className="group block rounded-[8px] border border-[#e4d9d1] bg-[#faf4ef] p-4 transition hover:-translate-y-0.5 hover:bg-white/70"><div className="flex items-center justify-between"><p className="glow-display text-[14px] text-[#4b403a]">{shortcut.name}</p><ArrowUpRight size={11} className="text-[#98847a]"/></div><p className="mt-2 text-[8px] leading-4 text-[#87776f]">{shortcut.description}</p></a>)}</div></Card></div>
    </div>
  </SectionPage></AppShell>;
}
