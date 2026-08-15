import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { HairExperience } from '@/components/hair/hair-experience';
import { getHairLogs, getTimelineEvents } from '@/lib/data/completion-v1';
import { getRoutinesByUser, getStepsByUser } from '@/lib/data/routines';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import { getGoalsByUser } from '@/lib/data/goals';
import { updateHairLogAction } from '@/app/actions/detail-records';

export const dynamic = 'force-dynamic';
const fieldClass='w-full rounded-[10px] border border-[#F7D1D8] bg-white px-3 py-2 text-[11px] text-[#3A332F] outline-none focus:border-[#C9727E]';
const dateTimeLocal=(value:Date)=>{const offset=value.getTimezoneOffset();return new Date(value.getTime()-offset*60000).toISOString().slice(0,16);};

export default async function HairPage({ searchParams }: { searchParams: Promise<{ logId?: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  const [logs, timeline, routines, routineSteps, events, goals, params] = await Promise.all([
    getHairLogs(userId),
    getTimelineEvents(userId),
    getRoutinesByUser(userId),
    getStepsByUser(userId),
    getCalendarEventsByUser(userId),
    getGoalsByUser(userId),
    searchParams,
  ]);
  const selected=params.logId ? logs.find((log)=>log.id===params.logId) ?? null : null;

  return (
    <AppShell>
      {params.logId && !selected ? <div role="status" className="mb-4 rounded-[14px] border border-[#F7D1D8] bg-[#F7EEED] px-4 py-3 text-[11px] text-[#7B535C]">That hair log is no longer available.</div> : null}
      {selected ? <section className="mb-5 rounded-[18px] border border-[#C9727E] bg-white p-5 shadow-[0_14px_40px_rgba(201,114,126,.10)]"><div className="flex items-start justify-between gap-3"><div><p className="glow-eyebrow">Selected hair record</p><h2 className="glow-display mt-1 text-[24px] text-[#2B2420]">{selected.style || selected.eventType}</h2></div><Link href="/hair" className="text-[10.5px] text-[#C9727E]">Close</Link></div><form action={updateHairLogAction.bind(null,selected.id)} className="mt-4 grid gap-2 sm:grid-cols-2"><input name="eventType" required defaultValue={selected.eventType} className={fieldClass}/><input name="style" defaultValue={selected.style??''} placeholder="Style" className={fieldClass}/><input name="occurredAt" type="datetime-local" defaultValue={dateTimeLocal(selected.occurredAt)} className={fieldClass}/><input name="products" defaultValue={selected.products??''} placeholder="Products" className={fieldClass}/><label className="flex items-center gap-2 rounded-[10px] border border-[#F7D1D8] px-3 py-2 text-[11px]"><input name="heatUsed" type="checkbox" defaultChecked={selected.heatUsed}/>Heat used</label><input name="nextAction" defaultValue={selected.nextAction??''} placeholder="Next action" className={fieldClass}/><textarea name="notes" rows={3} defaultValue={selected.notes??''} placeholder="Notes" className={`${fieldClass} sm:col-span-2`}/><button type="submit" className="w-fit rounded-full bg-[#C9727E] px-4 py-2.5 text-[11px] font-medium text-white">Save hair record</button></form></section> : null}
      <HairExperience logs={logs} timeline={timeline} routines={routines} routineSteps={routineSteps} events={events} goals={goals} />
    </AppShell>
  );
}
