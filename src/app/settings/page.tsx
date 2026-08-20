import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { SettingsControlCenter } from '@/components/settings/settings-control-center';
import { getConnectionsOverview } from '@/lib/data/connections';
import { getAppleReminderConnection } from '@/lib/apple-reminders/service';
import { signOutAction } from '@/app/actions/account';
import { CheckCircle2, ChevronRight, LogOut, Plug, RefreshCw, Smartphone, UserRound } from 'lucide-react';

export const dynamic = 'force-dynamic';
function stateLabel(state:string){if(state==='connected')return'Connected';if(state==='needs_reauthorization')return'Needs reauthorization';if(state==='error')return'Attention needed';return'Not connected'}

export default async function SettingsPage(){
 const session=await auth();if(!session?.user?.id)redirect('/sign-in');
 const [overview,appleConnection]=await Promise.all([getConnectionsOverview(session.user.id),getAppleReminderConnection(session.user.id)]);
 const googleHealthy=overview.connected&&overview.calendarState==='connected'&&overview.hasCalendarScope&&overview.hasGmailScope;const appleHealthy=appleConnection?.status==='connected';
 const googleStatus=googleHealthy?'Calendar + Gmail ready':overview.connected&&overview.calendarState==='connected'?`Partial · Calendar ${overview.hasCalendarScope?'✓':'—'} · Gmail ${overview.hasGmailScope?'✓':'—'}`:`${stateLabel(overview.calendarState)} · Calendar ${overview.hasCalendarScope?'✓':'—'} · Gmail ${overview.hasGmailScope?'✓':'—'}`;
 return <AppShell><div className="b8-settings-page space-y-4">
  <header><p className="b8-eyebrow">1. SETTINGS</p><h1>Settings</h1><p className="mt-1 text-[10px] text-[#8A8078]">Customize your experience.</p></header>
  <div className="grid gap-3 lg:grid-cols-[1fr_1fr]">
   <section className="rounded-[8px] border border-[#eee5e1] bg-white p-3">
    <p className="text-[10px] font-semibold text-[#3d3632]">Account & Profile</p>
    <div className="mt-3 flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F1E0D9] text-[#8A5A56]"><UserRound size={17}/></span><div className="min-w-0 flex-1"><p className="truncate text-[11px] font-medium">{session.user.name??'Glow Member'}</p><p className="truncate text-[9px] text-[#9A9088]">{session.user.email??'No email on file'}</p></div><form action={signOutAction}><button aria-label="Sign out" className="rounded-full border border-[#eee5e1] p-2 text-[#8A8078]"><LogOut size={12}/></button></form></div>
    <div className="mt-3 divide-y divide-[#eee7e2]">{[['Notifications','/notices'],['Privacy & Security','/connections'],['Data & Sync','/import'],['Integrations','/connections'],['Voice & AI','/settings/intelligence']].map(([label,href])=><Link key={label} href={href} className="flex items-center justify-between py-2 text-[9px] text-[#5f5651]"><span>{label}</span><ChevronRight size={11}/></Link>)}</div>
   </section>
   <section className="rounded-[8px] border border-[#eee5e1] bg-white p-3">
    <div className="flex items-center justify-between"><p className="text-[10px] font-semibold text-[#3d3632]">System Status</p><Link href="/connections" className="text-[8px] text-[#8e495a]">Manage</Link></div>
    <div className="mt-3 space-y-2 text-[9px]">{[['Database','Operational',true],['AI Brain','Operational',true],['Google','Calendar + Gmail',googleHealthy],['Apple Reminders',appleHealthy?'Connected':'Setup needed',appleHealthy],['Notifications','Operational',true]].map(([label,status,ok])=><div key={String(label)} className="flex items-center justify-between"><span>{String(label)}</span><span className={ok?'text-[#62735a]':'text-[#a27b42]'}>{String(status)} ●</span></div>)}</div>
    <div className="mt-3 border-t border-[#eee7e2] pt-3"><div className="flex items-center gap-2"><Plug size={12} className="text-[#8e495a]"/><p className="text-[9px] font-medium">Connections</p></div><div className="mt-2 grid gap-2"><Link href="/connections#google-connection" className="rounded-[6px] border border-[#eee5e1] p-2"><div className="flex items-center gap-2 text-[9px]">{googleHealthy?<CheckCircle2 size={11} className="text-[#5A6E52]"/>:<RefreshCw size={11} className="text-[#9A7A3D]"/>}Google</div><p className="mt-1 text-[8px] text-[#9A9088]">{googleStatus}</p></Link><Link href="/connections#apple-reminders" className="rounded-[6px] border border-[#eee5e1] p-2"><div className="flex items-center gap-2 text-[9px]"><Smartphone size={11} className={appleHealthy?'text-[#5A6E52]':'text-[#9A7A3D]'}/>Apple Reminders</div><p className="mt-1 text-[8px] text-[#9A9088]">{appleHealthy?'Connected':'Shortcut setup required'}</p></Link></div></div>
   </section>
  </div>
  <SettingsControlCenter/>
  <div className="flex items-center justify-between rounded-[8px] border border-[#eee5e1] bg-[#fbf7f5] px-3 py-2 text-[8px] text-[#8A8078]"><span>About Glow OS</span><span>v3.0 · Batch 8 system reference</span></div>
 </div></AppShell>
}
