import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { CanonicalDomainRoom } from '@/components/glow/canonical-domain-room';
import { getWorkSchedulesByUser } from '@/lib/data/work-schedules';

export const dynamic = 'force-dynamic';

const destinations = [
  { label: 'Job Search', href: '/work/job-search', cue: 'Opportunities in motion' },
  { label: 'Interviews', href: '/work/interviews', cue: 'Prepare the next conversation' },
  { label: 'Skills', href: '/work/skills', cue: 'Evidence of growth' },
  { label: 'Portfolio', href: '/work/portfolio', cue: 'Show the work' },
];

export default async function WorkPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const schedules = await getWorkSchedulesByUser(session.user.id);

  return (
    <AppShell>
      <CanonicalDomainRoom
        eyebrow="Life · Career + Work"
        title="Career + Work"
        question="What is building my future, and what needs my attention at work now?"
        climate="work"
        destinations={destinations}
      >
        <section aria-label="Work rhythm">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[12px] uppercase tracking-[.18em] text-stone-500">Current rhythm</p>
              <h2 className="mt-2 font-serif text-[30px] font-medium text-stone-900">Your real work week</h2>
            </div>
            <span className="text-sm text-stone-500">{schedules.length} connected block{schedules.length === 1 ? '' : 's'}</span>
          </div>
          {schedules.length === 0 ? (
            <div data-empty-state="true" className="glow-empty-state">
              No work schedule is connected yet. The room stays ready without inventing a schedule.
            </div>
          ) : (
            <div className="divide-y divide-stone-200/70">
              {schedules.map((schedule) => (
                <article key={schedule.id} className="grid gap-3 py-5 sm:grid-cols-[150px_1fr_auto] sm:items-center">
                  <div>
                    <span className="text-[12px] uppercase tracking-[.14em] text-stone-500">{schedule.dayOfWeek}</span>
                    <p className="mt-1 text-sm text-stone-600">{schedule.startTime} – {schedule.endTime}</p>
                  </div>
                  <div>
                    <strong className="text-base font-semibold text-stone-900">{schedule.title}</strong>
                    {schedule.notes ? <p className="mt-1 text-sm leading-6 text-stone-600">{schedule.notes}</p> : null}
                  </div>
                  <span className="text-xs text-stone-400">Committed time</span>
                </article>
              ))}
            </div>
          )}
        </section>
      </CanonicalDomainRoom>
    </AppShell>
  );
}
