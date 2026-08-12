'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CalendarDays, Check, Clock3, Crown, Droplets, Heart, Moon, PackageOpen, Pencil, Plus, ShoppingBag, Sparkles, Sun, Trash2 } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { BeautyRoutineForm } from '@/components/beauty/beauty-routine-form';
import { useServerAction } from '@/lib/hooks/use-server-action';
import { deleteBeautyRoutineAction } from '@/app/actions/beauty-routines';
import type { BeautyRoutine, CalendarEvent, Task } from '@/lib/types';

type Props = { initialRoutines: BeautyRoutine[]; events: CalendarEvent[]; tasks: Task[] };
const beautyWords = /beauty|skin|makeup|body care|facial|brow|lash|wax|nail|spa|treatment|glow/i;
const treatmentWords = /facial|treatment|brow|lash|wax|peel|laser|nail|spa/i;
const dateLabel = (date?: Date | null) => date ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date) : 'Not scheduled';

export function BeautyRoutineManager({ initialRoutines, events, tasks }: Props) {
  const [routines, setRoutines] = useState(initialRoutines);
  const [dialogRoutine, setDialogRoutine] = useState<BeautyRoutine | 'new' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BeautyRoutine | null>(null);
  const del = useServerAction((id: string) => deleteBeautyRoutineAction(id));
  const now = new Date();
  const morning = routines.filter((routine) => routine.timeOfDay === 'morning');
  const evening = routines.filter((routine) => ['evening', 'night'].includes(routine.timeOfDay));
  const body = routines.filter((routine) => /body|lotion|shower|exfoliat/i.test(`${routine.name} ${routine.notes ?? ''}`));
  const makeup = routines.filter((routine) => /makeup|lip|mascara|foundation|blush/i.test(`${routine.name} ${routine.notes ?? ''} ${(routine.products ?? []).join(' ')}`));
  const beautyEvents = events.filter((event) => beautyWords.test(`${event.title} ${event.description ?? ''}`)).sort((a,b) => a.startAt.getTime() - b.startAt.getTime());
  const beautyTasks = tasks.filter((task) => beautyWords.test(`${task.title} ${task.description ?? ''}`));
  const openTasks = beautyTasks.filter((task) => !['done','cancelled'].includes(task.status)).sort((a,b) => (a.dueDate?.getTime() ?? Infinity) - (b.dueDate?.getTime() ?? Infinity));
  const treatments = [...beautyEvents.filter((event) => event.startAt >= now && treatmentWords.test(event.title)).map((event) => ({ title: event.title, date: event.startAt, kind: 'Appointment' })), ...openTasks.filter((task) => task.dueDate && treatmentWords.test(task.title)).map((task) => ({ title: task.title, date: task.dueDate!, kind: 'Task' }))].sort((a,b) => a.date.getTime() - b.date.getTime());
  const products = Array.from(new Set(routines.flatMap((routine) => routine.products ?? [])));
  const nextAction = openTasks.find((task) => task.dueDate && task.dueDate >= now) ?? openTasks[0] ?? null;
  const insight = treatments[0] ? `${treatments[0].title} is the next recorded beauty treatment on ${dateLabel(treatments[0].date)}.` : routines.length ? `Your vanity contains ${routines.length} stored routine step${routines.length === 1 ? '' : 's'}; completion history is not currently persisted.` : 'There is not enough Beauty routine history to identify a pattern yet.';

  function saved(routine: BeautyRoutine) { setRoutines((current) => current.some((item) => item.id === routine.id) ? current.map((item) => item.id === routine.id ? routine : item) : [...current, routine]); setDialogRoutine(null); }
  function remove() { if (deleteTarget) del.run(deleteTarget.id, () => { setRoutines((current) => current.filter((item) => item.id !== deleteTarget.id)); setDeleteTarget(null); }); }

  return <div className="beauty-page">
    <header className="beauty-heading"><div><h1>Beauty OS <Crown /></h1><p>Enhance your natural glow. Inside &amp; out.</p></div><button onClick={() => setDialogRoutine('new')}><Plus /> Add beauty step</button></header>
    <nav className="beauty-tabs" aria-label="Beauty sections">{['Today','Routines','Skin','Makeup','Body','Treatments','Progress','Schedule'].map((tab,index) => <a className={index === 0 ? 'active' : ''} href={`#${tab.toLowerCase()}`} key={tab}>{tab}</a>)}</nav>
    <div className="beauty-layout"><main>
      <section className="vanity-hero" id="today"><div className="vanity-copy"><span>TODAY&apos;S BEAUTY FOCUS</span><h2>{nextAction?.title ?? (routines.length ? 'Return to your ritual' : 'Build your beauty ritual')}</h2><p>{nextAction ? 'Your next stored beauty action is ready when you are.' : 'Your personal vanity brings real routines, products, and treatments into one calm place.'}</p><ul><li className={morning.length ? 'ready' : ''}><i>{morning.length ? <Check /> : null}</i> Morning Beauty <small>{morning.length || 'Not set'}</small></li><li className={evening.length ? 'ready' : ''}><i>{evening.length ? <Check /> : null}</i> Evening Beauty <small>{evening.length || 'Not set'}</small></li><li className={products.length ? 'ready' : ''}><i>{products.length ? <Check /> : null}</i> Product Rotation <small>{products.length || 'Empty'}</small></li><li className={treatments.length ? 'ready' : ''}><i>{treatments.length ? <Check /> : null}</i> Next Treatment <small>{treatments[0] ? dateLabel(treatments[0].date) : 'None'}</small></li></ul><Link href={nextAction ? '/tasks' : '#routines'}>{nextAction ? 'View Beauty Action' : 'Open My Vanity'} <ArrowRight /></Link></div><div className="vanity-image"><img src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1400&q=85" alt="Champagne and blush personal beauty vanity" /><blockquote>You don&apos;t<br/>need more.<br/>You need<br/>consistency.</blockquote></div></section>
      <div className="beauty-workspace" id="routines">
        <RoutineDrawer title="MORNING BEAUTY" icon={<Sun />} routines={morning} empty="No morning routine recorded" onEdit={setDialogRoutine} />
        <RoutineDrawer title="EVENING BEAUTY" icon={<Moon />} routines={evening} empty="No evening routine recorded" onEdit={setDialogRoutine} dark />
      </div>
      <div className="beauty-board">
        <BeautyPanel id="body" title="BODY CARE" icon={<Heart />} link="#routines">{body.length ? body.slice(0,4).map((item) => <BeautyRow item={item} key={item.id} onEdit={setDialogRoutine} />) : <Empty title="No body-care routine" text="Add a real body-care step to create this ritual." />}</BeautyPanel>
        <BeautyPanel id="makeup" title="MAKEUP ROTATION" icon={<Sparkles />} link="#routines">{makeup.length ? makeup.slice(0,4).map((item) => <BeautyRow item={item} key={item.id} onEdit={setDialogRoutine} />) : <Empty title="Makeup rotation unconnected" text="No dedicated makeup inventory is persisted." />}</BeautyPanel>
        <BeautyPanel id="treatments" title="TREATMENT CALENDAR" icon={<CalendarDays />} link="/calendar">{treatments.length ? treatments.slice(0,4).map((item) => <div className="beauty-date-row" key={`${item.title}${item.date}`}><time>{dateLabel(item.date)}</time><span>{item.title}</span><small>{item.kind}</small></div>) : <Empty title="No treatments scheduled" text="Beauty appointments and dated tasks appear here." />}</BeautyPanel>
        <BeautyPanel id="progress" title="BEAUTY PROGRESS" icon={<Droplets />} link="#routines"><div className="beauty-progress-empty"><strong>{routines.length}</strong><span>stored routine steps</span><p>Completion history is not persisted, so no streak or consistency score is shown.</p></div></BeautyPanel>
        <BeautyPanel title="FAVORITES + REPURCHASE" icon={<ShoppingBag />} link="#routines">{products.length ? products.slice(0,5).map((product,index) => <div className="beauty-product" key={product}><i>{index+1}</i><span><b>{product}</b><small>Saved in a Beauty routine</small></span></div>) : <Empty title="No favorites recorded" text="Add products to routine steps to populate your vanity." />}</BeautyPanel>
        <BeautyPanel title="PRODUCT ROTATION" icon={<PackageOpen />} link="#routines">{products.length ? <div className="vanity-shelf">{products.slice(0,6).map((product,index) => <div key={product}><i className={`bottle b${index%3}`}></i><small>{product}</small></div>)}</div> : <Empty title="Vanity shelf is empty" text="Stored product names appear here without invented usage dates." />}</BeautyPanel>
      </div>
      <section className="beauty-intelligence"><strong>AI<br/>✦</strong><div><b>GLOW BEAUTY COACH</b><p>{insight}</p></div><Link href={treatments[0] ? '/calendar' : '#routines'}>{treatments[0] ? 'View Treatment' : 'Review Routines'} <ArrowRight /></Link></section>
    </main><aside className="beauty-rail">
      <section><h2>TODAY&apos;S BEAUTY ROUTINE</h2><strong>{morning.length + evening.length} steps</strong><p>{morning.length} morning · {evening.length} evening</p><button onClick={() => setDialogRoutine('new')}>Add Routine Step</button></section>
      <section><h2>NEXT TREATMENT</h2>{treatments[0] ? <><strong>{treatments[0].title}</strong><p><CalendarDays /> {dateLabel(treatments[0].date)}</p><Link href="/calendar">Open Calendar <ArrowRight /></Link></> : <Empty title="Nothing scheduled" text="No real treatment task or event was found." />}</section>
      <section><h2>ROUTINE PROGRESS</h2><div className="beauty-ring"><strong>—<small>No history</small></strong></div><p>Glow OS does not currently persist Beauty completion history.</p></section>
      <section><h2>VANITY ROTATION</h2><strong>{products.length}</strong><p>unique stored product{products.length === 1 ? '' : 's'}</p>{products.slice(0,3).map((product) => <span className="rail-product" key={product}>{product}</span>)}</section>
      <section><h2>UPCOMING APPOINTMENT</h2>{beautyEvents.find((event) => event.startAt >= now) ? <><strong>{beautyEvents.find((event) => event.startAt >= now)!.title}</strong><p><Clock3 /> {dateLabel(beautyEvents.find((event) => event.startAt >= now)!.startAt)}</p></> : <Empty title="No Beauty appointment" text="Beauty-related calendar events appear here." />}</section>
    </aside></div>
    <Dialog open={dialogRoutine !== null} onClose={() => setDialogRoutine(null)} title={dialogRoutine === 'new' ? 'Add beauty step' : 'Edit beauty step'}><BeautyRoutineForm routine={dialogRoutine === 'new' ? null : dialogRoutine} onSaved={saved} onCancel={() => setDialogRoutine(null)} /></Dialog>
    <ConfirmDialog open={deleteTarget !== null} title="Delete this Beauty step?" description={deleteTarget ? `“${deleteTarget.name}” will be removed.` : undefined} pending={del.isPending} onCancel={() => setDeleteTarget(null)} onConfirm={remove} />
    {routines.length > 0 && <div className="beauty-delete-access"><button onClick={() => setDeleteTarget(routines.at(-1)!)}><Trash2 /> Manage deletion</button></div>}
  </div>;
}

