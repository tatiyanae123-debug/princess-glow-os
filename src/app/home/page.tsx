import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import { getTasksByUser } from '@/lib/data/tasks';
import { getAppointmentsByUser } from '@/lib/data/appointments';
import { updateAppointmentFormAction } from '@/app/actions/appointments';
import { ArrowRight, CalendarDays, Circle, Home as HomeIcon, Shirt, ShoppingBasket, Sparkles, Wrench } from 'lucide-react';

export const dynamic = 'force-dynamic';

const groups = {
  cleaning: ['clean', 'vacuum', 'mop', 'dust', 'bathroom', 'kitchen', 'trash'],
  reset: ['reset', 'tidy', 'declutter', 'organize', 'put away'],
  groceries: ['grocery', 'groceries', 'market', 'shopping', 'whole foods', 'trader joe'],
  laundry: ['laundry', 'wash clothes', 'fold', 'dry cleaning', 'sheets', 'towels'],
  maintenance: ['repair', 'fix', 'maintenance', 'replace', 'service', 'filter', 'battery'],
};

function matches(task: { title: string; description: string | null }, words: string[]) {
  const text = `${task.title} ${task.description ?? ''}`.toLowerCase();
  return words.some((word) => text.includes(word));
}

function TaskList({ items, empty }: { items: Array<{ id: string; title: string; dueDate: Date | null }>; empty: string }) {
  if (!items.length) return <p className="mt-5 text-[11.5px] text-[#9A9088]">{empty}</p>;
  return <div className="mt-4 space-y-3">{items.slice(0, 5).map((task) => <Link href={`/tasks?taskId=${encodeURIComponent(task.id)}`} key={task.id} className="flex items-start gap-2 rounded-[10px] px-1 py-1 text-[11.5px] text-[#4A4440] transition hover:bg-[#F7EEED]/55 hover:text-[#B9586E]"><Circle size={13} className="mt-0.5 shrink-0 text-[#C9BEB7]"/><span className="min-w-0 flex-1">{task.title}</span><span className="shrink-0 text-[9px] text-[#A09690]">{task.dueDate ? task.dueDate.toLocaleDateString('en-US',{month:'short',day:'numeric'}) : ''}</span></Link>)}</div>;
}

function dateTimeLocal(value: Date) {
  const offset = value.getTimezoneOffset();
  return new Date(value.getTime() - offset * 60000).toISOString().slice(0,16);
}

const fieldClass='w-full rounded-[10px] border border-[#EEE4E1] bg-white px-3 py-2 text-[11px] text-[#3A332F] outline-none focus:border-[#D59BA7]';

