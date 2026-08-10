import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import { WellnessEntryManager } from '@/components/wellness/wellness-entry-manager';
import { getWellnessEntriesByUser } from '@/lib/data/wellness-entries';
import { getMedicationsByUser, getSupplementsByUser } from '@/lib/data/health-intelligence';
import { createMedicationAction, createSupplementAction, setMedicationActiveAction, setSupplementActiveAction } from '@/app/actions/health-intelligence';

export const dynamic = 'force-dynamic';

const fieldClass = 'w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800';

export default async function WellnessPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const [entries, medications, supplements] = await Promise.all([
    getWellnessEntriesByUser(session.user.id),
    getMedicationsByUser(session.user.id),
    getSupplementsByUser(session.user.id),
  ]);

  return (
    <AppShell>
      <SectionPage eyebrow="Wellness" title="Energy that feels supported" description="Keep wellness check-ins, medication records, and supplements in one private place.">
        <div className="space-y-6">
          <div className="grid gap-5 xl:grid-cols-2">
            <Card className="space-y-4">
              <div><p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Medication</p><h2 className="mt-2 text-xl font-semibold">Medication record</h2><p className="mt-1 text-sm text-slate-500">A private organizer for what you take. Glow OS does not change doses or prescribe treatment.</p></div>
              <form action={createMedicationAction} className="grid gap-3 sm:grid-cols-2">
                <input name="name" required placeholder="Medication name" className={fieldClass} />
                <input name="dosage" placeholder="Dosage" className={fieldClass} />
                <input name="frequency" placeholder="Frequency" className={fieldClass} />
                <input name="timeOfDay" placeholder="Time of day" className={fieldClass} />
                <input name="prescriber" placeholder="Prescriber" className={fieldClass} />
                <input name="startedAt" type="date" className={fieldClass} />
                <input name="instructions" placeholder="Instructions" className={`${fieldClass} sm:col-span-2`} />
                <textarea name="notes" rows={2} placeholder="Notes" className={`${fieldClass} sm:col-span-2`} />
                <button type="submit" className="w-fit rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-slate-900">Add medication</button>
              </form>
              <div className="space-y-2">
                {medications.length === 0 ? <p className="text-sm text-slate-500">No medications saved yet.</p> : medications.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
                    <div className="flex items-start justify-between gap-3"><div><p className="font-medium">{item.name}</p><p className="text-xs text-slate-500">{[item.dosage, item.frequency, item.timeOfDay].filter(Boolean).join(' · ') || 'No schedule details yet'}</p></div><span className="text-xs text-slate-500">{item.active ? 'Active' : 'Inactive'}</span></div>
                    {item.instructions && <p className="mt-2 text-sm text-slate-500">{item.instructions}</p>}
                    <form action={setMedicationActiveAction.bind(null, item.id, !item.active)} className="mt-2"><button type="submit" className="text-xs font-medium underline underline-offset-4">Mark {item.active ? 'inactive' : 'active'}</button></form>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="space-y-4">
              <div><p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Supplements</p><h2 className="mt-2 text-xl font-semibold">Supplement routine</h2><p className="mt-1 text-sm text-slate-500">Track what is in your routine, when you use it, and any notes you want Glow OS to remember.</p></div>
              <form action={createSupplementAction} className="grid gap-3 sm:grid-cols-2">
                <input name="name" required placeholder="Supplement name" className={fieldClass} />
                <input name="dosage" placeholder="Dosage" className={fieldClass} />
                <input name="frequency" placeholder="Frequency" className={fieldClass} />
                <input name="timeOfDay" placeholder="Time of day" className={fieldClass} />
                <input name="startedAt" type="date" className={fieldClass} />
                <input name="instructions" placeholder="Instructions" className={fieldClass} />
                <textarea name="notes" rows={2} placeholder="Notes" className={`${fieldClass} sm:col-span-2`} />
                <button type="submit" className="w-fit rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-slate-900">Add supplement</button>
              </form>
              <div className="space-y-2">
                {supplements.length === 0 ? <p className="text-sm text-slate-500">No supplements saved yet.</p> : supplements.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
                    <div className="flex items-start justify-between gap-3"><div><p className="font-medium">{item.name}</p><p className="text-xs text-slate-500">{[item.dosage, item.frequency, item.timeOfDay].filter(Boolean).join(' · ') || 'No schedule details yet'}</p></div><span className="text-xs text-slate-500">{item.active ? 'Active' : 'Inactive'}</span></div>
                    {item.instructions && <p className="mt-2 text-sm text-slate-500">{item.instructions}</p>}
                    <form action={setSupplementActiveAction.bind(null, item.id, !item.active)} className="mt-2"><button type="submit" className="text-xs font-medium underline underline-offset-4">Mark {item.active ? 'inactive' : 'active'}</button></form>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <WellnessEntryManager initialEntries={entries} />
        </div>
      </SectionPage>
    </AppShell>
  );
}
