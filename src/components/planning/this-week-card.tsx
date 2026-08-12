import Link from 'next/link';
import { CalendarRange } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { CalendarEvent, Task } from '@/lib/types';

function startOfWeek(date: Date) {
  const day = date.getDay();
  const diff = (day + 6) % 7; // Monday-start
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - diff);
  return start;
}

/** Real, live "This Week" digest — tasks due this week plus this week's fixed calendar commitments, one connected view instead of two separate rooms. */
export function ThisWeekCard({ tasks, events }: { tasks: Task[]; events: CalendarEvent[] }) {
  const weekStart = startOfWeek(new Date());
  const weekEnd = new Date(weekStart.getTime() + 7 * 86400000);

  const weekTasks = tasks
    .filter((task) => task.status !== 'done' && task.status !== 'cancelled' && task.dueDate && task.dueDate >= weekStart && task.dueDate < weekEnd)
    .sort((a, b) => (a.dueDate!.getTime() - b.dueDate!.getTime()));

  const weekEvents = events
    .filter((event) => event.startAt >= weekStart && event.startAt < weekEnd)
    .sort((a, b) => a.startAt.getTime() - b.startAt.getTime())
    .slice(0, 6);

  return (
    <Card className="p-0 overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b border-[#e7dbd4] px-5 py-4">
        <div className="flex items-center gap-2"><CalendarRange size={14} className="text-[#9c7477]" /><h2 className="glow-display text-[19px] text-[#473a35]">This Week</h2></div>
        <Link href="/calendar?view=week" className="text-[8px] font-semibold uppercase tracking-[.1em] text-[#9d6f73]">Plan This Window →</Link>
      </div>
      <div className="grid gap-0 sm:grid-cols-2 sm:divide-x sm:divide-[#eee3dc]">
        <div className="p-4">
          <p className="text-[7px] font-semibold uppercase tracking-[.14em] text-[#9a847c]">Due this week</p>
          {weekTasks.length === 0 ? <p className="mt-3 text-[9px] text-[#8e7b74]">Nothing due this week yet.</p> : (
            <ul className="mt-2 space-y-2">
              {weekTasks.slice(0, 6).map((task) => (
                <li key={task.id} className="flex items-center justify-between gap-2 text-[9px] text-[#4a3d38]">
                  <span className="min-w-0 truncate">{task.title}</span>
                  <span className="shrink-0 text-[7px] uppercase tracking-[.08em] text-[#9a847c]">{task.dueDate!.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/tasks?view=upcoming" className="mt-3 inline-block text-[8px] font-medium text-[#9d6f73]">Open Tasks →</Link>
        </div>
        <div className="p-4">
          <p className="text-[7px] font-semibold uppercase tracking-[.14em] text-[#9a847c]">Fixed commitments</p>
          {weekEvents.length === 0 ? <p className="mt-3 text-[9px] text-[#8e7b74]">No fixed commitments yet this week.</p> : (
            <ul className="mt-2 space-y-2">
              {weekEvents.map((event) => (
                <li key={event.id} className="flex items-center justify-between gap-2 text-[9px] text-[#4a3d38]">
                  <span className="min-w-0 truncate">{event.title}</span>
                  <span className="shrink-0 text-[7px] uppercase tracking-[.08em] text-[#9a847c]">{event.startAt.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/calendar?view=week" className="mt-3 inline-block text-[8px] font-medium text-[#9d6f73]">Open Calendar →</Link>
        </div>
      </div>
    </Card>
  );
}
