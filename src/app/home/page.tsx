import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import { getAppointmentsByUser } from '@/lib/data/appointments';
import { getImportantLinksByUser } from '@/lib/data/important-links';
import { getTasksByUser } from '@/lib/data/tasks';
import {
  Home as HomeIcon,
  CalendarDays,
  ExternalLink,
  Flower2,
  Sparkles,
  Shirt,
  ShoppingBasket,
  Wrench,
  PackageCheck,
  RotateCcw,
  ArrowRight,
  CircleCheckBig,
  AlertTriangle,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

type HomeZone = {
  key: string;
  title: string;
  description: string;
  icon: typeof Sparkles;
  keywords: string[];
};

const HOME_ZONES: HomeZone[] = [
  {
    key: 'reset',
    title: 'Reset',
    description: 'Daily and weekly room resets, putting things back, and getting the space ready for tomorrow.',
    icon: RotateCcw,
    keywords: ['reset', 'tidy', 'declutter', 'organize', 'put away', 'room reset'],
  },
  {
    key: 'cleaning',
    title: 'Cleaning',
    description: 'Cleaning work that keeps the home calm instead of becoming an emergency project.',
    icon: Sparkles,
    keywords: ['clean', 'vacuum', 'mop', 'dust', 'bathroom', 'kitchen', 'sheets', 'bedding'],
  },
  {
    key: 'laundry',
    title: 'Laundry',
    description: 'Wash, dry, fold, put away, dry cleaning, and clothing-care follow-through.',
    icon: Shirt,
    keywords: ['laundry', 'wash clothes', 'fold', 'dry cleaning', 'dry-clean', 'sheets', 'towels'],
  },
  {
    key: 'groceries',
    title: 'Groceries',
    description: 'Food shopping, household runs, restocks, and anything that needs to come home with you.',
    icon: ShoppingBasket,
    keywords: ['grocery', 'groceries', 'market', 'food shop', 'shopping list', 'whole foods', 'trader joe'],
  },
  {
    key: 'maintenance',
    title: 'Maintenance',
    description: 'Repairs, replacements, appointments, service needs, and small problems worth catching early.',
    icon: Wrench,
    keywords: ['repair', 'fix', 'maintenance', 'replace', 'service', 'broken', 'filter', 'battery'],
  },
  {
    key: 'supplies',
    title: 'Supplies',
    description: 'Household inventory and low-stock items before they turn into last-minute errands.',
    icon: PackageCheck,
    keywords: ['restock', 'supply', 'supplies', 'toilet paper', 'paper towel', 'detergent', 'soap', 'inventory'],
  },
];

function taskMatchesZone(task: { title: string; description: string | null }, zone: HomeZone) {
  const haystack = `${task.title} ${task.description ?? ''}`.toLowerCase();
  return zone.keywords.some((keyword) => haystack.includes(keyword));
}

function formatDueDate(date: Date | null) {
  if (!date) return 'No due date';
  return date.toLocaleDateString('en', { month: 'short', day: 'numeric' });
}

export default async function HomePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const [appointments, links, tasks] = await Promise.all([
    getAppointmentsByUser(session.user.id),
    getImportantLinksByUser(session.user.id),
    getTasksByUser(session.user.id),
  ]);

  const activeTasks = tasks.filter((task) => task.status !== 'done' && task.status !== 'cancelled');
  const homeTasks = activeTasks.filter((task) => HOME_ZONES.some((zone) => taskMatchesZone(task, zone)));
  const overdueHomeTasks = homeTasks.filter((task) => task.dueDate && task.dueDate.getTime() < Date.now());
  const dueSoonHomeTasks = homeTasks.filter((task) => {
    if (!task.dueDate) return false;
    const difference = task.dueDate.getTime() - Date.now();
    return difference >= 0 && difference <= 1000 * 60 * 60 * 24 * 7;
  });
  const maintenanceAppointments = appointments.filter((appointment) => {
    const haystack = `${appointment.title} ${appointment.location ?? ''}`.toLowerCase();
    return ['repair', 'maintenance', 'service', 'delivery', 'home', 'clean'].some((keyword) => haystack.includes(keyword));
  });

  const priorityTask = [...homeTasks].sort((a, b) => {
    const priorityRank = { urgent: 0, high: 1, medium: 2, low: 3 } as const;
    const priorityDelta = priorityRank[a.priority] - priorityRank[b.priority];
    if (priorityDelta !== 0) return priorityDelta;
    if (a.dueDate && b.dueDate) return a.dueDate.getTime() - b.dueDate.getTime();
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return b.createdAt.getTime() - a.createdAt.getTime();
  })[0];

  return (
    <AppShell>
      <SectionPage
        eyebrow="Home"
        title="The home command center"
        description="Keep resets, cleaning, laundry, groceries, maintenance and supplies visible in one calm place, using the same task system that already powers Glow OS."
      >
        <div className="space-y-4">
          <Card className="relative min-h-[220px] overflow-hidden bg-[linear-gradient(145deg,#E4EBDD,#FDF8F6)]">
            <HomeIcon size={64} strokeWidth={0.75} className="absolute right-5 top-4 text-[#5A6E52]/20" />
            <Flower2 size={90} strokeWidth={0.65} className="absolute -bottom-5 left-3 text-[#5A6E52]/16" />
            <div className="relative ml-auto max-w-[76%]">
              <p className="glow-eyebrow">Living space</p>
              <p className="glow-display mt-2 text-[26px] text-[#2B2420]">Your home should tell you what needs attention before it becomes overwhelming.</p>
              <p className="mt-2 text-[12px] leading-5 text-[#8A8078]">
                Home now reads your existing Glow OS tasks and turns household work into six practical lanes, without creating a second task system or duplicating data.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/tasks" className="rounded-full bg-[#5A6E52] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[.1em] text-white hover:opacity-90">
                  Open tasks
                </Link>
                <Link href="/planning" className="rounded-full border border-[#F1E7E3] bg-white px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[.1em] text-[#5A6E52] hover:bg-[#FDF8F6]">
                  Plan the reset
                </Link>
              </div>
            </div>
          </Card>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Card>
              <p className="glow-eyebrow">Open home work</p>
              <p className="glow-display mt-2 text-[28px] text-[#2B2420]">{homeTasks.length}</p>
              <p className="mt-1 text-[10.5px] text-[#8A8078]">household tasks currently active</p>
            </Card>
            <Card>
              <p className="glow-eyebrow">Due this week</p>
              <p className="glow-display mt-2 text-[28px] text-[#2B2420]">{dueSoonHomeTasks.length}</p>
              <p className="mt-1 text-[10.5px] text-[#8A8078]">home items worth scheduling now</p>
            </Card>
            <Card>
              <p className="glow-eyebrow">Needs attention</p>
              <p className="glow-display mt-2 text-[28px] text-[#B15A68]">{overdueHomeTasks.length}</p>
              <p className="mt-1 text-[10.5px] text-[#8A8078]">overdue household items</p>
            </Card>
            <Card>
              <p className="glow-eyebrow">Home appointments</p>
              <p className="glow-display mt-2 text-[28px] text-[#2B2420]">{maintenanceAppointments.length}</p>
              <p className="mt-1 text-[10.5px] text-[#8A8078]">service or home-related appointments</p>
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
            <Card className="overflow-hidden p-0">
              <div className="flex items-center justify-between border-b border-[#F1E7E3] px-5 py-4">
                <div>
                  <p className="glow-eyebrow">Household rhythm</p>
                  <h2 className="glow-display mt-1 text-[20px] text-[#2B2420]">Six lanes that keep the home moving</h2>
                </div>
                <Link href="/tasks" className="flex items-center gap-1 text-[10.5px] font-semibold uppercase tracking-[.1em] text-[#5A6E52]">
                  Manage all <ArrowRight size={12} />
                </Link>
              </div>
              <div className="grid gap-px bg-[#F1E7E3] sm:grid-cols-2 lg:grid-cols-3">
                {HOME_ZONES.map((zone) => {
                  const Icon = zone.icon;
                  const matching = homeTasks.filter((task) => taskMatchesZone(task, zone));
                  return (
                    <div key={zone.key} className="bg-white p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="rounded-full border border-[#F1E7E3] bg-[#FDF8F6] p-2 text-[#5A6E52]"><Icon size={14} /></div>
                        <span className="rounded-full bg-[#E4EBDD] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[.08em] text-[#5A6E52]">{matching.length} open</span>
                      </div>
                      <p className="glow-display mt-3 text-[16px] text-[#2B2420]">{zone.title}</p>
                      <p className="mt-1 min-h-[42px] text-[11px] leading-4 text-[#8A8078]">{zone.description}</p>
                      {matching.length === 0 ? (
                        <Link href="/tasks" className="mt-3 inline-flex items-center gap-1 text-[10.5px] font-semibold text-[#5A6E52]">
                          Add in Tasks <ArrowRight size={11} />
                        </Link>
                      ) : (
                        <div className="mt-3 space-y-2">
                          {matching.slice(0, 2).map((task) => (
                            <div key={task.id} className="rounded-[10px] border border-[#F1E7E3] bg-[#FDF8F6] px-3 py-2">
                              <p className="text-[11.5px] font-medium text-[#2B2420]">{task.title}</p>
                              <p className="mt-1 text-[10px] uppercase tracking-[.08em] text-[#B5ACA5]">{formatDueDate(task.dueDate)} · {task.priority}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            <div className="space-y-4">
              <Card>
                <div className="flex items-center gap-2">
                  {overdueHomeTasks.length > 0 ? <AlertTriangle size={14} className="text-[#B15A68]" /> : <CircleCheckBig size={14} className="text-[#5A6E52]" />}
                  <p className="glow-eyebrow">Next best home action</p>
                </div>
                {priorityTask ? (
                  <>
                    <p className="glow-display mt-3 text-[21px] text-[#2B2420]">{priorityTask.title}</p>
                    <p className="mt-2 text-[11.5px] leading-4 text-[#8A8078]">
                      {priorityTask.dueDate ? `Due ${formatDueDate(priorityTask.dueDate)}.` : 'No due date yet.'} Priority is {priorityTask.priority}. Finish this first to reduce home-admin pressure.
                    </p>
                    <Link href="/tasks" className="mt-4 inline-flex items-center gap-1 rounded-full bg-[#5A6E52] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[.1em] text-white">
                      Work from Tasks <ArrowRight size={11} />
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="glow-display mt-3 text-[20px] text-[#2B2420]">The home queue is clear.</p>
                    <p className="mt-2 text-[11.5px] leading-4 text-[#8A8078]">Add the next reset, grocery run, laundry load, repair, cleaning job or supply restock in Tasks and it will appear here automatically.</p>
                  </>
                )}
              </Card>

              <Card className="overflow-hidden p-0">
                <div className="flex items-center gap-2 border-b border-[#F1E7E3] px-5 py-4">
                  <CalendarDays size={13} className="text-[#5A6E52]" />
                  <div>
                    <p className="glow-eyebrow">Coming home with you</p>
                    <h2 className="glow-display mt-1 text-[18px] text-[#2B2420]">Upcoming appointments</h2>
                  </div>
                </div>
                {appointments.length === 0 ? (
                  <div className="p-6">
                    <p className="text-[12px] text-[#8A8078]">No appointments scheduled.</p>
                    <Link href="/calendar" className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#5A6E52]">Open Calendar <ArrowRight size={11} /></Link>
                  </div>
                ) : (
                  <div className="divide-y divide-[#F1E7E3]">
                    {appointments.slice(0, 5).map((appointment, index) => (
                      <div key={appointment.id} className={`px-5 py-4 ${index === 0 ? 'bg-[#FDF8F6]' : ''}`}>
                        <p className="glow-display text-[13px] text-[#2B2420]">{appointment.title}</p>
                        <p className="mt-1 text-[10.5px] text-[#B5ACA5]">
                          {appointment.startAt.toLocaleString('en', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                          {appointment.location ? ` · ${appointment.location}` : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>

          <Card className="overflow-hidden p-0">
            <div className="flex items-center gap-2 border-b border-[#F1E7E3] px-5 py-4">
              <ExternalLink size={13} className="text-[#C9727E]" />
              <div>
                <p className="glow-eyebrow">Household admin shelf</p>
                <h2 className="glow-display mt-1 text-[18px] text-[#2B2420]">Important links</h2>
              </div>
            </div>
            {links.length === 0 ? (
              <div className="p-6">
                <p className="text-[12px] text-[#8A8078]">No saved links yet.</p>
                <Link href="/connections" className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#C9727E]">Open Connections <ArrowRight size={11} /></Link>
              </div>
            ) : (
              <div className="grid gap-2 p-4 sm:grid-cols-2 lg:grid-cols-4">
                {links.slice(0, 8).map((link) => (
                  <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-[10px] border border-[#F1E7E3] bg-[#FDF8F6] px-3 py-3 text-[11.5px] font-medium text-[#4A4440] hover:bg-white">
                    <span>{link.title}</span>
                    <ExternalLink size={11} />
                  </a>
                ))}
              </div>
            )}
          </Card>
        </div>
      </SectionPage>
    </AppShell>
  );
}
