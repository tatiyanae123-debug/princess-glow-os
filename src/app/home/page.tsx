import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import { getTasksByUser } from '@/lib/data/tasks';
import { ArrowRight, Circle, Home as HomeIcon, RotateCcw, Shirt, ShoppingBasket, Sparkles, Wrench } from 'lucide-react';

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

function due(date: Date | null) {
  return date ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Open';
}

function TaskList({ items, empty }: { items: Array<{ id: string; title: string }>; empty: string }) {
  if (!items.length) return <p className="mt-5 text-[11.5px] text-[#9A9088]">{empty}</p>;
  return <div className="mt-4 space-y-3">{items.slice(0, 5).map((task) => <div key={task.id} className="flex items-start gap-2 text-[11.5px] text-[#4A4440]"><Circle size={13} className="mt-0.5 shrink-0 text-[#C9BEB7]"/><span>{task.title}</span></div>)}</div>;
}

export default async function HomePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const tasks = (await getTasksByUser(session.user.id)).filter((task) => task.status !== 'done' && task.status !== 'cancelled');
  const firstName = session.user.name?.split(' ')[0] || 'Tatiyana';
  const cleaning = tasks.filter((task) => matches(task, groups.cleaning));
  const reset = tasks.filter((task) => matches(task, groups.reset));
  const groceries = tasks.filter((task) => matches(task, groups.groceries));
  const laundry = tasks.filter((task) => matches(task, groups.laundry));
  const maintenance = tasks.filter((task) => matches(task, groups.maintenance));
  const homeTasks = Array.from(new Map([...cleaning, ...reset, ...groceries, ...laundry, ...maintenance].map((task) => [task.id, task])).values());

  return (
    <AppShell>
      <SectionPage eyebrow="Home" title={`Welcome home, ${firstName}`} description="A calm home creates a clear mind and a full heart.">
        <div className="space-y-4">
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card className="min-h-[270px]"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><Sparkles size={14} className="text-[#9A6C61]"/><h2 className="glow-display text-[18px]">Cleaning Tasks</h2></div><span>•••</span></div><TaskList items={cleaning} empty="No cleaning tasks open."/><Link href="/tasks" className="mt-5 inline-flex items-center gap-1 text-[11px] text-[#C9727E]">View full cleaning list <ArrowRight size={11}/></Link></Card>
            <Card className="min-h-[270px]"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><RotateCcw size={14} className="text-[#9A6C61]"/><h2 className="glow-display text-[18px]">Home Reset</h2></div><span>•••</span></div><TaskList items={reset} empty="No reset tasks open."/><Link href="/planning" className="mt-5 inline-flex items-center gap-1 text-[11px] text-[#C9727E]">View full checklist <ArrowRight size={11}/></Link></Card>
            <Card className="min-h-[270px]"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><ShoppingBasket size={14} className="text-[#9A6C61]"/><h2 className="glow-display text-[18px]">Groceries</h2></div><span>•••</span></div><TaskList items={groceries} empty="No grocery items open."/><Link href="/food" className="mt-5 inline-flex items-center gap-1 text-[11px] text-[#C9727E]">View grocery list <ArrowRight size={11}/></Link></Card>
            <Card className="min-h-[270px]"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><Shirt size={14} className="text-[#9A6C61]"/><h2 className="glow-display text-[18px]">Laundry</h2></div><span>•••</span></div><div className="mt-4 h-24 rounded-[14px] bg-[linear-gradient(145deg,#EEDFD4,#D8C2B5)]"/><TaskList items={laundry} empty="No laundry loads waiting."/><Link href="/tasks" className="mt-4 inline-flex items-center gap-1 text-[11px] text-[#C9727E]">Laundry schedule <ArrowRight size={11}/></Link></Card>
          </section>

          <section className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr_.78fr]">
            <Card><div className="flex items-center justify-between"><div className="flex items-center gap-2"><Wrench size={14} className="text-[#9A6C61]"/><h2 className="glow-display text-[17px]">Maintenance Reminders</h2></div><span>•••</span></div><div className="mt-4 space-y-3">{maintenance.slice(0,5).map((task) => <div key={task.id} className="grid grid-cols-[58px_1fr] gap-2 text-[11px]"><span className="text-[#C9727E]">{due(task.dueDate)}</span><span className="text-[#4A4440]">{task.title}</span></div>)}</div><Link href="/tasks" className="mt-5 inline-flex items-center gap-1 text-[11px] text-[#C9727E]">View all reminders <ArrowRight size={11}/></Link></Card>
            <Card><div className="flex items-center gap-2"><RotateCcw size={14} className="text-[#9A6C61]"/><h2 className="glow-display text-[17px]">Household Routines</h2></div><TaskList items={reset} empty="Add a home reset routine."/><Link href="/routines" className="mt-5 inline-flex items-center gap-1 text-[11px] text-[#C9727E]">Manage routines <ArrowRight size={11}/></Link></Card>
            <Card><div className="flex items-center gap-2"><HomeIcon size={14} className="text-[#9A6C61]"/><h2 className="glow-display text-[17px]">Home Projects</h2></div><div className="mt-4 space-y-4">{homeTasks.slice(0,4).map((task) => <div key={task.id}><p className="text-[11.5px] text-[#4A4440]">{task.title}</p><div className="mt-1.5 h-1 rounded-full bg-[#F1E7E3]"><div className="h-full w-1/2 rounded-full bg-[#C9727E]"/></div></div>)}</div><Link href="/projects" className="mt-5 inline-flex items-center gap-1 text-[11px] text-[#C9727E]">View all projects <ArrowRight size={11}/></Link></Card>
            <Card className="min-h-[260px] bg-[linear-gradient(150deg,#EEDFD4,#FAF4EF)]"><div className="h-28 rounded-[14px] bg-[radial-gradient(circle_at_70%_25%,#fff_0_8%,transparent_9%),linear-gradient(145deg,#D8C2B5,#EFE3DA)]"/><p className="glow-display mt-5 text-[18px] italic leading-6 text-[#4A3D37]">“A beautiful home is built one small, intentional step at a time.”</p></Card>
          </section>

          <Card className="grid gap-5 bg-[linear-gradient(90deg,#FFF,#FFF8F5)] lg:grid-cols-[180px_1fr_260px] lg:items-center"><div className="flex items-center gap-2"><Sparkles size={15} className="text-[#C9727E]"/><span className="glow-display text-[19px]">Glow Insight</span></div><div><p className="glow-display text-[18px]">{homeTasks.length ? `You have ${homeTasks.length} home item${homeTasks.length === 1 ? '' : 's'} in motion.` : 'You’ve created calm in the little moments.'}</p><p className="mt-1 text-[11px] text-[#9A9088]">Keep going. Your home feels it.</p></div><div className="text-right"><p className="glow-display text-[28px] text-[#C9727E]">{Math.max(0, 100 - homeTasks.length * 3)}</p><p className="text-[9px] uppercase tracking-[.12em] text-[#9A9088]">Home Harmony</p></div></Card>
        </div>
      </SectionPage>
    </AppShell>
  );
}
