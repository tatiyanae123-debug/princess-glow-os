'use client';

import { CalendarDays, CheckCircle2, Clock3, FileText, MapPin, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { usePersonalContext } from '@/lib/personal-context/use-personal-context';
import type { PersonalEvent, PersonalTask } from '@/lib/personal-context/types';

type LiveRoom = 'meeting' | 'next-up' | 'later' | 'tonight' | 'tomorrow' | 'replan';

const liveRooms: LiveRoom[] = ['meeting', 'next-up', 'later', 'tonight', 'tomorrow', 'replan'];

function currentRoom(): LiveRoom | null {
  if (typeof window === 'undefined') return null;
  const value = new URL(window.location.href).searchParams.get('room') as LiveRoom | null;
  return value && liveRooms.includes(value) ? value : null;
}

function go(room: string) {
  const url = new URL(window.location.href);
  url.pathname = '/today';
  url.searchParams.set('room', room);
  url.hash = '';
  window.location.assign(url.toString());
}

function fmt(value: string) {
  return new Date(value).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function eventRange(event: PersonalEvent) {
  if (event.allDay) return 'All day';
  const start = new Date(event.startAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const end = event.endAt ? new Date(event.endAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : null;
  return end ? `${start} – ${end}` : start;
}

function taskMeta(task: PersonalTask) {
  if (task.dueDate) return `Due ${fmt(task.dueDate)}`;
  return `${task.priority} priority · ${task.status === 'in_progress' ? 'in progress' : 'open'}`;
}

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-[30px] border border-white/80 bg-white/35 p-7 shadow-[0_18px_55px_rgba(99,82,79,0.08),inset_0_1px_0_white] backdrop-blur-2xl">
      <strong className="font-serif text-[28px] font-medium tracking-[-0.04em] text-neutral-800">{title}</strong>
      <p className="mt-2 max-w-xl text-[13px] leading-6 text-neutral-600">{detail}</p>
    </div>
  );
}

function GlassCard({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  const Component = onClick ? 'button' : 'article';
  return (
    <Component
      {...(onClick ? { type: 'button' as const, onClick } : {})}
      className="w-full rounded-[28px] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,.58),rgba(247,241,238,.20))] p-5 text-left shadow-[0_18px_50px_rgba(104,86,80,.07),inset_0_1px_0_rgba(255,255,255,.95)] backdrop-blur-2xl"
    >
      {children}
    </Component>
  );
}

function EventCard({ event }: { event: PersonalEvent }) {
  return (
    <GlassCard>
      <div className="flex items-start gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/90 bg-white/45"><CalendarDays size={18} strokeWidth={1.5} /></span>
        <div className="min-w-0 flex-1">
          <strong className="block text-[15px] font-semibold text-neutral-800">{event.title}</strong>
          <span className="mt-1 block text-[12px] text-neutral-500">{eventRange(event)}</span>
          {event.location ? <span className="mt-1 flex items-center gap-1 text-[12px] text-neutral-500"><MapPin size={12} />{event.location}</span> : null}
        </div>
        {event.htmlLink ? <a className="rounded-full border border-white/80 bg-white/45 px-3 py-2 text-[11px] text-neutral-700 no-underline" href={event.htmlLink} target="_blank" rel="noreferrer">Open</a> : null}
      </div>
    </GlassCard>
  );
}

function TaskCard({ task }: { task: PersonalTask }) {
  return (
    <GlassCard onClick={() => go('focus')}>
      <div className="flex items-start gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/90 bg-white/45"><CheckCircle2 size={18} strokeWidth={1.5} /></span>
        <div>
          <strong className="block text-[15px] font-semibold text-neutral-800">{task.title}</strong>
          <span className="mt-1 block text-[12px] capitalize text-neutral-500">{taskMeta(task)}</span>
          {task.description ? <p className="mt-2 line-clamp-2 text-[12px] leading-5 text-neutral-600">{task.description}</p> : null}
        </div>
      </div>
    </GlassCard>
  );
}

function RoomShell({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[10050] overflow-y-auto bg-[radial-gradient(circle_at_78%_8%,rgba(255,235,210,.50),transparent_27%),radial-gradient(circle_at_12%_90%,rgba(219,222,255,.32),transparent_30%),linear-gradient(145deg,#f5eee7,#eee7e2_54%,#faf6f0)] px-3 pb-16 pt-[94px] text-neutral-900 sm:px-6">
      <main className="mx-auto min-h-[calc(100svh-110px)] w-full max-w-[1450px] rounded-[34px] border border-white/85 bg-white/20 p-5 shadow-[0_28px_90px_rgba(104,87,81,.10),inset_0_1px_0_white] backdrop-blur-3xl sm:p-8">
        <header className="max-w-3xl">
          <span className="text-[11px] uppercase tracking-[.16em] text-neutral-500">{eyebrow}</span>
          <h1 className="mt-2 font-serif text-[clamp(3.2rem,7vw,7rem)] font-medium leading-[.86] tracking-[-.06em]">{title}</h1>
          <p className="mt-4 max-w-2xl text-[13px] leading-6 text-neutral-600">{description}</p>
        </header>
        <div className="mt-8">{children}</div>
      </main>
    </div>
  );
}

export function TodayLiveRooms() {
  const personal = usePersonalContext();
  const [room, setRoom] = useState<LiveRoom | null>(null);

  useEffect(() => {
    const sync = () => setRoom(currentRoom());
    sync();
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  const data = personal.status === 'ready' ? personal.data : null;

  const derived = useMemo(() => {
    if (!data) return null;
    const now = Date.now();
    const futureToday = data.todayEvents.filter((event) => new Date(event.startAt).getTime() >= now);
    const nextEvent = futureToday[0] ?? data.events.find((event) => new Date(event.startAt).getTime() >= now) ?? null;
    const later = futureToday.filter((event) => new Date(event.startAt).getHours() >= 12 && new Date(event.startAt).getHours() < 17);
    const tonight = futureToday.filter((event) => new Date(event.startAt).getHours() >= 17);
    return { nextEvent, later, tonight };
  }, [data]);

  if (!room) return null;

  if (personal.status === 'loading') {
    return <RoomShell eyebrow="Connected Glow data" title="Loading" description="Reading the signed-in account. No sample data is shown while Glow waits."><EmptyState title="Loading your real context…" detail="Tasks, calendar, routines, notes, goals, and wellness are being read from your connected Glow account." /></RoomShell>;
  }

  if (!data) {
    return <RoomShell eyebrow="Connection required" title="Not connected" description="Glow will not replace missing account data with someone else’s information."><EmptyState title="Your personal data is unavailable here" detail="Sign in to the Glow account you want this page to represent, then return to Today." /></RoomShell>;
  }

  if (room === 'meeting') {
    const event = derived?.nextEvent ?? null;
    return (
      <RoomShell eyebrow="Your next calendar context" title={event?.title ?? 'No meeting scheduled'} description="This room reflects the next real event on your connected calendar. Fake participants, rooms, links, and meeting names are never inserted.">
        {event ? (
          <div className="grid gap-4 lg:grid-cols-[1.25fr_.75fr]">
            <EventCard event={event} />
            <GlassCard>
              <span className="text-[11px] uppercase tracking-[.12em] text-neutral-500">Context</span>
              <strong className="mt-2 block font-serif text-[28px] font-medium">{event.location || 'No location attached'}</strong>
              <p className="mt-2 text-[12px] leading-5 text-neutral-600">{event.source === 'google' ? 'From your connected Google Calendar.' : 'From your Glow calendar.'}</p>
            </GlassCard>
          </div>
        ) : <EmptyState title="Your calendar is clear" detail="No upcoming event was found. Glow is intentionally leaving this room empty instead of inventing a design review, participants, or location." />}
      </RoomShell>
    );
  }

  if (room === 'next-up') {
    const event = derived?.nextEvent ?? null;
    const task = data.tasks.find((candidate) => candidate.id !== data.activeTask?.id) ?? data.activeTask;
    return (
      <RoomShell eyebrow="Your actual queue" title="Next up" description="The next real commitment comes from your tasks and connected schedule.">
        <div className="grid gap-4 lg:grid-cols-2">
          {event ? <EventCard event={event} /> : null}
          {task ? <TaskCard task={task} /> : null}
        </div>
        {!event && !task ? <EmptyState title="Nothing is queued" detail="There is no task or calendar event demanding a next step right now." /> : null}
      </RoomShell>
    );
  }

  if (room === 'later') {
    const items = derived?.later ?? [];
    return (
      <RoomShell eyebrow="Your real afternoon" title="Later" description="Only events and work that actually belong to this signed-in account appear here.">
        <div className="grid gap-4 md:grid-cols-2">{items.map((event) => <EventCard key={`${event.source}-${event.id}`} event={event} />)}</div>
        {items.length === 0 ? <EmptyState title="Your afternoon is open" detail="No later-today calendar events were found. Glow has not filled the space with a sample schedule." /> : null}
      </RoomShell>
    );
  }

  if (room === 'tonight') {
    const items = derived?.tonight ?? [];
    const routines = data.routines.filter((routine) => routine.timeOfDay === 'evening' || routine.timeOfDay === 'night');
    return (
      <RoomShell eyebrow="Your actual evening" title="Tonight" description="Calendar commitments and your saved evening routines come together here.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((event) => <EventCard key={`${event.source}-${event.id}`} event={event} />)}
          {routines.map((routine) => (
            <GlassCard key={routine.id} onClick={() => window.location.assign('/routines')}>
              <span className="text-[11px] uppercase tracking-[.12em] text-neutral-500">Saved routine</span>
              <strong className="mt-2 block text-[15px] font-semibold">{routine.name}</strong>
              <p className="mt-2 text-[12px] leading-5 text-neutral-600">{routine.description || `${routine.timeOfDay} routine`}</p>
            </GlassCard>
          ))}
        </div>
        {items.length === 0 && routines.length === 0 ? <EmptyState title="Tonight is open" detail="No evening events or saved evening routines were found for this account." /> : null}
      </RoomShell>
    );
  }

  if (room === 'tomorrow') {
    return (
      <RoomShell eyebrow="Your connected tomorrow" title="Tomorrow" description="This preview comes from your real Glow and Google calendar data.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{data.tomorrowEvents.map((event) => <EventCard key={`${event.source}-${event.id}`} event={event} />)}</div>
        {data.tomorrowEvents.length === 0 ? <EmptyState title="Tomorrow is clear" detail="No events are currently scheduled for tomorrow. No sample leadership syncs or strategy blocks are inserted." /> : null}
      </RoomShell>
    );
  }

  const upcoming = data.events.slice(0, 8);
  const openTasks = data.tasks.slice(0, 8);
  return (
    <RoomShell eyebrow="Replan with real constraints" title="Replan my day" description="Glow surfaces the real commitments and open tasks that can be reorganized. It does not pretend to have changed an external calendar until a real write integration exists.">
      <div className="grid gap-5 lg:grid-cols-2">
        <section>
          <div className="mb-3 flex items-center gap-2 text-[12px] font-semibold text-neutral-700"><Clock3 size={15} /> Upcoming commitments</div>
          <div className="grid gap-3">{upcoming.map((event) => <EventCard key={`${event.source}-${event.id}`} event={event} />)}</div>
          {upcoming.length === 0 ? <EmptyState title="No scheduled constraints" detail="There are no upcoming connected calendar items to move around." /> : null}
        </section>
        <section>
          <div className="mb-3 flex items-center gap-2 text-[12px] font-semibold text-neutral-700"><FileText size={15} /> Open work</div>
          <div className="grid gap-3">{openTasks.map((task) => <TaskCard key={task.id} task={task} />)}</div>
          {openTasks.length === 0 ? <EmptyState title="No open tasks" detail="There are no active Glow tasks to replan right now." /> : null}
        </section>
      </div>
      <div className="mt-5 rounded-[28px] border border-white/80 bg-white/35 p-5 text-[12px] leading-5 text-neutral-600 shadow-[inset_0_1px_0_white] backdrop-blur-2xl">
        <span className="inline-flex items-center gap-2 font-semibold text-neutral-800"><Sparkles size={14} /> Real-action boundary</span>
        <p className="mt-2">This page can help you see what should change. It will not claim a Google Calendar event was moved until Glow has a real authorized calendar-write action for that event.</p>
      </div>
    </RoomShell>
  );
}
