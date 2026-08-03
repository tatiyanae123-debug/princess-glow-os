import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import { getWellnessEntriesByUser } from '@/lib/data/wellness-entries';

export const dynamic = 'force-dynamic';

export default async function WellnessPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const entries = await getWellnessEntriesByUser(session.user.id);
  const latest = entries[0] ?? null;

  return (
    <AppShell>
      <SectionPage eyebrow="Wellness" title="Energy that feels supported" description="Let wellness be practical, restorative, and deeply personal.">
        {latest ? (
          <Card className="grid gap-3 md:grid-cols-3">
            <div className="rounded-[20px] border border-slate-200/70 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
              <p className="font-medium text-slate-900 dark:text-slate-100">Mood</p>
              <p className="mt-2 text-lg font-semibold capitalize text-rose-600 dark:text-rose-400">{latest.mood ?? '–'}</p>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Latest entry · {latest.entryDate}</p>
            </div>
            <div className="rounded-[20px] border border-slate-200/70 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
              <p className="font-medium text-slate-900 dark:text-slate-100">Energy</p>
              <p className="mt-2 text-lg font-semibold capitalize text-amber-600 dark:text-amber-400">{latest.energy ?? '–'}</p>
              {latest.waterGlasses !== null && (
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{latest.waterGlasses} glasses of water</p>
              )}
            </div>
            <div className="rounded-[20px] border border-slate-200/70 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
              <p className="font-medium text-slate-900 dark:text-slate-100">Sleep</p>
              <p className="mt-2 text-lg font-semibold text-sky-600 dark:text-sky-400">{latest.sleepHours != null ? `${latest.sleepHours}h` : '–'}</p>
              {latest.notes && <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{latest.notes}</p>}
            </div>
          </Card>
        ) : (
          <p className="py-4 text-center text-sm text-slate-400 dark:text-slate-500">No wellness entries yet. Log your first check-in.</p>
        )}
        {entries.length > 1 && (
          <Card className="mt-4 space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Recent entries</p>
            {entries.slice(1, 6).map((entry) => (
              <div key={entry.id} className="flex items-center justify-between rounded-[16px] border border-slate-200/70 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/60">
                <p className="text-sm text-slate-700 dark:text-slate-300">{entry.entryDate}</p>
                <div className="flex gap-3 text-xs text-slate-500 dark:text-slate-400">
                  {entry.mood && <span className="capitalize">{entry.mood}</span>}
                  {entry.energy && <span className="capitalize">{entry.energy}</span>}
                  {entry.sleepHours != null && <span>{entry.sleepHours}h sleep</span>}
                </div>
              </div>
            ))}
          </Card>
        )}
      </SectionPage>
    </AppShell>
  );
}
