import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { GoogleConnectionCard } from '@/components/connections/google-connection-card';
import { AppleRemindersCard } from '@/components/connections/apple-reminders-card';
import { getConnectionsOverview } from '@/lib/data/connections';
import { getAppleReminderConnection } from '@/lib/apple-reminders/service';
import { getRecentInboxMessages } from '@/lib/google/gmail-client';
import { BriefcaseBusiness, Check, CheckCircle2, Mail, Network, TriangleAlert, UserRound, Users } from 'lucide-react';

export const dynamic='force-dynamic';

function senderName(value:string){const quoted=value.match(/^"([^"]+)"/);if(quoted?.[1])return quoted[1];const angle=value.indexOf('<');if(angle>0)return value.slice(0,angle).trim();const email=value.match(/^([^@<]+)@/);return email?.[1]?.replace(/[._-]+/g,' ')||value||'Unknown sender'}
function initials(name:string){return name.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]?.toUpperCase()).join('')||'•'}

export default async function ConnectionsPage(){
 const session=await auth();if(!session?.user?.id)redirect('/sign-in');
 const [overview,appleConnection,gmail]=await Promise.all([getConnectionsOverview(session.user.id),getAppleReminderConnection(session.user.id),getRecentInboxMessages(session.user.id)]);
 const googleHealthy=overview.connected&&overview.calendarState==='connected'&&overview.hasCalendarScope&&overview.hasGmailScope;
 const appleHealthy=appleConnection?.status==='connected';
 const connectedCount=[googleHealthy,appleHealthy].filter(Boolean).length;
 const followUps=[
  {label:'Review Gmail permission',done:overview.hasGmailScope,href:'#google-connection'},
  {label:'Review Calendar permission',done:overview.hasCalendarScope&&overview.calendarState==='connected',href:'#google-connection'},
  {label:'Confirm Apple bridge',done:appleHealthy,href:'#apple-reminders'},
 ];
 const raw=gmail.ok?gmail.messages:[];
 const seen=new Set<string>();const people=raw.filter(m=>{const key=m.from.toLowerCase();if(!key||seen.has(key))return false;seen.add(key);return true}).slice(0,6);
 const growth:number[]=[];const growthSeen=new Set<string>();[...raw].reverse().forEach(m=>{const key=m.from.toLowerCase();if(key)growthSeen.add(key);growth.push(growthSeen.size)});const maxGrowth=Math.max(1,...growth);
 const attention=followUps.filter(x=>!x.done).length;
 const unavailableTabs=['Mentors','Teams','Groups','Collabs'];
 return <AppShell><div className="b9-connections-page">
  <header className="b9-c-head"><div><p className="b9-system-kicker">7. CONNECTIONS</p><h1>Connections</h1><p>Your people. Your network.</p></div><Link href="#connection-details" className="b8-soft-btn">Manage Sources</Link></header>
  <nav className="b9-c-tabs" aria-label="Connection views"><span className="active">People</span>{unavailableTabs.map(label=><span key={label} aria-disabled="true" title={`${label} view needs structured relationship data`} className="is-disabled">{label}</span>)}</nav>
  <section className="b9-c-metrics"><article><small>Recent People</small><strong>{people.length}</strong></article><article><small>Ready Sources</small><strong>{connectedCount}/2</strong></article><article><small>Source Follow Ups</small><strong>{attention}</strong></article><article><small>Inbox Sample</small><strong>{raw.length}</strong></article></section>
  <section className="b9-c-main">
   <article className="b9-c-card"><div className="b9-c-title"><h2>Recent People</h2><span>{gmail.ok?'From recent Gmail metadata':'Gmail unavailable'}</span></div><div className="b9-people-list">{people.length?people.map((m,i)=>{const name=senderName(m.from);return <Link href="/gmail" key={m.id} className="b9-person"><span className="b9-avatar">{initials(name)}</span><div><strong>{name}</strong><small>{m.subject}</small></div><em>{i===0?'Recent':'Contact'}</em></Link>}):<div className="b9-empty"><Users size={16}/><p>No recent correspondents are available from the connected inbox sample.</p><Link href="/gmail">Open Gmail →</Link></div>}</div></article>
   <article className="b9-c-card"><div className="b9-c-title"><h2>Next Follow Ups</h2><span>Connection health</span></div><div className="b9-follow-list">{followUps.map(item=><Link key={item.label} href={item.href} className="b9-follow">{item.done?<CheckCircle2 size={12}/>:<TriangleAlert size={12}/>}<span>{item.label}</span><em>{item.done?'Ready':'Review'}</em></Link>)}</div><div className="b9-c-note"><Network size={13}/><p>Mentor, team, group, and collaborator totals stay unavailable until Glow has structured relationship data for them.</p></div></article>
  </section>
  <section className="b9-c-card b9-network-growth"><div className="b9-c-title"><h2>Recent Correspondent Growth</h2><span>{people.length?`${people.length} unique correspondents in the current sample`:'No recent sample'}</span></div>{growth.length?<div className="b9-line-chart" aria-label="Cumulative unique correspondents in recent Gmail sample">{growth.map((value,i)=><i key={i} style={{height:`${Math.round(value/maxGrowth*100)}%`}}/>)}</div>:<div className="b9-empty b9-empty-chart"><Network size={16}/><p>No Gmail sample is available to plot.</p></div>}</section>
  <details id="connection-details" className="b9-c-details"><summary><BriefcaseBusiness size={12}/> Service connection settings</summary><div className="mt-3 grid gap-3 lg:grid-cols-2"><div id="google-connection"><GoogleConnectionCard overview={overview}/></div><div id="apple-reminders"><AppleRemindersCard connection={appleConnection}/></div></div><div className="mt-3 flex flex-wrap gap-2 text-[8px] text-[#8e847d]"><span className="inline-flex items-center gap-1"><Mail size={10}/> Gmail metadata only for recent people</span><span className="inline-flex items-center gap-1"><Check size={10}/> Calendar + Gmail remain permission-aware</span><span className="inline-flex items-center gap-1"><UserRound size={10}/> No invented contact totals</span></div></details>
 </div></AppShell>
}
