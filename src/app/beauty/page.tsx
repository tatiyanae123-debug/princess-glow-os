import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import { getBeautyRoutinesByUser } from '@/lib/data/beauty-routines';

export const dynamic = 'force-dynamic';

export default async function BeautyPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const routines = await getBeautyRoutinesByUser(session.user.id);

  return (
    <AppShell>
      <SectionPage eyebrow="Beauty" title="Care that feels luxurious" description="Treat beauty as an intentional ritual rather than an afterthought.">
        <Card className="space-y-3">
          {routines.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-400 dark:text-slate-500">No beauty routines yet. Add your first ritual step.</p>
          ) : (
            routines.map((routine) => (
              <div key={routine.id} className="rounded-[20px] border border-slate-200/70 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/60">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{routine.name}</p>
                    {routine.notes && <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{routine.notes}</p>}
                    {routine.products && routine.products.length > 0 && (
                      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{routine.products.join(', ')}</p>
                    )}
                  </div>
                  <span className="shrink-0 rounded-full bg-rose-100 px-2 py-0.5 text-xs text-rose-700 dark:bg-rose-500/10 dark:text-rose-300 capitalize">{routine.timeOfDay}</span>
                </div>
              </div>
            ))
          )}
        </Card>
      </SectionPage>
    </AppShell>
  );
}
