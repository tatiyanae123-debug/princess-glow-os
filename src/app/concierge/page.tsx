import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { getAiProposals } from '@/lib/data/completion-v1';
import { buildPersonalContext } from '@/lib/intelligence/context';
import { getNotesByUser } from '@/lib/data/notes';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import { createConciergeProposalAction, decideConciergeProposalAction, reverseConciergeProposalAction } from '@/app/actions/concierge';
import { BrainCircuit, CalendarDays, Check, Clock3, FileUp, Mic, NotebookPen, RotateCcw, Search, X } from 'lucide-react';
import { ImmersiveRoomChrome, ImmersiveTopControls, OpenGlowCommand, QuickAddGlow } from '@/components/immersive/immersive-room-chrome';

export const dynamic='force-dynamic';
const BG='https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=2200&q=92';
const PEARL='https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=700&q=88';

type Payload=Record<string,unknown>&{execution?:{entityId?:string;reversedAt?:string}};
const payloadOf=(v:unknown)=>v&&typeof v==='object'?v as Payload:{};
function when(date:Date){const ms=date.getTime()-Date.now();const h=Math.round(ms/3600000);if(h>=0&&h<24)return h===0?'Soon':`In ${h}h`;const d=Math.round(ms/86400000);return d===0?'Today':d===1?'Tomorrow':date.toLocaleDateString('en-US',{month:'short',day:'numeric'});}

export default async function ConciergePage(){
 const session=await auth();if(!session?.user?.id)redirect('/sign-in');const userId=session.user.id;const name=session.user.name?.split(' ')[0]??'Tatiyana';
 const [proposals,context,notes,events]=await Promise.all([getAiProposals(userId),buildPersonalContext(userId).catch(()=>null),getNotesByUser(userId),getCalendarEventsByUser(userId)]);
 const pending=proposals.filter(p=>p.status==='pending').slice(0,5);const recent=proposals.filter(p=>p.status!=='pending').slice(0,4);const upcomingEvents=events.filter(e=>e.startAt.getTime()>=Date.now()).sort((a,b)=>a.startAt.getTime()-b.startAt.getTime()).slice(0,2);
 const suggestions:string[]=[];
 if(context?.recommendations?.[0]?.title)suggestions.push(context.recommendations[0].title);
 if(upcomingEvents[0])suggestions.push(`${upcomingEvents[0].title} · ${when(upcomingEvents[0].startAt)}`);
 if(context?.attentionSignals?.[0]?.label)suggestions.push(context.attentionSignals[0].label);
 if(notes[0]?.title)suggestions.push(`Continue ${notes[0].title}`);
 if(!suggestions.length)suggestions.push('Glow suggestions will appear as your real data creates useful signals.');
 return <AppShell><div className="ir-world concierge-world">
  <img className="ir-backdrop" src={BG} alt="Pearl floral concierge environment" data-glow-image-key="concierge-background"/>
  <ImmersiveRoomChrome name={name} image={session.user.image}/><ImmersiveTopControls/>
  <main className="concierge-main">
   <header className="concierge-title"><span>✧</span><h1>Glow Concierge</h1><p>Your intelligent assistant.</p><i/></header>
   <section className="concierge-console ir-glass">
    <div className="concierge-hello"><h2>Hello, {name}.</h2><p>How can I help you today?</p></div>
    <OpenGlowCommand label="Ask me anything..."/>
    <div className="concierge-popular"><span>✧ Popular Actions</span><div><Link href="/planning">Plan my day</Link><Link href="/focus">Find time to work out</Link><Link href="/work/interviews">Prep for interview</Link><Link href="/food">Grocery list</Link></div></div>
    <div className="concierge-capabilities"><Link href="/brain"><span><BrainCircuit/></span><strong>Open Brain</strong><small>Get insights</small></Link><Link href="/memory"><span><Search/></span><strong>Search Memory</strong><small>Find anything</small></Link><div><span><NotebookPen/></span><strong>Create Task</strong><small>Add to your list</small><QuickAddGlow module="task" label="Create"/></div><Link href="/intake"><span><FileUp/></span><strong>Import Info</strong><small>From anywhere</small></Link></div>
   </section>
   <section className="concierge-suggestions ir-glass"><div className="concierge-strip-title">✧ Glow Suggestions</div><div className="concierge-suggestion-grid">{suggestions.slice(0,3).map((s,i)=><article key={`${s}-${i}`}><img src={i%2?BG:PEARL} alt="" data-glow-image-key={`concierge-suggestion-${i}`}/><p>{s}</p></article>)}</div></section>
   <nav className="concierge-dock ir-glass"><Link href="/search"><span><Mic/></span><small>Voice</small></Link><Link href="/calendar"><span><CalendarDays/></span><small>Calendar</small></Link><Link href="/search" className="center"><span>✦</span><small>Glow</small></Link><Link href="/notes"><span><NotebookPen/></span><small>Notes</small></Link><Link href="/reminders"><span><Clock3/></span><small>Reminders</small></Link></nav>
  </main>
  <details id="concierge-history" className="concierge-history ir-glass"><summary><Clock3 size={14}/> Requests <b>{pending.length}</b></summary><div><form action={createConciergeProposalAction} className="concierge-new-request"><input type="hidden" name="actionType" value="advisory"/><input name="intent" required placeholder="Request title"/><textarea name="summary" required rows={2} placeholder="What should Glow help with?"/><textarea name="reason" required rows={2} placeholder="Why does this matter?"/><button>Save request</button></form>{pending.length?pending.map(p=><article key={p.id}><div><strong>{p.summary}</strong><small>{p.reason}</small></div><div><form action={decideConciergeProposalAction.bind(null,p.id,'approved')}><button aria-label="Approve"><Check size={11}/></button></form><form action={decideConciergeProposalAction.bind(null,p.id,'rejected')}><button aria-label="Reject"><X size={11}/></button></form></div></article>):<p className="ir-empty">No pending requests.</p>}{recent.map(p=>{const payload=payloadOf(p.payload);const canReverse=p.status==='approved'&&p.reversible&&payload.execution?.entityId&&!payload.execution.reversedAt;return <article key={p.id}><div><strong>{p.summary}</strong><small>{p.status}</small></div>{canReverse?<form action={reverseConciergeProposalAction.bind(null,p.id)}><button aria-label="Undo"><RotateCcw size={11}/></button></form>:null}</article>})}</div></details>
 </div></AppShell>;
}
