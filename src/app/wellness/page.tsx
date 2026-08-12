import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { Card } from '@/components/ui/card';
import { HealthCareExperience } from '@/components/wellness/health-care-experience';
import { WellnessEntryManager } from '@/components/wellness/wellness-entry-manager';
import { getWellnessEntriesByUser } from '@/lib/data/wellness-entries';
import { getMedicationsByUser, getSupplementsByUser } from '@/lib/data/health-intelligence';
import { createMedicationAction, createSupplementAction, setMedicationActiveAction, setSupplementActiveAction } from '@/app/actions/health-intelligence';

export const dynamic='force-dynamic';
const fieldClass='w-full border px-4 py-3 text-[10px]';

export default async function WellnessPage(){
  const session=await auth();if(!session?.user?.id)redirect('/sign-in');
  const [entries,medications,supplements]=await Promise.all([getWellnessEntriesByUser(session.user.id),getMedicationsByUser(session.user.id),getSupplementsByUser(session.user.id)]);

  return <AppShell>
    <div className="space-y-6">
      <HealthCareExperience entries={entries} />

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="paper-card space-y-4"><div><p className="glow-eyebrow">Medication shelf</p><h2 className="glow-display mt-1 text-[20px] text-[#43503f]">Medication record</h2><p className="mt-1 text-[8px] leading-4 text-[#7a8574]">A private organizer for what you take. Glow OS does not change doses or prescribe treatment.</p></div><form action={createMedicationAction} className="grid gap-3 sm:grid-cols-2"><input name="name" required placeholder="Medication name" className={fieldClass}/><input name="dosage" placeholder="Dosage" className={fieldClass}/><input name="frequency" placeholder="Frequency" className={fieldClass}/><input name="timeOfDay" placeholder="Time of day" className={fieldClass}/><input name="prescriber" placeholder="Prescriber" className={fieldClass}/><input name="startedAt" type="date" className={fieldClass}/><input name="instructions" placeholder="Instructions" className={`${fieldClass} sm:col-span-2`}/><textarea name="notes" rows={2} placeholder="Notes" className={`${fieldClass} sm:col-span-2`}/><button type="submit" className="w-fit rounded-[6px] bg-[#3f493b] px-4 py-2 text-[9px] font-medium text-white">Add medication</button></form><div className="space-y-2">{medications.length===0?<p className="text-[9px] text-[#7f8a79]">No medications saved yet.</p>:medications.map((item)=><div key={item.id} className="rounded-[7px] border border-[#dde4d8] bg-white/35 p-3"><div className="flex items-start justify-between gap-3"><div><p className="glow-display text-[13px] text-[#485443]">{item.name}</p><p className="mt-1 text-[7px] text-[#7b8675]">{[item.dosage,item.frequency,item.timeOfDay].filter(Boolean).join(' · ')||'No schedule details yet'}</p></div><span className={`rounded-full px-2 py-1 text-[7px] ${item.active?'bg-[#e5eee1] text-[#687864]':'bg-[#eee8e3] text-[#8b7d76]'}`}>{item.active?'Active':'Inactive'}</span></div>{item.instructions?<p className="mt-2 text-[8px] text-[#74806e]">{item.instructions}</p>:null}<form action={setMedicationActiveAction.bind(null,item.id,!item.active)} className="mt-2"><button type="submit" className="text-[7px] font-medium text-[#71806c] underline underline-offset-4">Mark {item.active?'inactive':'active'}</button></form></div>)}</div></Card>

        <Card className="paper-card space-y-4"><div><p className="glow-eyebrow">Supplement shelf</p><h2 className="glow-display mt-1 text-[20px] text-[#43503f]">Supplement routine</h2><p className="mt-1 text-[8px] leading-4 text-[#7a8574]">Track what is in your routine, when you use it, and any notes you want Glow OS to remember.</p></div><form action={createSupplementAction} className="grid gap-3 sm:grid-cols-2"><input name="name" required placeholder="Supplement name" className={fieldClass}/><input name="dosage" placeholder="Dosage" className={fieldClass}/><input name="frequency" placeholder="Frequency" className={fieldClass}/><input name="timeOfDay" placeholder="Time of day" className={fieldClass}/><input name="startedAt" type="date" className={fieldClass}/><input name="instructions" placeholder="Instructions" className={fieldClass}/><textarea name="notes" rows={2} placeholder="Notes" className={`${fieldClass} sm:col-span-2`}/><button type="submit" className="w-fit rounded-[6px] bg-[#3f493b] px-4 py-2 text-[9px] font-medium text-white">Add supplement</button></form><div className="space-y-2">{supplements.length===0?<p className="text-[9px] text-[#7f8a79]">No supplements saved yet.</p>:supplements.map((item)=><div key={item.id} className="rounded-[7px] border border-[#dde4d8] bg-white/35 p-3"><div className="flex items-start justify-between gap-3"><div><p className="glow-display text-[13px] text-[#485443]">{item.name}</p><p className="mt-1 text-[7px] text-[#7b8675]">{[item.dosage,item.frequency,item.timeOfDay].filter(Boolean).join(' · ')||'No schedule details yet'}</p></div><span className={`rounded-full px-2 py-1 text-[7px] ${item.active?'bg-[#e5eee1] text-[#687864]':'bg-[#eee8e3] text-[#8b7d76]'}`}>{item.active?'Active':'Inactive'}</span></div>{item.instructions?<p className="mt-2 text-[8px] text-[#74806e]">{item.instructions}</p>:null}<form action={setSupplementActiveAction.bind(null,item.id,!item.active)} className="mt-2"><button type="submit" className="text-[7px] font-medium text-[#71806c] underline underline-offset-4">Mark {item.active?'inactive':'active'}</button></form></div>)}</div></Card>
      </div>

      <WellnessEntryManager initialEntries={entries}/>
    </div>
  </AppShell>;
}
