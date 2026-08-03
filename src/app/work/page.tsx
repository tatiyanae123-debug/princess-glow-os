import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { getWorkSchedulesByUser } from '@/lib/data/work-schedules';

export const dynamic = 'force-dynamic';

export default async function WorkPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const schedules = await getWorkSchedulesByUser(session.user.id);

  return (
    <AppShell>
      <div className="space-y-6">
        <section className="rounded-[28px] border border-slate-200/70 bg-white/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-rose-500">Work</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">Make your workday feel structured and light.</h2>
          <p className="mt-3 text-slate-600">Create momentum with clarity, structure, and enough softness to sustain it.</p>
        </section>
        {schedules.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-400 dark:text-slate-500">No work schedules yet. Add your first block to structure the week.</p>
        ) : (
          <section className="grid gap-4 md:grid-cols-2">
            {schedules.map((schedule) => (
              <div key={schedule.id} className="rounded-[28px] border border-slate-200/70 bg-slate-50 p-5">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-slate-900">{schedule.title}</p>
                  <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs text-rose-700 capitalize">{schedule.dayOfWeek}</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{schedule.startTime} – {schedule.endTime}</p>
                {schedule.notes && <p className="mt-1 text-sm text-slate-500">{schedule.notes}</p>}
              </div>
            ))}
          </section>
        )}
      </div>
    </AppShell>
  );
}
