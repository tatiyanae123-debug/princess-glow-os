import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { getRoutinesByUser } from '@/lib/data/routines';

export const dynamic = 'force-dynamic';

export default async function RoutinesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const routines = await getRoutinesByUser(session.user.id);

  return (
    <AppShell>
      <div className="space-y-6">
        <section className="rounded-[28px] border border-slate-200/70 bg-white/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-rose-500">Routines</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">Design repeatable rituals that feel effortless.</h2>
          <p className="mt-3 text-slate-600">Design repeatable rituals that feel elegant and easy to maintain.</p>
        </section>
        {routines.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-400 dark:text-slate-500">No routines yet. Add your first ritual to get started.</p>
        ) : (
          <section className="rounded-[28px] border border-slate-200/70 bg-white/80 p-6 shadow-sm">
            <div className="space-y-3">
              {routines.map((routine) => (
                <div key={routine.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-slate-700">
                  <div>
                    <p className="font-medium">{routine.name}</p>
                    {routine.description && <p className="mt-0.5 text-sm text-slate-500">{routine.description}</p>}
                  </div>
                  <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs text-rose-700 capitalize">{routine.timeOfDay}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
