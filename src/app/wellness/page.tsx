import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { Card } from '@/components/ui/card';
import { HealthCareExperience } from '@/components/wellness/health-care-experience';
import { WellnessEntryManager } from '@/components/wellness/wellness-entry-manager';
import { getWellnessEntriesByUser } from '@/lib/data/wellness-entries';
import { getMedicationsByUser, getSupplementsByUser } from '@/lib/data/health-intelligence';
import { createMedicationAction, createSupplementAction, setMedicationActiveAction, setSupplementActiveAction } from '@/app/actions/health-intelligence';
import { Pill, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';
const fieldClass = 'w-full rounded-lg border border-[#F1E7E3] px-3.5 py-2.5 text-[12px] text-[#2B2420] placeholder:text-[#B5ACA5] focus:border-[#C9727E] focus:outline-none';

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
      <div className="space-y-6">
        <HealthCareExperience entries={entries} />

        <div>
          <p className="glow-eyebrow">Medications &amp; Supplements</p>
          <p className="mt-1 text-[13px] text-[#8A8078]">A private organizer for what you take. Glow OS never changes doses or prescribes treatment — it only helps you remember.</p>
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          <Card className="space-y-4">
            <div className="flex items-center gap-1.5"><Pill size={14} className="text-[#C9727E]" /><p className="text-[13px] font-medium text-[#2B2420]">Medication record</p></div>
            <details className="group">
              <summary className="cursor-pointer list-none rounded-full border border-[#F1E7E3] px-3.5 py-2 text-[11.5px] font-medium text-[#8A8078] hover:bg-[#FDF8F6]">+ Add a medication</summary>
              <form action={createMedicationAction} className="mt-3 grid gap-3 sm:grid-cols-2">
                <input name="name" required placeholder="Medication name" className={fieldClass} />
                <input name="dosage" placeholder="Dosage" className={fieldClass} />
                <input name="frequency" placeholder="Frequency" className={fieldClass} />
                <input name="timeOfDay" placeholder="Time of day" className={fieldClass} />
                <input name="prescriber" placeholder="Prescriber" className={fieldClass} />
                <input name="startedAt" type="date" className={fieldClass} />
                <input name="instructions" placeholder="Instructions" className={`${fieldClass} sm:col-span-2`} />
                <textarea name="notes" rows={2} placeholder="Notes" className={`${fieldClass} sm:col-span-2`} />
                <button type="submit" className="w-fit rounded-full bg-[#C9727E] px-4 py-2.5 text-[12px] font-medium text-white hover:bg-[#B15A68] sm:col-span-2">Add medication</button>
              </form>
            </details>
            <div className="space-y-2">
              {medications.length === 0 ? (
                <p className="text-[12px] text-[#8A8078]">No medications saved yet.</p>
              ) : medications.map((item) => (
                <div key={item.id} className="rounded-[14px] border border-[#F1E7E3] bg-[#FDF8F6] p-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="glow-display text-[14px] text-[#2B2420]">{item.name}</p>
                      <p className="mt-1 text-[10.5px] text-[#8A8078]">{[item.dosage, item.frequency, item.timeOfDay].filter(Boolean).join(' · ') || 'No schedule details yet'}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${item.active ? 'bg-[#E4EBDD] text-[#5A6E52]' : 'bg-[#F4ECE8] text-[#9A9088]'}`}>{item.active ? 'Active' : 'Inactive'}</span>
                  </div>
                  {item.instructions ? <p className="mt-2 text-[11px] text-[#8A8078]">{item.instructions}</p> : null}
                  <form action={setMedicationActiveAction.bind(null, item.id, !item.active)} className="mt-2">
                    <button type="submit" className="text-[10.5px] font-medium text-[#C9727E] underline-offset-4 hover:underline">Mark {item.active ? 'inactive' : 'active'}</button>
                  </form>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-4">
            <div className="flex items-center gap-1.5"><Sparkles size={14} className="text-[#C9727E]" /><p className="text-[13px] font-medium text-[#2B2420]">Supplement routine</p></div>
            <details className="group">
              <summary className="cursor-pointer list-none rounded-full border border-[#F1E7E3] px-3.5 py-2 text-[11.5px] font-medium text-[#8A8078] hover:bg-[#FDF8F6]">+ Add a supplement</summary>
              <form action={createSupplementAction} className="mt-3 grid gap-3 sm:grid-cols-2">
                <input name="name" required placeholder="Supplement name" className={fieldClass} />
                <input name="dosage" placeholder="Dosage" className={fieldClass} />
                <input name="frequency" placeholder="Frequency" className={fieldClass} />
                <input name="timeOfDay" placeholder="Time of day" className={fieldClass} />
                <input name="startedAt" type="date" className={fieldClass} />
                <input name="instructions" placeholder="Instructions" className={fieldClass} />
                <textarea name="notes" rows={2} placeholder="Notes" className={`${fieldClass} sm:col-span-2`} />
                <button type="submit" className="w-fit rounded-full bg-[#C9727E] px-4 py-2.5 text-[12px] font-medium text-white hover:bg-[#B15A68] sm:col-span-2">Add supplement</button>
              </form>
            </details>
            <div className="space-y-2">
              {supplements.length === 0 ? (
                <p className="text-[12px] text-[#8A8078]">No supplements saved yet.</p>
              ) : supplements.map((item) => (
                <div key={item.id} className="rounded-[14px] border border-[#F1E7E3] bg-[#FDF8F6] p-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="glow-display text-[14px] text-[#2B2420]">{item.name}</p>
                      <p className="mt-1 text-[10.5px] text-[#8A8078]">{[item.dosage, item.frequency, item.timeOfDay].filter(Boolean).join(' · ') || 'No schedule details yet'}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${item.active ? 'bg-[#E4EBDD] text-[#5A6E52]' : 'bg-[#F4ECE8] text-[#9A9088]'}`}>{item.active ? 'Active' : 'Inactive'}</span>
                  </div>
                  {item.instructions ? <p className="mt-2 text-[11px] text-[#8A8078]">{item.instructions}</p> : null}
                  <form action={setSupplementActiveAction.bind(null, item.id, !item.active)} className="mt-2">
                    <button type="submit" className="text-[10.5px] font-medium text-[#C9727E] underline-offset-4 hover:underline">Mark {item.active ? 'inactive' : 'active'}</button>
                  </form>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <WellnessEntryManager initialEntries={entries} />
      </div>
    </AppShell>
  );
}
