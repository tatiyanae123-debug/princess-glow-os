import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { Card } from '@/components/ui/card';
import { HealthCareExperience } from '@/components/wellness/health-care-experience';
import { WellnessEntryManager } from '@/components/wellness/wellness-entry-manager';
import { getWellnessEntriesByUser } from '@/lib/data/wellness-entries';
import { getMedicationsByUser, getSupplementsByUser } from '@/lib/data/health-intelligence';
import {
  createMedicationAction,
  createSupplementAction,
  setMedicationActiveAction,
  setSupplementActiveAction,
  updateMedicationAction,
  updateSupplementAction,
} from '@/app/actions/health-intelligence';
import { Pill, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';
const fieldClass = 'w-full rounded-lg border border-[#F7D1D8] bg-white px-3.5 py-2.5 text-[12px] text-[#2B2420] placeholder:text-[#B5ACA5] focus:border-[#C9727E] focus:outline-none';

function dateInput(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : '';
}

export default async function WellnessPage({ searchParams }: { searchParams: Promise<{ medicationId?: string; supplementId?: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const { medicationId, supplementId } = await searchParams;
  const [entries, medications, supplements] = await Promise.all([
    getWellnessEntriesByUser(session.user.id),
    getMedicationsByUser(session.user.id),
    getSupplementsByUser(session.user.id),
  ]);

  const selectedMedication = medicationId ? medications.find((item) => item.id === medicationId) ?? null : null;
  const selectedSupplement = supplementId ? supplements.find((item) => item.id === supplementId) ?? null : null;
  const orderedMedications = selectedMedication ? [selectedMedication, ...medications.filter((item) => item.id !== selectedMedication.id)] : medications;
  const orderedSupplements = selectedSupplement ? [selectedSupplement, ...supplements.filter((item) => item.id !== selectedSupplement.id)] : supplements;

  return (
    <AppShell>
      <div className="space-y-6">
        <HealthCareExperience entries={entries} />

        <div id="medications-supplements">
          <p className="glow-eyebrow">Medications &amp; Supplements</p>
          <p className="mt-1 text-[13px] text-[#8A8078]">A private organizer for what you take. Glow OS never changes doses or prescribes treatment — it only helps you remember and organize what you have saved.</p>
        </div>

        {(medicationId && !selectedMedication) || (supplementId && !selectedSupplement) ? (
          <div role="status" className="rounded-[14px] border border-[#F7D1D8] bg-[#F7EEED] px-4 py-3 text-[11px] text-[#7B535C]">
            That saved medication or supplement is no longer available.
          </div>
        ) : null}

        <div className="grid gap-5 xl:grid-cols-2">
          <Card className="space-y-4">
            <div className="flex items-center gap-1.5"><Pill size={14} className="text-[#C9727E]" /><p className="text-[13px] font-medium text-[#2B2420]">Medication record</p></div>
            <details className="group">
              <summary className="cursor-pointer list-none rounded-full border border-[#F7D1D8] px-3.5 py-2 text-[11.5px] font-medium text-[#8A8078] hover:bg-[#F7EEED]">+ Add a medication</summary>
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
              {orderedMedications.length === 0 ? (
                <p className="text-[12px] text-[#8A8078]">No medications saved yet.</p>
              ) : orderedMedications.map((item) => {
                const selected = item.id === medicationId;
                return (
                  <details key={item.id} open={selected} className={`rounded-[14px] border bg-white ${selected ? 'border-[#C9727E] shadow-[0_10px_30px_rgba(201,114,126,.10)]' : 'border-[#F7D1D8]'}`}>
                    <summary className="cursor-pointer list-none p-3.5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="glow-display text-[14px] text-[#2B2420]">{item.name}</p>
                          <p className="mt-1 text-[10.5px] text-[#8A8078]">{[item.dosage, item.frequency, item.timeOfDay].filter(Boolean).join(' · ') || 'No schedule details yet'}</p>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${item.active ? 'bg-[#E4EBDD] text-[#5A6E52]' : 'bg-[#F4ECE8] text-[#9A9088]'}`}>{item.active ? 'Active' : 'Inactive'}</span>
                      </div>
                      {item.instructions ? <p className="mt-2 text-[11px] text-[#8A8078]">{item.instructions}</p> : null}
                      <p className="mt-2 text-[10px] font-medium text-[#C9727E]">Open details &amp; edit</p>
                    </summary>
                    <div className="border-t border-[#F7EEED] p-3.5">
                      <form action={updateMedicationAction.bind(null, item.id)} className="grid gap-2 sm:grid-cols-2">
                        <input name="name" required defaultValue={item.name} className={fieldClass} />
                        <input name="dosage" defaultValue={item.dosage ?? ''} placeholder="Dosage" className={fieldClass} />
                        <input name="frequency" defaultValue={item.frequency ?? ''} placeholder="Frequency" className={fieldClass} />
                        <input name="timeOfDay" defaultValue={item.timeOfDay ?? ''} placeholder="Time of day" className={fieldClass} />
                        <input name="prescriber" defaultValue={item.prescriber ?? ''} placeholder="Prescriber" className={fieldClass} />
                        <input name="startedAt" type="date" defaultValue={dateInput(item.startedAt)} className={fieldClass} />
                        <input name="instructions" defaultValue={item.instructions ?? ''} placeholder="Instructions" className={`${fieldClass} sm:col-span-2`} />
                        <textarea name="notes" rows={2} defaultValue={item.notes ?? ''} placeholder="Notes" className={`${fieldClass} sm:col-span-2`} />
                        <button type="submit" className="w-fit rounded-full bg-[#2B2420] px-4 py-2 text-[11px] font-medium text-white">Save changes</button>
                      </form>
                      <form action={setMedicationActiveAction.bind(null, item.id, !item.active)} className="mt-2">
                        <button type="submit" className="text-[10.5px] font-medium text-[#C9727E] underline-offset-4 hover:underline">Mark {item.active ? 'inactive' : 'active'}</button>
                      </form>
                    </div>
                  </details>
                );
              })}
            </div>
          </Card>

          <Card className="space-y-4">
            <div className="flex items-center gap-1.5"><Sparkles size={14} className="text-[#C9727E]" /><p className="text-[13px] font-medium text-[#2B2420]">Supplement routine</p></div>
            <details className="group">
              <summary className="cursor-pointer list-none rounded-full border border-[#F7D1D8] px-3.5 py-2 text-[11.5px] font-medium text-[#8A8078] hover:bg-[#F7EEED]">+ Add a supplement</summary>
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
              {orderedSupplements.length === 0 ? (
                <p className="text-[12px] text-[#8A8078]">No supplements saved yet.</p>
              ) : orderedSupplements.map((item) => {
                const selected = item.id === supplementId;
                return (
                  <details key={item.id} open={selected} className={`rounded-[14px] border bg-white ${selected ? 'border-[#C9727E] shadow-[0_10px_30px_rgba(201,114,126,.10)]' : 'border-[#F7D1D8]'}`}>
                    <summary className="cursor-pointer list-none p-3.5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="glow-display text-[14px] text-[#2B2420]">{item.name}</p>
                          <p className="mt-1 text-[10.5px] text-[#8A8078]">{[item.dosage, item.frequency, item.timeOfDay].filter(Boolean).join(' · ') || 'No schedule details yet'}</p>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${item.active ? 'bg-[#E4EBDD] text-[#5A6E52]' : 'bg-[#F4ECE8] text-[#9A9088]'}`}>{item.active ? 'Active' : 'Inactive'}</span>
                      </div>
                      {item.instructions ? <p className="mt-2 text-[11px] text-[#8A8078]">{item.instructions}</p> : null}
                      <p className="mt-2 text-[10px] font-medium text-[#C9727E]">Open details &amp; edit</p>
                    </summary>
                    <div className="border-t border-[#F7EEED] p-3.5">
                      <form action={updateSupplementAction.bind(null, item.id)} className="grid gap-2 sm:grid-cols-2">
                        <input name="name" required defaultValue={item.name} className={fieldClass} />
                        <input name="dosage" defaultValue={item.dosage ?? ''} placeholder="Dosage" className={fieldClass} />
                        <input name="frequency" defaultValue={item.frequency ?? ''} placeholder="Frequency" className={fieldClass} />
                        <input name="timeOfDay" defaultValue={item.timeOfDay ?? ''} placeholder="Time of day" className={fieldClass} />
                        <input name="startedAt" type="date" defaultValue={dateInput(item.startedAt)} className={fieldClass} />
                        <input name="instructions" defaultValue={item.instructions ?? ''} placeholder="Instructions" className={fieldClass} />
                        <textarea name="notes" rows={2} defaultValue={item.notes ?? ''} placeholder="Notes" className={`${fieldClass} sm:col-span-2`} />
                        <button type="submit" className="w-fit rounded-full bg-[#2B2420] px-4 py-2 text-[11px] font-medium text-white">Save changes</button>
                      </form>
                      <form action={setSupplementActiveAction.bind(null, item.id, !item.active)} className="mt-2">
                        <button type="submit" className="text-[10.5px] font-medium text-[#C9727E] underline-offset-4 hover:underline">Mark {item.active ? 'inactive' : 'active'}</button>
                      </form>
                    </div>
                  </details>
                );
              })}
            </div>
          </Card>
        </div>

        <WellnessEntryManager initialEntries={entries} />
      </div>
    </AppShell>
  );
}
