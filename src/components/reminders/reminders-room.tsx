'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { BellRing, CalendarClock, CheckCircle2, CircleAlert, Clock3, ExternalLink, ListChecks, RefreshCw, Sparkles } from 'lucide-react';

type Reminder = { id: string; title: string; notes: string | null; listName: string; dueAt: string | null; completed: boolean; lastSyncedAt: string; domain: string; destinations: string[]; intent: string; urgency: string; nextAction: string };

type Props = { reminders: Reminder[]; connection: { status: string; lastImportedAt: string | null } | null };

const tabs = ['Attention', 'Today', 'Upcoming', 'Unscheduled', 'Completed', 'Lists'];
const destinationPath: Record<string, string> = { reminders: '/reminders', tasks: '/tasks', today: '/today', briefings: '/briefings', calendar: '/calendar', planning: '/planning', food: '/food', finance: '/finance', 'financial-brain': '/finance/brain', beauty: '/beauty', 'beauty-lab': '/beauty/lab', hair: '/hair', fitness: '/fitness', wellness: '/wellness', home: '/home', projects: '/projects', goals: '/goals' };

function dueLabel(value: string | null) { if (!value) return 'No date'; const date = new Date(value); return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }); }

export function RemindersRoom({ reminders, connection }: Props) {
  const [tab, setTab] = useState('Attention');
  const now = useMemo(() => new Date(), []);
  const today = now.toDateString();
  const visible = useMemo(() => reminders.filter((reminder) => {
    if (tab === 'Completed') return reminder.completed;
    if (reminder.completed) return false;
    if (tab === 'Today') return reminder.dueAt ? new Date(reminder.dueAt).toDateString() === today : false;
    if (tab === 'Upcoming') return reminder.dueAt ? new Date(reminder.dueAt) > now && new Date(reminder.dueAt).toDateString() !== today : false;
    if (tab === 'Unscheduled') return !reminder.dueAt;
    return true;
  }), [reminders, tab, today, now]);
  const overdue = reminders.filter((r) => !r.completed && r.dueAt && new Date(r.dueAt) < now && new Date(r.dueAt).toDateString() !== today).length;
  const todayCount = reminders.filter((r) => !r.completed && r.dueAt && new Date(r.dueAt).toDateString() === today).length;
  const lists = Array.from(new Set(reminders.map((r) => r.listName)));

  return (
    <div className="space-y-5">
      <section className="grid gap-4 xl:grid-cols-[1.35fr_.65fr]">
        <div className="relative overflow-hidden rounded-[20px] border border-[#F1E7E3] bg-[linear-gradient(135deg,#FDF8F6,#FBE4E8)] p-6 sm:p-8">
          <div className="relative max-w-2xl">
            <div className="flex items-center gap-2 text-[#C9727E]"><BellRing size={15} /><p className="text-[11px] font-semibold uppercase tracking-[.16em]">Apple Reminders · Attention Tray</p></div>
            <h2 className="glow-display mt-2 text-[30px] leading-[1.05] text-[#2B2420]">Remember once. Let Glow understand the rest.</h2>
            <p className="mt-3 max-w-xl text-[12.5px] leading-5 text-[#8A8078]">Apple Reminders stays your fast capture tool. Glow imports it safely, understands what each reminder is about, then lets that information influence Today, Tasks, Calendar, Food, Beauty, Hair, Finance, Projects, Home, Wellness and Briefings where relevant.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href="/connections" className="rounded-full bg-[#C9727E] px-4 py-2.5 text-[12px] font-medium text-white hover:bg-[#B15A68]">Manage Apple connection</Link>
              <Link href="/today" className="rounded-full border border-[#F1E7E3] bg-white px-4 py-2.5 text-[12px] text-[#8A8078] hover:bg-[#FDF8F6]">See what matters now</Link>
            </div>
          </div>
        </div>
        <div className="rounded-[20px] border border-[#F1E7E3] bg-white p-5">
          <div className="flex items-center justify-between"><p className="glow-display text-[18px] text-[#2B2420]">Sync health</p><RefreshCw size={14} className="text-[#C9727E]" /></div>
          <div className="mt-4 grid grid-cols-2 gap-2">{[['Status', connection?.status ?? 'Not set up'], ['Imported', String(reminders.length)], ['Today', String(todayCount)], ['Overdue', String(overdue)]].map(([a, b]) => (
            <div key={a} className="rounded-[14px] border border-[#F1E7E3] bg-[#FDF8F6] p-3"><p className="text-[10px] uppercase tracking-[.1em] text-[#B5ACA5]">{a}</p><p className="glow-display mt-1 text-[15px] text-[#2B2420]">{b}</p></div>
          ))}</div>
          <p className="mt-4 text-[11px] leading-4 text-[#8A8078]">{connection?.lastImportedAt ? `Last import ${new Date(connection.lastImportedAt).toLocaleString()}` : 'Open Connections to create the secure iPhone Shortcut bridge.'}</p>
        </div>
      </section>

      <div className="flex gap-1.5 overflow-x-auto rounded-[14px] border border-[#F1E7E3] bg-white p-1.5">
        {tabs.map((item) => <button type="button" key={item} onClick={() => setTab(item)} className={`min-w-max rounded-full px-3.5 py-2 text-[11.5px] font-medium ${tab === item ? 'bg-[#FBE4E8] text-[#B15A68]' : 'text-[#8A8078] hover:bg-[#FDF8F6]'}`}>{item}</button>)}
      </div>

      {tab === 'Lists' ? (
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {lists.length ? lists.map((list) => (
            <div key={list} className="rounded-[18px] border border-[#F1E7E3] bg-white p-4">
              <ListChecks size={15} className="text-[#C9727E]" />
              <p className="glow-display mt-3 text-[18px] text-[#2B2420]">{list}</p>
              <p className="mt-2 text-[11px] text-[#8A8078]">{reminders.filter((r) => r.listName === list && !r.completed).length} open · {reminders.filter((r) => r.listName === list && r.completed).length} completed</p>
            </div>
          )) : <Empty />}
        </section>
      ) : (
        <section className="space-y-2">
          {visible.length ? visible.map((reminder) => (
            <article key={reminder.id} className="rounded-[18px] border border-[#F1E7E3] bg-white p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[.08em] ${reminder.urgency === 'overdue' ? 'bg-[#FBE4E8] text-[#B15A68]' : reminder.urgency === 'today' ? 'bg-[#F1E8D9] text-[#9A7A3D]' : reminder.completed ? 'bg-[#E4EBDD] text-[#5A6E52]' : 'bg-[#FDF8F6] text-[#8A8078]'}`}>{reminder.urgency}</span>
                    <span className="rounded-full bg-[#FDF3F2] px-2.5 py-1 text-[10px] text-[#B15A68]">{reminder.domain}</span>
                    <span className="text-[10px] text-[#B5ACA5]">{reminder.listName}</span>
                  </div>
                  <h3 className="glow-display mt-2 text-[20px] text-[#2B2420]">{reminder.title}</h3>
                  {reminder.notes ? <p className="mt-2 text-[11.5px] leading-4 text-[#8A8078]">{reminder.notes}</p> : null}
                  <div className="mt-3 flex items-center gap-2 text-[11px] text-[#8A8078]">{reminder.completed ? <CheckCircle2 size={13} className="text-[#5A6E52]" /> : reminder.urgency === 'overdue' ? <CircleAlert size={13} className="text-[#B15A68]" /> : <Clock3 size={13} />}<span>{dueLabel(reminder.dueAt)}</span></div>
                </div>
                <div className="w-full rounded-[16px] bg-[#FDF3F2] p-4 lg:w-[310px]">
                  <div className="flex items-center gap-1.5 text-[#B15A68]"><Sparkles size={13} /><p className="text-[10px] font-semibold uppercase tracking-[.1em]">Glow understood</p></div>
                  <p className="mt-2 text-[11.5px] leading-4 text-[#4A4440]">{reminder.nextAction}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">{reminder.destinations.filter((d) => d !== 'reminders').slice(0, 4).map((destination) => (
                    <Link key={destination} href={destinationPath[destination] ?? '/brain'} className="rounded-full border border-[#F1E7E3] bg-white px-2.5 py-1.5 text-[10px] text-[#B15A68] hover:bg-[#FDF8F6]">{destination} ↗</Link>
                  ))}</div>
                </div>
              </div>
            </article>
          )) : <Empty />}
        </section>
      )}

      <section className="grid gap-3 md:grid-cols-3">
        <Link href="/briefings" className="rounded-[18px] border border-[#F1E7E3] bg-white p-4 hover:bg-[#FDF8F6]"><CalendarClock size={15} className="text-[#C9727E]" /><p className="glow-display mt-3 text-[17px] text-[#2B2420]">Briefings</p><p className="mt-2 text-[11px] leading-4 text-[#8A8078]">Due and overdue reminders can be surfaced in the morning, evening and weekly review.</p></Link>
        <Link href="/brain" className="rounded-[18px] border border-[#F1E7E3] bg-white p-4 hover:bg-[#FDF8F6]"><Sparkles size={15} className="text-[#7C6B9C]" /><p className="glow-display mt-3 text-[17px] text-[#2B2420]">Reminder Intelligence</p><p className="mt-2 text-[11px] leading-4 text-[#8A8078]">Ask Glow what can wait, what belongs on the calendar, or what should become a project action.</p></Link>
        <Link href="/connections" className="rounded-[18px] border border-[#F1E7E3] bg-white p-4 hover:bg-[#FDF8F6]"><ExternalLink size={15} className="text-[#5A6E52]" /><p className="glow-display mt-3 text-[17px] text-[#2B2420]">iPhone Bridge</p><p className="mt-2 text-[11px] leading-4 text-[#8A8078]">The Apple source remains import-only. Glow never needs your Apple password or iCloud credentials.</p></Link>
      </section>
    </div>
  );
}

function Empty() {
  return (
    <div className="col-span-full rounded-[18px] border border-dashed border-[#F1E7E3] bg-white px-5 py-10 text-center">
      <BellRing className="mx-auto text-[#C9727E]" />
      <p className="glow-display mt-3 text-[18px] text-[#2B2420]">Nothing here yet.</p>
      <p className="mt-2 text-[11.5px] text-[#8A8078]">Sync Apple Reminders from your iPhone or add a reminder through Glow.</p>
    </div>
  );
}
