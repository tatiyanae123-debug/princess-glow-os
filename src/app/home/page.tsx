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
          <Card className="relative min-h-[220px] overflow-hidden bg-[linear-gradient(145deg,#ebeee4,#f6eee7)] p-5">
            <HomeIcon size={64} strokeWidth={0.75} className="absolute right-5 top-3 text-[#74806b]/16" />
            <Flower2 size={90} strokeWidth={0.65} className="absolute -bottom-5 left-3 text-[#8e9b81]/20" />
            <div className="relative ml-auto max-w-[76%]">
              <p className="glow-eyebrow">Living space</p>
              <p className="glow-display mt-2 text-[26px] text-[#414b3d]">Your home should tell you what needs attention before it becomes overwhelming.</p>
              <p className="mt-2 text-[9px] leading-4 text-[#727d6e]">
                Home now reads your existing Glow OS tasks and turns household work into six practical lanes, without creating a second task system or duplicating data.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/tasks" className="rounded-full bg-[#52604d] px-4 py-2 text-[8px] font-semibold uppercase tracking-[0.18em] text-white">
                  Open tasks
                </Link>
                <Link href="/planning" className="rounded-full border border-[#adb7a6] bg-white/55 px-4 py-2 text-[8px] font-semibold uppercase tracking-[0.18em] text-[#5b6756]">
                  Plan the reset
                </Link>
              </div>
            </div>
          </Card>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Card className="p-4">
              <p className="glow-eyebrow">Open home work</p>
              <p className="glow-display mt-2 text-[28px] text-[#465142]">{homeTasks.length}</p>
              <p className="mt-1 text-[8px] text-[#7d8778]">household tasks currently active</p>
            </Card>
            <Card className="p-4">
              <p className="glow-eyebrow">Due this week</p>
              <p className="glow-display mt-2 text-[28px] text-[#465142]">{dueSoonHomeTasks.length}</p>
              <p className="mt-1 text-[8px] text-[#7d8778]">home items worth scheduling now</p>
            </Card>
            <Card className="p-4">
              <p className="glow-eyebrow">Needs attention</p>
              <p className="glow-display mt-2 text-[28px] text-[#7b5d50]">{overdueHomeTasks.length}</p>
              <p className="mt-1 text-[8px] text-[#8a766c]">overdue household items</p>
            </Card>
            <Card className="p-4">
              <p className="glow-eyebrow">Home appointments</p>
              <p className="glow-display mt-2 text-[28px] text-[#465142]">{maintenanceAppointments.length}</p>
              <p className="mt-1 text-[8px] text-[#7d8778]">service or home-related appointments</p>
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
            <Card className="overflow-hidden p-0">
              <div className="flex items-center justify-between border-b border-[#dfe4da] px-5 py-4">
                <div>
                  <p className="glow-eyebrow">Household rhythm</p>
                  <h2 className="glow-display mt-1 text-[20px] text-[#414b3d]">Six lanes that keep the home moving</h2>
                </div>
                <Link href="/tasks" className="flex items-center gap-1 text-[8px] font-semibold uppercase tracking-[0.16em] text-[#6a7665]">
                  Manage all <ArrowRight size={11} />
                </Link>
              </div>
              <div className="grid gap-px bg-[#e3e7df] sm:grid-cols-2 lg:grid-cols-3">
                {HOME_ZONES.map((zone) => {
                  const Icon = zone.icon;
                  const matching = homeTasks.filter((task) => taskMatchesZone(task, zone));
                  return (
                    <div key={zone.key} className="bg-[#fafbf8] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="rounded-full border border-[#dfe5da] bg-white p-2 text-[#667160]"><Icon size={14} /></div>
                        <span className="rounded-full bg-[#edf1e8] px-2 py-1 text-[7px] font-semibold uppercase tracking-[0.14em] text-[#667160]">{matching.length} open</span>
                      </div>
                      <p className="glow-display mt-3 text-[16px] text-[#465142]">{zone.title}</p>
                      <p className="mt-1 min-h-[42px] text-[8px] leading-4 text-[#7c8778]">{zone.description}</p>
                      {matching.length === 0 ? (
                        <Link href="/tasks" className="mt-3 inline-flex items-center gap-1 text-[8px] font-semibold text-[#6a7665]">
                          Add in Tasks <ArrowRight size={10} />
                        </Link>
                      ) : (
                        <div className="mt-3 space-y-2">
                          {matching.slice(0, 2).map((task) => (
                            <div key={task.id} className="rounded-[7px] border border-[#e1e6dd] bg-white px-3 py-2">
                              <p className="text-[9px] font-medium text-[#53604f]">{task.title}</p>
                              <p className="mt-1 text-[7px] uppercase tracking-[0.12em] text-[#929b8f]">{formatDueDate(task.dueDate)} · {task.priority}</p>
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
              <Card className="p-5">
                <div className="flex items-center gap-2">
                  {overdueHomeTasks.length > 0 ? <AlertTriangle size={14} className="text-[#8b6455]" /> : <CircleCheckBig size={14} className="text-[#6c7966]" />}
                  <p className="glow-eyebrow">Next best home action</p>
                </div>
                {priorityTask ? (
                  <>
                    <p className="glow-display mt-3 text-[21px] text-[#465142]">{priorityTask.title}</p>
                    <p className="mt-2 text-[8px] leading-4 text-[#7d8778]">
                      {priorityTask.dueDate ? `Due ${formatDueDate(priorityTask.dueDate)}.` : 'No due date yet.'} Priority is {priorityTask.priority}. Finish this first to reduce home-admin pressure.
                    </p>
                    <Link href="/tasks" className="mt-4 inline-flex items-center gap-1 rounded-full bg-[#566451] px-4 py-2 text-[8px] font-semibold uppercase tracking-[0.16em] text-white">
                      Work from Tasks <ArrowRight size={10} />
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="glow-display mt-3 text-[20px] text-[#465142]">The home queue is clear.</p>
                    <p className="mt-2 text-[8px] leading-4 text-[#7d8778]">Add the next reset, grocery run, laundry load, repair, cleaning job or supply restock in Tasks and it will appear here automatically.</p>
                  </>
                )}
              </Card>

              <Card className="overflow-hidden p-0">
                <div className="flex items-center gap-2 border-b border-[#dfe4da] px-5 py-4">
                  <CalendarDays size={13} className="text-[#74806b]" />
                  <div>
                    <p className="glow-eyebrow">Coming home with you</p>
                    <h2 className="glow-display mt-1 text-[18px] text-[#414b3d]">Upcoming appointments</h2>
                  </div>
                </div>
                {appointments.length === 0 ? (
                  <div className="p-6">
                    <p className="text-[9px] text-[#7d8778]">No appointments scheduled.</p>
                    <Link href="/calendar" className="mt-2 inline-flex items-center gap-1 text-[8px] font-semibold text-[#697565]">Open Calendar <ArrowRight size={10} /></Link>
                  </div>
                ) : (
                  <div className="divide-y divide-[#e6e9e2]">
                    {appointments.slice(0, 5).map((appointment, index) => (
                      <div key={appointment.id} className={`px-5 py-4 ${index === 0 ? 'bg-[#edf1e8]/60' : ''}`}>
                        <p className="glow-display text-[13px] text-[#465142]">{appointment.title}</p>
                        <p className="mt-1 text-[7px] text-[#84907f]">
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
            <div className="flex items-center gap-2 border-b border-[#e5ddd7] px-5 py-4">
              <ExternalLink size={13} className="text-[#7b7069]" />
              <div>
                <p className="glow-eyebrow">Household admin shelf</p>
                <h2 className="glow-display mt-1 text-[18px] text-[#49413a]">Important links</h2>
              </div>
            </div>
            {links.length === 0 ? (
              <div className="p-6">
                <p className="text-[9px] text-[#857970]">No saved links yet.</p>
                <Link href="/connections" className="mt-2 inline-flex items-center gap-1 text-[8px] font-semibold text-[#75665f]">Open Connections <ArrowRight size={10} /></Link>
              </div>
            ) : (
              <div className="grid gap-2 p-4 sm:grid-cols-2 lg:grid-cols-4">
                {links.slice(0, 8).map((link) => (
                  <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-[7px] border border-[#e7ddd5] bg-[#faf5f0] px-3 py-3 text-[9px] font-medium text-[#705e56] hover:bg-white">
                    <span>{link.title}</span>
                    <ExternalLink size={9} />
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
