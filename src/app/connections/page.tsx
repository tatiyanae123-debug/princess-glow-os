import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import { GoogleConnectionCard } from '@/components/connections/google-connection-card';
import { AppleRemindersCard } from '@/components/connections/apple-reminders-card';
import { getConnectionsOverview } from '@/lib/data/connections';
import { getAppleReminderConnection } from '@/lib/apple-reminders/service';
import { ArrowRight, CalendarDays, CheckCircle2, Cloud, Link2, LockKeyhole, Mail, RefreshCw, ShieldCheck, Smartphone, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

const shortcuts=[
  {name:'Instagram',href:'https://www.instagram.com/'},
  {name:'Peacock',href:'https://www.peacocktv.com/'},
  {name:'Hulu',href:'https://www.hulu.com/'},
  {name:'BILH MyChart',href:'https://mychart.bilh.org/MyChart-BILH/'},
];

function stateLabel(state:string){if(state==='connected')return'Connected';if(state==='needs_reauthorization')return'Needs reauthorization';if(state==='error')return'Attention needed';return'Not connected'}

export default async function ConnectionsPage(){
  const session=await auth();
  if(!session?.user?.id) redirect('/sign-in');
  const [overview,appleConnection]=await Promise.all([getConnectionsOverview(session.user.id),getAppleReminderConnection(session.user.id)]);
  const googleHealthy=overview.connected&&overview.calendarState==='connected';
  const appleHealthy=appleConnection?.status==='connected';
  const connectedCount=[googleHealthy,appleHealthy].filter(Boolean).length;
  const googleLabel=stateLabel(overview.calendarState);
  const googleDate=overview.lastSync?.startedAt?new Date(overview.lastSync.startedAt):null;
  const appleDate=appleConnection?.lastImportedAt?new Date(appleConnection.lastImportedAt):null;

  return <AppShell><SectionPage eyebrow="Connections" title="Connections" description="Nurture what matters. Keep the services that support your life close, private, and understandable.">
    <div className="space-y-4">
      <section className="grid gap-4 xl:grid-cols-3">
        <Card><div className="flex items-center justify-between"><div className="flex items-center gap-2"><Link2 size={15} className="text-[#C9727E]"/><h2 className="glow-display text-[18px]">Inner Circle</h2></div><span className="text-[10px] text-[#C9727E]">View all</span></div><div className="mt-5 flex gap-5"><div className="text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FDF3F2] text-[#C9727E]"><Cloud size={18}/></span><p className="mt-2 text-[11px]">Google</p><p className="text-[9px] text-[#9A9088]">Calendar + Gmail</p></div><div className="text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F1E8D9] text-[#9A7A3D]"><Smartphone size={18}/></span><p className="mt-2 text-[11px]">Apple</p><p className="text-[9px] text-[#9A9088]">Reminders bridge</p></div></div><div className="mt-5 rounded-[12px] bg-[#FFF8F5] p-4 text-center"><p className="glow-display text-[14px] italic text-[#5C4D47]">Your connected world should make life feel lighter, not louder.</p></div></Card>
        <Card><div className="flex items-center justify-between"><div className="flex items-center gap-2"><RefreshCw size={15} className="text-[#9A7A3D]"/><h2 className="glow-display text-[18px]">Recent Activity</h2></div><span className="text-[10px] text-[#C9727E]">View all</span></div><div className="mt-4 space-y-4"><div className="flex items-center gap-3"><span className={`h-2 w-2 rounded-full ${googleHealthy?'bg-[#5A6E52]':'bg-[#C69A52]'}`}/><div className="min-w-0 flex-1"><p className="text-[11.5px] font-medium">Google connection</p><p className="text-[10px] text-[#9A9088]">{googleLabel}</p></div><span className="text-[9px] text-[#B5ACA5]">{googleDate?googleDate.toLocaleDateString():'—'}</span></div><div className="flex items-center gap-3"><span className={`h-2 w-2 rounded-full ${appleHealthy?'bg-[#5A6E52]':'bg-[#C69A52]'}`}/><div className="min-w-0 flex-1"><p className="text-[11.5px] font-medium">Apple Reminders</p><p className="text-[10px] text-[#9A9088]">{appleHealthy?'Connected':'Setup needed'}</p></div><span className="text-[9px] text-[#B5ACA5]">{appleDate?appleDate.toLocaleDateString():'—'}</span></div></div></Card>
        <Card><div className="flex items-center justify-between"><div className="flex items-center gap-2"><ShieldCheck size={15} className="text-[#C9727E]"/><h2 className="glow-display text-[18px]">Follow-Ups</h2></div><span className="text-[10px] text-[#C9727E]">View all</span></div><div className="mt-4 space-y-4 text-[11.5px]"><p className="flex items-start gap-2"><span className="mt-0.5 h-3.5 w-3.5 rounded-[4px] border border-[#D9CFC9]"/>Review Gmail permission state <span className="ml-auto text-[9px] text-[#9A9088]">{overview.hasGmailScope?'Done':'Open'}</span></p><p className="flex items-start gap-2"><span className="mt-0.5 h-3.5 w-3.5 rounded-[4px] border border-[#D9CFC9]"/>Review Calendar permission <span className="ml-auto text-[9px] text-[#9A9088]">{overview.hasCalendarScope?'Done':'Open'}</span></p><p className="flex items-start gap-2"><span className="mt-0.5 h-3.5 w-3.5 rounded-[4px] border border-[#D9CFC9]"/>Confirm Apple bridge <span className="ml-auto text-[9px] text-[#9A9088]">{appleHealthy?'Done':'Open'}</span></p></div></Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Card><div className="flex items-center gap-2"><CalendarDays size={14} className="text-[#9A7A3D]"/><h2 className="glow-display text-[18px]">Important Dates</h2></div><div className="mt-4 space-y-4 text-[11px]"><p className="flex justify-between gap-3"><span>Last Google sync</span><span className="text-[#9A9088]">{googleDate?googleDate.toLocaleString():'Not yet'}</span></p><p className="flex justify-between gap-3"><span>Last Apple import</span><span className="text-[#9A9088]">{appleDate?appleDate.toLocaleString():'Not yet'}</span></p></div></Card>
        <Card><div className="flex items-center gap-2"><LockKeyhole size={14} className="text-[#9A7A3D]"/><h2 className="glow-display text-[18px]">Connection Notes</h2></div><div className="mt-4 space-y-4"><div><p className="text-[11.5px] font-medium">Google</p><p className="mt-1 text-[10px] leading-4 text-[#9A9088]">Calendar and Gmail stay read-only. Glow creates Glow-side actions only when you choose them.</p></div><div><p className="text-[11.5px] font-medium">Apple Reminders</p><p className="mt-1 text-[10px] leading-4 text-[#9A9088]">Your Shortcut imports selected reminder copies. Apple remains the original source.</p></div></div></Card>
        <Card><div className="flex items-center justify-between"><div className="flex items-center gap-2"><Sparkles size={14} className="text-[#C9727E]"/><h2 className="glow-display text-[18px]">Connection Map</h2></div><span className="text-[10px] text-[#C9727E]">View full map</span></div><div className="relative mx-auto mt-5 h-44 max-w-[260px]"><div className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#F1E8D9] glow-display text-[15px]">{session.user.name?.split(' ')[0]??'You'}</div><div className="absolute left-3 top-8 rounded-full border border-[#E9D8D4] bg-white px-3 py-2 text-[10px]">Google</div><div className="absolute right-2 top-8 rounded-full border border-[#E9D8D4] bg-white px-3 py-2 text-[10px]">Calendar</div><div className="absolute bottom-5 left-5 rounded-full border border-[#E9D8D4] bg-white px-3 py-2 text-[10px]">Gmail</div><div className="absolute bottom-5 right-4 rounded-full border border-[#E9D8D4] bg-white px-3 py-2 text-[10px]">Reminders</div></div><div className="rounded-[12px] bg-[#FFF8F5] p-3 text-[10px] text-[#8A8078]">You have {connectedCount} active data bridge{connectedCount===1?'':'s'}.</div></Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2"><GoogleConnectionCard overview={overview}/><AppleRemindersCard connection={appleConnection}/></section>

      <Card><div className="flex items-center gap-2"><Mail size={14} className="text-[#C9727E]"/><h2 className="glow-display text-[18px]">Private Shortcuts</h2></div><div className="mt-4 flex flex-wrap gap-2">{shortcuts.map(item=><a key={item.name} href={item.href} target="_blank" rel="noopener noreferrer" className="rounded-full border border-[#F1E7E3] bg-white px-3 py-2 text-[10.5px] text-[#4A4440]">{item.name} ↗</a>)}</div></Card>

      <Card className="grid gap-4 bg-[linear-gradient(90deg,#FFF,#FFF7F5)] lg:grid-cols-[160px_1fr_auto] lg:items-center"><div className="flex items-center gap-2"><Sparkles size={14} className="text-[#C9727E]"/><span className="glow-display text-[18px]">Glow Insight</span></div><p className="glow-display text-[17px] italic text-[#4A4440]">Your connection pattern is strongest when every service has a clear purpose and permission boundary.</p><span className="text-[10px] text-[#9A9088]">{connectedCount}/2 live</span></Card>
    </div>
  </SectionPage></AppShell>;
}