export default async function HomePage({ searchParams }: { searchParams: Promise<{ appointmentId?: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const [allTasks, appointments, params] = await Promise.all([
    getTasksByUser(session.user.id),
    getAppointmentsByUser(session.user.id),
    searchParams,
  ]);
  const tasks = allTasks.filter((task) => task.status !== 'done' && task.status !== 'cancelled');
  const firstName = session.user.name?.split(' ')[0] || 'Tatiyana';
  const cleaning = tasks.filter((task) => matches(task, groups.cleaning));
  const reset = tasks.filter((task) => matches(task, groups.reset));
  const groceries = tasks.filter((task) => matches(task, groups.groceries));
  const laundry = tasks.filter((task) => matches(task, groups.laundry));
  const maintenance = tasks.filter((task) => matches(task, groups.maintenance));
  const homeIds = new Set([...cleaning,...reset,...groceries,...laundry,...maintenance].map((task)=>task.id));
  const homeTasks = tasks.filter((task)=>homeIds.has(task.id));
  const selectedAppointment = params.appointmentId ? appointments.find((item)=>item.id===params.appointmentId) ?? null : null;

  return <AppShell>
    <SectionPage eyebrow="Home" title={`Home, ${firstName}`} description="A practical household command center built only from tasks and appointments you have actually saved.">
      <div className="space-y-4">
        {params.appointmentId && !selectedAppointment ? <Card><div role="status" className="p-4 text-[11px] text-[#8A8078]">That appointment is no longer available.</div></Card> : null}
        {selectedAppointment ? <Card className="border-[#F7D1D8] bg-[#fffafa]"><div className="flex items-center gap-2"><CalendarDays size={14} className="text-[#C45F76]"/><div><p className="glow-eyebrow">Selected appointment</p><h2 className="glow-display mt-1 text-[20px] text-[#2B2420]">{selectedAppointment.title}</h2></div></div><form action={updateAppointmentFormAction.bind(null,selectedAppointment.id)} className="mt-4 grid gap-3 sm:grid-cols-2"><input name="title" required defaultValue={selectedAppointment.title} className={fieldClass}/><input name="provider" defaultValue={selectedAppointment.provider ?? ''} placeholder="Provider" className={fieldClass}/><input name="location" defaultValue={selectedAppointment.location ?? ''} placeholder="Location" className={fieldClass}/><select name="type" defaultValue={selectedAppointment.type} className={fieldClass}><option value="medical">Medical</option><option value="dental">Dental</option><option value="beauty">Beauty</option><option value="wellness">Wellness</option><option value="personal">Personal</option><option value="work">Work</option><option value="other">Other</option></select><input name="startAt" type="datetime-local" required defaultValue={dateTimeLocal(selectedAppointment.startAt)} className={fieldClass}/><input name="endAt" type="datetime-local" defaultValue={selectedAppointment.endAt?dateTimeLocal(selectedAppointment.endAt):''} className={fieldClass}/><textarea name="notes" rows={3} defaultValue={selectedAppointment.notes ?? ''} placeholder="Notes" className={`${fieldClass} sm:col-span-2`}/><button type="submit" className="w-fit rounded-full bg-[#C45F76] px-4 py-2.5 text-[11px] font-medium text-white">Save appointment</button><Link href="/home" className="self-center text-[11px] text-[#A05A69]">Close detail</Link></form></Card> : null}

        <Card className="relative overflow-hidden bg-[linear-gradient(135deg,#FFF,#F7EEED_80%,#FAE6E7)]"><HomeIcon size={74} strokeWidth={0.6} className="absolute right-7 top-5 text-[#C9727E]/14"/><p className="glow-eyebrow">Household overview</p><h2 className="glow-display mt-2 text-[27px] text-[#2B2420]">{homeTasks.length ? `${homeTasks.length} open home item${homeTasks.length===1?'':'s'}` : 'Your home queue is clear'}</h2><p className="mt-2 max-w-xl text-[12px] leading-5 text-[#8A8078]">No invented harmony score. This overview is based on the real open household tasks Glow can classify from your saved task list.</p><div className="mt-5 flex flex-wrap gap-2"><Link href="/tasks" className="rounded-full bg-[#2B2420] px-4 py-2.5 text-[11px] font-medium text-white">Open all tasks</Link><a href="#home-reset-jump" className="rounded-full border border-[#E9DFDC] bg-white px-4 py-2.5 text-[11px] text-[#5A514C]">Review home queue</a></div></Card>

        <div id="home-reset-jump" className="grid gap-4 lg:grid-cols-3">
          <Card><div className="flex items-center gap-2"><Sparkles size={14} className="text-[#C9727E]"/><h2 className="glow-display text-[18px]">Reset & Tidy</h2></div><TaskList items={reset} empty="No reset tasks are open."/></Card>
          <Card><div className="flex items-center gap-2"><ShoppingBasket size={14} className="text-[#9A7A3D]"/><h2 className="glow-display text-[18px]">Groceries & Shopping</h2></div><TaskList items={groceries} empty="No grocery tasks are open."/></Card>
          <Card><div className="flex items-center gap-2"><Shirt size={14} className="text-[#7C6B9C]"/><h2 className="glow-display text-[18px]">Laundry</h2></div><TaskList items={laundry} empty="No laundry tasks are open."/></Card>
          <Card><div className="flex items-center gap-2"><HomeIcon size={14} className="text-[#6D8A65]"/><h2 className="glow-display text-[18px]">Cleaning</h2></div><TaskList items={cleaning} empty="No cleaning tasks are open."/></Card>
          <Card><div className="flex items-center gap-2"><Wrench size={14} className="text-[#7A716B]"/><h2 className="glow-display text-[18px]">Maintenance</h2></div><TaskList items={maintenance} empty="No maintenance tasks are open."/></Card>
          <Card><div className="flex items-center justify-between gap-2"><div className="flex items-center gap-2"><CalendarDays size={14} className="text-[#C9727E]"/><h2 className="glow-display text-[18px]">Appointments</h2></div><Link href="/calendar" className="text-[10px] text-[#B9586E]">Calendar</Link></div><div className="mt-4 space-y-3">{appointments.length ? appointments.slice(0,5).map((item)=><Link key={item.id} href={`/home?appointmentId=${encodeURIComponent(item.id)}`} className="flex items-center justify-between gap-3 rounded-[10px] px-1 py-1 text-[11px] hover:bg-[#F7EEED]/55"><span className="min-w-0 flex-1 truncate">{item.title}</span><span className="shrink-0 text-[9px] text-[#9A9088]">{item.startAt.toLocaleDateString('en-US',{month:'short',day:'numeric'})}</span></Link>) : <p className="text-[11px] text-[#9A9088]">No saved appointments.</p>}</div></Card>
        </div>

        <Card className="flex flex-wrap items-center justify-between gap-3 bg-[#FFFDFC]"><div><p className="glow-eyebrow">Glow home insight</p><p className="glow-display mt-1 text-[17px] text-[#4A4440]">{homeTasks.length>6?'Your household queue is getting dense. Pick one reset area before adding more.':homeTasks.length?'A small home queue is easier to finish when each item has one clear next action.':'Nothing needs attention in the classified home queue right now.'}</p></div><Link href="/tasks" className="inline-flex items-center gap-1 text-[11px] font-medium text-[#C9727E]">Manage tasks <ArrowRight size={11}/></Link></Card>
      </div>
    </SectionPage>
  </AppShell>;
}