function RoutineDrawer({ title, icon, routines, empty, onEdit, dark = false }: { title: string; icon: React.ReactNode; routines: BeautyRoutine[]; empty: string; onEdit: (item: BeautyRoutine) => void; dark?: boolean }) { return <section className={`routine-drawer ${dark ? 'evening' : ''}`}><header><h2>{icon}{title}</h2><span>{routines.length} steps</span></header>{routines.length ? <div className="routine-sequence">{routines.map((item,index) => <article key={item.id}><i>{index+1}</i><div><b>{item.name}</b><small>{(item.products ?? []).join(' · ') || 'No product stored'}</small></div><button onClick={() => onEdit(item)} aria-label={`Edit ${item.name}`}><Pencil /></button></article>)}</div> : <Empty title={empty} text="Use Add beauty step to connect a persisted routine." />}</section>; }
function BeautyPanel({ title, icon, link, id, children }: { title: string; icon: React.ReactNode; link: string; id?: string; children: React.ReactNode }) { return <section className="beauty-panel" id={id}><header><h2>{icon}{title}</h2><Link href={link}>View <ArrowRight /></Link></header><div>{children}</div></section>; }
function BeautyRow({ item, onEdit }: { item: BeautyRoutine; onEdit: (item: BeautyRoutine) => void }) { return <button className="beauty-routine-row" onClick={() => onEdit(item)}><i></i><span><b>{item.name}</b><small>{(item.products ?? []).join(', ') || 'No products stored'}</small></span><Pencil /></button>; }
function Empty({ title, text }: { title: string; text: string }) { return <div className="beauty-empty"><Sparkles /><b>{title}</b><p>{text}</p></div>; }
