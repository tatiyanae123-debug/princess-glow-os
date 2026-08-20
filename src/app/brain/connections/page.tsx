import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { buildBrainConnections } from '@/lib/intelligence/brain-connections';
import { Link2, Plus, ShieldCheck, Smile } from 'lucide-react';

export const dynamic = 'force-dynamic';
const BASIS_LABEL: Record<string,string>={stored:'Stored',inferred:'Inferred',system:'System'};

export default async function BrainConnectionsPage(){
 const session=await auth();if(!session?.user?.id)redirect('/sign-in');
 const connections=await buildBrainConnections(session.user.id);const top=connections.types.slice(0,3);
 return <AppShell><div className="b10-root b10-connection"><header className="b10-head"><div><p className="b10-eyebrow">4. BRAIN CONNECTION — CHILD VIEWS</p><h1>Brain Connection</h1><p>Connected minds. Peace of mind.</p></div><Link href="/brain?addConnection=1" className="b10-primary"><Plus size={12}/> Add Connection</Link></header>
  <div className="b10-people-strip">{top.length?top.map((type,i)=><Link href={`/brain/connections/${type.id}`} key={type.id}><span className="b10-person-avatar"><Link2 size={18}/></span><strong>{type.label}</strong><small>{BASIS_LABEL[type.basis]||type.basis}</small></Link>):<div className="b10-person-empty"><Link2 size={20}/><strong>No active connections yet</strong><small>Create links in Brain; Glow will not invent relationships.</small></div>}<Link href="/brain?addConnection=1" className="b10-person-add"><Plus size={20}/><span>Add</span></Link></div>
  <div className="b10-tabs"><span className="active">Overview</span><Link href="/brain">Activity</Link><Link href="/calendar">Schedule</Link><Link href="/notes">Notes</Link><Link href="/wellness">Wellness</Link></div>
  <h2 className="b10-section-title">At a Glance</h2><div className="b10-connection-metrics">{[['Connection Types',connections.activeTypeCount],['Active Links',connections.totalInstances],['Stored',connections.types.filter(x=>x.basis==='stored').length],['Inferred',connections.types.filter(x=>x.basis==='inferred').length]].map(([label,value])=><div className="b10-card" key={String(label)}><strong>{value}</strong><span>{label}</span></div>)}</div>
  <div className="b10-connection-lower"><section className="b10-card"><h2>Connection Activity</h2>{connections.types.length?connections.types.slice(0,5).map(type=><Link key={type.id} href={`/brain/connections/${type.id}`} className="b10-connection-event"><span>{type.instances.length}</span><strong>{type.label}</strong></Link>):<div className="b10-empty">No relationship activity yet.</div>}</section><section className="b10-card b10-wellness-check"><h2>Connection Integrity</h2><Smile size={38}/><strong>{connections.totalInstances?'Connected data is traceable':'Waiting for real links'}</strong><p>Every link must come from stored data, a deterministic rule, or a shared underlying system.</p><Link href="/brain" className="b10-soft">View Brain</Link></section></div>
  <div className="b10-notice-footer"><ShieldCheck size={13}/><span>Glow never invents a relationship.</span><Link href="/brain">Back to Brain →</Link></div>
 </div></AppShell>;
}
