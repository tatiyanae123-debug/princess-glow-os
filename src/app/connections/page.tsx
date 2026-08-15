import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import { GoogleConnectionCard } from '@/components/connections/google-connection-card';
import { AppleRemindersCard } from '@/components/connections/apple-reminders-card';
import { getConnectionsOverview } from '@/lib/data/connections';
import { getAppleReminderConnection } from '@/lib/apple-reminders/service';
import { CalendarDays, CheckCircle2, Cloud, Link2, LockKeyhole, Mail, RefreshCw, ShieldCheck, Smartphone, Sparkles, TriangleAlert } from 'lucide-react';

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
  const googleHealthy=overview.connected&&overview.calendarState==='connected'&&overview.hasCalendarScope&&overview.hasGmailScope;
  const appleHealthy=appleConnection?.status==='connected';
  const connectedCount=[googleHealthy,appleHealthy].filter(Boolean).length;
  const googleBaseLabel=stateLabel(overview.calendarState);
  const googleLabel=overview.connected&&overview.calendarState==='connected'&&!overview.hasGmailScope?'Calendar connected · Gmail permission missing':overview.connected&&overview.calendarState==='connected'&&!overview.hasCalendarScope?'Google connected · Calendar permission missing':googleBaseLabel;
  const googleDate=overview.lastSync?.startedAt?new Date(overview.lastSync.startedAt):null;
  const appleDate=appleConnection?.lastImportedAt?new Date(appleConnection.lastImportedAt):null;

  const followUps=[
    {label:'Review Gmail permission state',done:overview.hasGmailScope,href:'#google-connection'},
    {label:'Review Calendar permission',done:overview.hasCalendarScope&&overview.calendarState==='connected',href:'#google-connection'},
    {label:'Confirm Apple bridge',done:appleHealthy,href:'#apple-reminders'},
  ];

  return <AppShell><SectionPage eyebrow="Connections" title="Connections" description="Nurture what matters. Keep the services that support your life close, private, and understandable.">
    <div className="space-y-4">
      <section className="grid gap-4 xl:grid-cols-3">
        <Card><div className="flex items-center justify-between"><div className="flex items-center gap-2"><Link2 size={15} className="text-[#C9727E]"/><h2 className="glow-display text-[18px]">Inner Circle</h2></div><Link href="#connection-details" className="text-[10px] text-[#C9727E]">View all</Link></div><div className="mt-5 flex gap-5"><Link href="#google-connection" className="text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FDF3F2] text-[#C9727E]"><Cloud size={18}/></span><p className="mt-2 text-[11px]">Google</p><p className="text-[9px] text-[#9A9088]">Calendar + Gmail</p></Link><Link href="#apple-reminders" className="text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F1E8D9] text-[#9A7A3D]"><Smartphone size={18}/></span><p className="mt-2 text-[11px]">Apple</p><p className="text-[9px] text-[#9A9088]">Reminders bridge</p></Link></div><div className="mt-5 rounded-[12px] bg-[#FFF8F5] p-4 text-center"><p className="glow-display text-[14px] italic text-[#5C4D47]">Your connected world should make life feel lighter, not louder.</p></div></Card>
        <Card><div className="flex items-center justify-between"><div className="flex items-center gap-2"><RefreshCw size={15} className="text-[#9A7A3D]"/><h2 className="glow-display text-[18px]">Recent Activity</h2></div><Link href="#connection-details" className="text-[10px] text-[#C9727E]">View all</Link></div><div className="mt-4 space-y-4"><Link href="#google-connection" className="flex items-center gap-3"><span className={`h-2 w-2 rounded-full ${googleHealthy?'bg-[#5A6E52]':'bg-[#C69A52]'}`}/><div className="min-w-0 flex-1"><p className="text-[11.5px] font-medium">Google connection</p><p className="text-[10px] text-[#9A9088]">{googleLabel}</p></div><span className="text-[9px] text-[#B5ACA5]">{googleDate?googleDate.toLocaleDateString():'—'}</span></Link><Link href="#apple-reminders" className="flex items-center gap-3"><span className={`h-2 w-2 rounded-full ${appleHealthy?'bg-[#5A6E52]':'bg-[#C69A52]'}`}/><div className="min-w-0 flex-1"><p className="text-[11.5px] font-medium">Apple Reminders</p><p className="text-[10px] text-[#9A9088]">{appleHealthy?'Connected':'Setup needed'}</p></div><span className="text-[9px] text-[#B5ACA5]">{appleDate?appleDate.toLocaleDateString():'—'}</span></Link></div></Card>
        <Card><div className="flex items-center justify-between"><div className="flex items-center gap-2"><ShieldCheck size={15} className="text-[#C9727E]"/><h2 className="glow-display text-[18px]">Follow-Ups</h2></div><Link href="#connection-details" className="text-[10px] text-[#C9727E]">View all</Link></div><div className="mt-4 divide-y divide-[#F4ECE8]">{followUps.map((item)=><Link key={item.label} href={item.href} className="flex items-center gap-2 py-3 text-[11.5px] text-[#4A4440] first:pt-0 last:pb-0">{item.done?<CheckCircle2 size={14} className="shrink-0 text-[#5A6E52]"/>:<TriangleAlert size={14} className="shrink-0 text-[#C69A52]"/>}<span className="min-w-0 flex-1">{item.label}</span><span className={`text-[9px] ${item.done?'text-[#5A6E52]':'text-[#C9727E]'}`}>{item.done?'Done':'Review →'}</span></Link>)}</div></Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Card><div className="flex items-center gap-2"><CalendarDays size={14} className="text-[#9A7A3D]"/><h2 className="glow-display text-[18px]">Important Dates</h2></div><div className="mt-4 space-y-4 text-[11px]"><p className="flex justify-between gap-3"><span>Last Google sync</span><span className="text-[#9A9088]">{googleDate?googleDate.toLocaleString():'Not yet'}</span></p><p className="flex justify-between gap-3"><span>Last Apple import</span><span className="text-[#9A9088]">{appleDate?appleDate.toLocaleString():'Not yet'}</span></p></div></Card>
        <Card><div className="flex items-center gap-2"><LockKeyhole size={14} className="text-[#9A7A3D]"/><h2 className="glow-display text-[18px]">Connection Notes</h2></div><div className="mt-4 space-y-4"><div><p className="text-[11.5px] font-medium">Google</p><p className="mt-1 text-[10px] leading-4 text-[#9A9088]">Calendar and Gmail stay read-only. Glow creates Glow-side actions only when you choose them.</p></div><div><p className="text-[11.5px] font-medium">Apple Reminders</p><p className="mt-1 text-[10px] leading-4 text-[#9A9088]">Your Shortcut imports selected reminder copies. Apple remains the original source.</p></div></div></Card>
        <Card><div className="flex items-center justify-between"><div className="flex items-center gap-2"><Sparkles size={14} className="text-[#C9727E]"/><h2 className="glow-display text-[18px]">Connection Map</h2></div><Link href="/graph" className="text-[10px] text-[#C9727E]">View full map</Link></div><div className="relative mx-auto mt-5 h-44 max-w-[260px]"><div className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#F1E8D9] glow-display text-[15px]">{session.user.name?.split(' ')[0]??'You'}</div><Link href="#google-connection" className="absolute left-3 top-8 rounded-full border border-[#E9D8D4] bg-white px-3 py-2 text-[10px]">Google</Link><Link href="/calendar" className="absolute right-2 top-8 rounded-full border border-[#E9D8D4] bg-white px-3 py-2 text-[10px]">Calendar</Link><Link href="/gmail" className="absolute bottom-5 left-5 rounded-full border border-[#E9D8D4] bg-white px-3 py-2 text-[10px]">Gmail</Link><Link href="#apple-reminders" className="absolute bottom-5 right-4 rounded-full border border-[#E9D8D4] bg-white px-3 py-2 text-[10px]">Reminders</Link></div><div className="rounded-[12px] bg-[#FFF8F5] p-3 text-[10px] text-[#8A8078]">You have {connectedCount} fully ready connection group{connectedCount===1?'':'s'}.</div></Card>
      </section>

      <section id="connection-details" className="grid scroll-mt-24 gap-4 lg:grid-cols-2"><div id="google-connection" className="scroll-mt-24"><GoogleConnectionCard overview={overview}/></div><div id="apple-reminders" className="scroll-mt-24"><AppleRemindersCard connection={appleConnection}/></div></section>

      <Card><div className="flex items-center gap-2"><Mail size={14} className="text-[#C9727E]"/><h2 className="glow-display text-[18px]">Private Shortcuts</h2></div><div className="mt-4 flex flex-wrap gap-2">{shortcuts.map(item=><a key={item.name} href={item.href} target="_blank" rel="noopener noreferrer" className="rounded-full border border-[#F1E7E3] bg-white px-3 py-2 text-[10.5px] text-[#4A4440]">{item.name} ↗</a>)}</div></Card>

      <Card className="grid gap-4 bg-[linear-gradient(90deg,#FFF,#FFF7F5)] lg:grid-cols-[160px_1fr_auto] lg:items-center"><div className="flex items-center gap-2"><Sparkles size={14} className="text-[#C9727E]"/><span className="glow-display text-[18px]">Glow Insight</span></div><p className="glow-display text-[17px] italic text-[#4A4440]">Your connection pattern is strongest when every service has a clear purpose and permission boundary.</p><span className="text-[10px] text-[#9A9088]">{connectedCount}/2 ready</span></Card>
    </div>
  </SectionPage></AppShell>;
}
