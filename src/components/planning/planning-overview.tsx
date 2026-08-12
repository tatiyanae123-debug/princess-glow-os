import Link from 'next/link';
import { CalendarRange, CheckCircle2, Circle, Clock3, ListTodo, NotebookPen, Sparkles } from 'lucide-react';
import { TopThreeCard } from '@/components/planning/top-three-card';
import { EditableRoomImage } from '@/components/media/editable-room-image';
import type { Task, CalendarEvent, Note } from '@/lib/types';

type ProjectLite = { id: string; title: string; status: string; progress: number };
type RoutineStepLite = { id: string; title: string };

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

const STATUS_TONE: Record<string, string> = {
  active: 'bg-[#E4EBDD] text-[#5A6E52]',
  in_progress: 'bg-[#E4EBDD] text-[#5A6E52]',
  paused: 'bg-[#F1E8D9] text-[#9A7A3D]',
  planning: 'bg-[#E9E4F2] text-[#6E5E92]',
  completed: 'bg-[#DDE7EE] text-[#4E6B82]',
};

export function PlanningOverview({
  tasks,
  events,
  projects,
  notes,
  blockedTasks,
  sundayResetSteps,
  insight,
  userName,
}: {
  tasks: Task[];
  events: CalendarEvent[];
  projects: ProjectLite[];
  notes: Note[];
  blockedTasks: { task: Task; blockedBy: string[] }[];
  sundayResetSteps: RoutineStepLite[];
  insight: string | null;
  userName: string;
}) {
  const today = startOfDay(new Date());
  const twoWeeksOut = new Date(today.getTime() + 14 * 86400000);
  const weekOut = new Date(today.getTime() + 7 * 86400000);

  const deadlines = tasks
    .filter((task) => task.status !== 'done' && task.status !== 'cancelled' && task.dueDate && task.dueDate >= today && task.dueDate < twoWeeksOut)
    .sort((a, b) => a.dueDate!.getTime() - b.dueDate!.getTime())
    .slice(0, 5);

  const appointments = events
    .filter((event) => event.startAt >= today && event.startAt < weekOut)
    .sort((a, b) => a.startAt.getTime() - b.startAt.getTime())
    .slice(0, 8);

  const appointmentsByDay = new Map<string, CalendarEvent[]>();
  for (const event of appointments) {
    const key = event.startAt.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
    const list = appointmentsByDay.get(key) ?? [];
    list.push(event);
    appointmentsByDay.set(key, list);
  }

  const activeProjects = projects.filter((project) => project.status !== 'archived').slice(0, 4);
  const pinnedNote = notes[0] ?? null;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-3">
        <TopThreeCard initialTasks={tasks} />

        <div className="rounded-[20px] border border-[#F1E7E3] bg-white p-0 overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#F4ECE8] px-5 py-4">
            <div className="flex items-center gap-2"><CalendarRange size={14} className="text-[#C9727E]" /><p className="text-[13px] font-medium text-[#2B2420]">This Week&apos;s Appointments</p></div>
            <Link href="/calendar?view=week" className="text-[12px] font-medium text-[#C9727E]">View Calendar</Link>
          </div>
          <div className="max-h-[280px] overflow-y-auto px-5 py-3">
            {appointmentsByDay.size === 0 ? <p className="py-6 text-center text-[12px] text-[#9A9088]">Nothing on the calendar this week yet.</p> : [...appointmentsByDay.entries()].map(([day, dayEvents]) => (
              <div key={day} className="py-2">
                <p className="text-[11px] font-semibold uppercase tracking-[.08em] text-[#C9727E]">{day}</p>
                <div className="mt-1.5 space-y-1.5">
                  {dayEvents.map((event) => (
                    <div key={event.id} className="flex items-center gap-2 text-[12.5px] text-[#3A332E]">
                      <span className="w-[64px] shrink-0 text-[#9A9088]">{event.allDay ? 'All day' : event.startAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                      <span className="min-w-0 truncate">{event.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-[20px] border border-[#F1E7E3] bg-white p-5">
            <div className="flex items-center gap-2"><Clock3 size={14} className="text-[#C9727E]" /><p className="text-[13px] font-medium text-[#2B2420]">Deadlines</p></div>
            <div className="mt-3 space-y-2">
              {deadlines.length === 0 ? <p className="text-[12px] text-[#9A9088]">Nothing due in the next two weeks.</p> : deadlines.map((task) => (
                <div key={task.id} className="flex items-center justify-between gap-2 text-[12.5px]">
                  <span className="min-w-0 truncate text-[#3A332E]">{task.title}</span>
                  <span className="shrink-0 text-[11px] text-[#9A9088]">{task.dueDate!.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex-1 overflow-hidden rounded-[20px] border border-[#F1E7E3] bg-white p-5">
            <div className="flex items-center gap-2 text-[#2B2420]"><CheckCircle2 size={14} className="text-[#C9727E]" /><p className="text-[13px] font-medium">Sunday Reset</p></div>
            <div className="mt-3 space-y-2">
              {sundayResetSteps.length === 0 ? (
                <p className="text-[12px] text-[#9A9088]">No Sunday Reset ritual yet. Build one in Routines.</p>
              ) : sundayResetSteps.slice(0, 5).map((step) => (
                <p key={step.id} className="flex items-center gap-2 text-[12.5px] text-[#4A4440]"><Circle size={12} className="shrink-0 text-[#D8CDC8]" />{step.title}</p>
              ))}
            </div>
            <Link href="/routines?view=reset" className="mt-4 inline-flex text-[12px] font-medium text-[#C9727E]">Start Reset →</Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr_.85fr_.85fr]">
        <div className="rounded-[20px] border border-[#F1E7E3] bg-white p-5">
          <p className="text-[13px] font-medium text-[#2B2420]">Project Summary</p>
          <div className="mt-3 space-y-3">
            {activeProjects.length === 0 ? <p className="text-[12px] text-[#9A9088]">No active projects yet.</p> : activeProjects.map((project) => (
              <div key={project.id} className="flex items-center gap-3">
                <span className="min-w-0 flex-1 truncate text-[12.5px] text-[#3A332E]">{project.title}</span>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${STATUS_TONE[project.status] ?? 'bg-[#F1E8E4] text-[#8A5A56]'}`}>{project.status.replace('_', ' ')}</span>
                <span className="w-9 shrink-0 text-right text-[11px] text-[#9A9088]">{project.progress}%</span>
              </div>
            ))}
          </div>
          <Link href="/projects" className="mt-3 inline-flex text-[12px] font-medium text-[#C9727E]">Open Projects →</Link>
        </div>

        <div className="rounded-[20px] border border-[#F1E7E3] bg-white p-5">
          <div className="flex items-center gap-2"><ListTodo size={14} className="text-[#C9727E]" /><p className="text-[13px] font-medium text-[#2B2420]">Waiting On</p></div>
          <div className="mt-3 space-y-2">
            {blockedTasks.length === 0 ? <p className="text-[12px] text-[#9A9088]">Nothing is blocked right now.</p> : blockedTasks.slice(0, 4).map(({ task, blockedBy }) => (
              <div key={task.id}>
                <p className="truncate text-[12.5px] text-[#3A332E]">{task.title}</p>
                <p className="text-[10px] text-[#B08B4F]">Waiting on {blockedBy.join(', ')}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[20px] border border-[#F1E7E3] bg-[#FBF8F6] p-5">
          <div className="flex items-center gap-2"><NotebookPen size={13} className="text-[#C9727E]" /><p className="text-[11px] font-medium text-[#9A9088]">Notes</p></div>
          {pinnedNote ? (
            <>
              <p className="mt-3 line-clamp-4 text-[12.5px] italic leading-5 text-[#4A4440]">{pinnedNote.content?.slice(0, 140) || pinnedNote.title}</p>
              <Link href="/notes" className="mt-3 inline-block text-[11px] font-medium text-[#C9727E]">Open Notes →</Link>
            </>
          ) : <p className="mt-3 text-[12px] text-[#9A9088]">Focus on progress, not perfection.</p>}
        </div>

        <div className="rounded-[20px] border-none bg-[linear-gradient(150deg,#FBE4E8,#FDF3F2)] p-5">
          <div className="flex items-center gap-2 text-[#B15A68]"><Sparkles size={13} /><p className="text-[11px] font-medium">Glow Insight</p></div>
          <p className="mt-3 text-[12.5px] leading-5 text-[#4A3238]">{insight ?? 'When you plan your days with intention, you create space for what matters most.'}</p>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[20px] border border-[#F1E7E3] bg-[linear-gradient(120deg,#FBE4E8,#FDF6F1)] p-6">
        <EditableRoomImage slot="planning:banner" label="Planning encouragement" className="absolute inset-0 opacity-[.12]" overlay={false} />
        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="glow-display text-[19px] text-[#4A3238]">You&apos;re doing great, {userName}.</p>
            <p className="mt-1 text-[12.5px] text-[#8A6068]">Keep showing up for your goals and your growth.</p>
          </div>
          <Link href="/briefings" className="text-[12.5px] font-medium text-[#B15A68]">See Full Report →</Link>
        </div>
      </div>
    </div>
  );
}
