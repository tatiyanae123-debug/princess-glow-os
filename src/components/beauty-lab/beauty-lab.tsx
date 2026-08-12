'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Beaker, CalendarDays, Check, CircleHelp, FlaskConical, Grid3X3, PackageOpen, Pencil, Plus, Search, Sparkles, Trash2 } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { BeautyRoutineForm } from '@/components/beauty/beauty-routine-form';
import { deleteBeautyRoutineAction } from '@/app/actions/beauty-routines';
import { useServerAction } from '@/lib/hooks/use-server-action';
import type { BeautyRoutine, CalendarEvent, Note, Task } from '@/lib/types';

type Props = { routines: BeautyRoutine[]; events: CalendarEvent[]; notes: Note[]; tasks: Task[] };
const relevant = /beauty|skin|product|serum|cream|cleanser|makeup|facial|treatment|brow|lash/i;
const treatment = /facial|treatment|peel|brow|lash|laser|spa/i;
const fmt = (date?: Date | null) => date ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date) : 'Not scheduled';

export function BeautyLab({ routines: initialRoutines, events, notes, tasks }: Props) {
  const [routines, setRoutines] = useState(initialRoutines);
  const [selected, setSelected] = useState<{ name: string; routines: BeautyRoutine[] } | null>(null);
  const [editing, setEditing] = useState<BeautyRoutine | 'new' | null>(null);
  const [deleting, setDeleting] = useState<BeautyRoutine | null>(null);
  const del = useServerAction((id: string) => deleteBeautyRoutineAction(id));
  const now = new Date();
  const productNames = Array.from(new Set(routines.flatMap((routine) => routine.products ?? [])));
  const products = productNames.map((name) => ({ name, routines: routines.filter((routine) => routine.products?.includes(name)) }));
  const morning = routines.filter((routine) => routine.timeOfDay === 'morning').flatMap((routine) => routine.products ?? []);
  const evening = routines.filter((routine) => ['evening','night'].includes(routine.timeOfDay)).flatMap((routine) => routine.products ?? []);
  const beautyEvents = events.filter((item) => relevant.test(`${item.title} ${item.description ?? ''}`) && item.startAt >= now).sort((a,b) => a.startAt.getTime() - b.startAt.getTime());
  const treatmentItems = [...beautyEvents.filter((item) => treatment.test(item.title)).map((item) => ({ title: item.title, date: item.startAt, source: 'Calendar' })), ...tasks.filter((item) => item.dueDate && !['done','cancelled'].includes(item.status) && treatment.test(item.title)).map((item) => ({ title: item.title, date: item.dueDate!, source: 'Task' }))].sort((a,b) => a.date.getTime() - b.date.getTime());
  const labNotes = notes.filter((item) => relevant.test(`${item.title} ${item.content ?? ''} ${(item.tags ?? []).join(' ')}`));
  const recentlyAdded = [...routines].sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime())[0] ?? null;
  const intelligence = products.length ? `${products.length} unique product${products.length === 1 ? '' : 's'} appear across ${routines.length} stored Beauty step${routines.length === 1 ? '' : 's'}. Ingredient and lifecycle metadata are not connected.` : 'No stored products are available to evaluate. Add products through the existing Beauty routine architecture.';

  function saved(item: BeautyRoutine) { setRoutines((current) => current.some((row) => row.id === item.id) ? current.map((row) => row.id === item.id ? item : row) : [...current,item]); setEditing(null); }
  function remove() { if (deleting) del.run(deleting.id, () => { setRoutines((current) => current.filter((item) => item.id !== deleting.id)); setDeleting(null); setSelected(null); }); }

  return <div className="lab-page">
    <header className="lab-heading"><div><h1>Beauty Lab <FlaskConical /></h1><p>Track. Test. Transform.</p><small>Your private product and ingredient intelligence workspace.</small></div><button onClick={() => setEditing('new')}><Plus /> Add Product</button></header>
    <nav className="lab-tabs" aria-label="Beauty Lab sections">{['Lab','Products','Ingredients','Compatibility','Treatments','Experiments','Progress','Inventory'].map((tab,index) => <a className={index === 0 ? 'active' : ''} href={`#${tab.toLowerCase()}`} key={tab}>{tab}</a>)}</nav>
    <div className="lab-layout"><main>
      <section className="lab-hero" id="lab"><div className="lab-context"><span>TODAY IN YOUR LAB</span><h2>{products.length ? `${products.length} products on the bench` : 'Your private formula room'}</h2><p>{recentlyAdded ? `Most recently added routine context: ${recentlyAdded.name}.` : 'Add products to a Beauty routine to bring them onto the laboratory bench.'}</p><dl><div><dt>Active product names</dt><dd>{products.length}</dd></div><div><dt>AM rotation</dt><dd>{new Set(morning).size}</dd></div><div><dt>PM rotation</dt><dd>{new Set(evening).size}</dd></div><div><dt>Next treatment</dt><dd>{treatmentItems[0] ? fmt(treatmentItems[0].date) : 'None'}</dd></div></dl><button onClick={() => setEditing('new')}>Add Product Context <ArrowRight /></button></div><div className="lab-bench"><img src="https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=1400&q=85" alt="Luxury cosmetic laboratory bench with glass vessels" /><div className="lab-vessels">{products.slice(0,5).map((product,index) => <button key={product.name} onClick={() => setSelected(product)}><i className={`lab-vessel v${index%3}`}></i><small>{product.name}</small></button>)}</div><blockquote>Formulas that<br/>work, for you.</blockquote></div></section>
      <div className="lab-top-grid">
        <LabPanel id="inventory" title="PRODUCT INVENTORY" icon={<PackageOpen />} action={() => setEditing('new')} actionLabel="Add">{products.length ? <div className="lab-inventory">{products.map((product,index) => <button key={product.name} onClick={() => setSelected(product)}><i className={`lab-vessel v${index%3}`}></i><b>{product.name}</b><small>{product.routines.map((item) => item.timeOfDay).join(' · ')}</small></button>)}</div> : <Empty title="No products in inventory" text="Products are sourced from existing Beauty routine steps." />}</LabPanel>
        <LabPanel title="AM / PM PRODUCT ROTATION" icon={<Sparkles />}><Rotation label="AM" names={Array.from(new Set(morning))} /><Rotation label="PM" names={Array.from(new Set(evening))} /></LabPanel>
      </div>
      <div className="lab-module-grid">
        <LabPanel id="ingredients" title="INGREDIENT INTELLIGENCE" icon={<Beaker />}><Empty title="Ingredient data not connected" text="Stored Beauty products contain names only; ingredient lists are not inferred." /></LabPanel>
        <LabPanel id="compatibility" title="COMPATIBILITY MATRIX" icon={<Grid3X3 />}><div className="compatibility-matrix"><div></div>{products.slice(0,3).map((_,i)=><b key={i}>P{i+1}</b>)}{products.slice(0,3).flatMap((product,row) => [<b key={`r${product.name}`}>P{row+1}</b>,...products.slice(0,3).map((_,col)=><i key={`${row}${col}`} className={row === col ? 'same' : ''}>{row === col ? <Check /> : <CircleHelp />}</i>)])}</div><p>Compatibility not evaluated. No reliable ingredient rules are stored.</p></LabPanel>
        <LabPanel id="experiments" title="BEAUTY EXPERIMENTS" icon={<FlaskConical />}><Empty title="No experiments recorded" text="Experiment persistence is not currently available." /></LabPanel>
        <LabPanel title="REACTIONS + NOTES" icon={<Pencil />}>{labNotes.length ? labNotes.slice(0,3).map((note) => <div className="lab-note" key={note.id}><b>{note.title}</b><p>{note.content || 'No observation text'}</p></div>) : <Empty title="No reactions recorded" text="Relevant existing Notes will appear without diagnostic interpretation." />}</LabPanel>
        <LabPanel title="LIFECYCLE + REPURCHASE" icon={<PackageOpen />}><div className="lifecycle-track">{['New','Testing','Active','Nearly Empty','Repurchase','Retired'].map((state)=><span key={state}><i></i>{state}</span>)}</div><p className="limited-label">Lifecycle states, opened dates, expiration, and repurchase status are not persisted.</p></LabPanel>
        <LabPanel id="progress" title="LAB PROGRESS" icon={<Search />}><div className="progress-frames"><i>+</i><i>+</i><i>+</i></div><p className="limited-label">Progress photos not connected. {labNotes.length} relevant note{labNotes.length === 1 ? '' : 's'} available.</p></LabPanel>
      </div>
      <section className="lab-intelligence"><strong>AI<br/>✦</strong><div><b>BEAUTY LAB INTELLIGENCE</b><p>{intelligence}</p></div><button onClick={() => setEditing('new')}>Review Inventory <ArrowRight /></button></section>
    </main><aside className="lab-rail">
      <section><h2>IN THE LAB</h2><strong>{products.length}</strong><p>unique stored products</p>{products.slice(0,4).map((product) => <button className="rail-lab-product" onClick={() => setSelected(product)} key={product.name}><i></i>{product.name}</button>)}</section>
      <section><h2>NEEDS ATTENTION</h2><Empty title="Lifecycle data unavailable" text="No expiration, nearly-empty, or repurchase fields are stored." /></section>
      <section><h2>NEXT TREATMENT</h2>{treatmentItems[0] ? <><strong>{treatmentItems[0].title}</strong><p><CalendarDays /> {fmt(treatmentItems[0].date)}</p><Link href="/calendar">Open Calendar <ArrowRight /></Link></> : <Empty title="Nothing scheduled" text="No supported treatment task or event was found." />}</section>
      <section><h2>PRODUCT ROTATION</h2><p>AM <b>{new Set(morning).size}</b></p><p>PM <b>{new Set(evening).size}</b></p><small>Derived only from stored routine time-of-day relationships.</small></section>
      <section><h2>LAB STATUS</h2><div className="lab-status-grid"><span><b>{routines.length}</b>Routine steps</span><span><b>{products.length}</b>Products</span><span><b>{labNotes.length}</b>Notes</span><span><b>{treatmentItems.length}</b>Treatments</span></div></section>
    </aside></div>
    <Dialog open={editing !== null} onClose={() => setEditing(null)} title={editing === 'new' ? 'Add product through Beauty routine' : 'Edit product context'}><BeautyRoutineForm routine={editing === 'new' ? null : editing} onSaved={saved} onCancel={() => setEditing(null)} /></Dialog>
    <Dialog open={selected !== null} onClose={() => setSelected(null)} title="Product laboratory detail">{selected && <div className="product-detail"><i className="lab-vessel"></i><h3>{selected.name}</h3><p>Used in {selected.routines.length} Beauty routine step{selected.routines.length === 1 ? '' : 's'}.</p>{selected.routines.map((routine) => <article key={routine.id}><b>{routine.name}</b><small>{routine.timeOfDay} · {routine.notes || 'No notes stored'}</small><div><button onClick={() => { setSelected(null); setEditing(routine); }}><Pencil /> Edit</button><button onClick={() => { setSelected(null); setDeleting(routine); }}><Trash2 /> Delete</button></div></article>)}<p className="detail-unavailable">Brand, category, ingredients, opened date, expiration, cost, reaction, and repurchase metadata are not stored.</p></div>}</Dialog>
    <ConfirmDialog open={deleting !== null} title="Delete this Beauty step?" description={deleting ? `“${deleting.name}” will be removed from Beauty and the Lab.` : undefined} pending={del.isPending} onCancel={() => setDeleting(null)} onConfirm={remove} />
  </div>;
}

function LabPanel({ title, icon, children, id, action, actionLabel }: { title: string; icon: React.ReactNode; children: React.ReactNode; id?: string; action?: () => void; actionLabel?: string }) { return <section className="lab-panel" id={id}><header><h2>{icon}{title}</h2>{action && <button onClick={action}>{actionLabel} <Plus /></button>}</header><div>{children}</div></section>; }
function Rotation({ label, names }: { label: string; names: string[] }) { return <div className="rotation-tray"><b>{label}</b><div>{names.length ? names.slice(0,6).map((name,index)=><span key={name}><i className={`lab-vessel v${index%3}`}></i><small>{name}</small></span>) : <em>No products recorded</em>}</div></div>; }
function Empty({ title, text }: { title: string; text: string }) { return <div className="lab-empty"><FlaskConical /><b>{title}</b><p>{text}</p></div>; }
