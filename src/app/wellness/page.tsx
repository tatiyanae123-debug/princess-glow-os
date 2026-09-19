import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { CanonicalDomainRoom } from '@/components/glow/canonical-domain-room';
import { WellnessEntryManager } from '@/components/wellness/wellness-entry-manager';
import { getWellnessEntriesByUser } from '@/lib/data/wellness-entries';
import { getMedicationsByUser, getSupplementsByUser } from '@/lib/data/health-intelligence';
import { createMedicationAction, createSupplementAction, setMedicationActiveAction, setSupplementActiveAction } from '@/app/actions/health-intelligence';

export const dynamic='force-dynamic';
const fieldClass='w-full min-h-11 rounded-[14px] border border-[#d8e2dd] bg-white/55 px-4 py-3 text-[13px] text-[#46524f] outline-none focus:border-[#91aaa4]';

const destinations=[
  {label:'Regulation Studio',href:'/wellness/regulation',cue:'Ground and regulate'},
  {label:'Sleep',href:'/wellness/sleep',cue:'Protect recovery'},
  {label:'Appointments',href:'/wellness/appointments',cue:'Prepare and follow through'},
];

export default async function WellnessPage(){
  const session=await auth();
  if(!session?.user?.id)redirect('/sign-in');
  const [entries,medications,supplements]=await Promise.all([
    getWellnessEntriesByUser(session.user.id),
    getMedicationsByUser(session.user.id),
    getSupplementsByUser(session.user.id),
  ]);
  const activeMeds=medications.filter((item)=>item.active).length;
  const activeSupps=supplements.filter((item)=>item.active).length;

  return (
    <AppShell>
      <CanonicalDomainRoom
        eyebrow="Life · Wellness"
        title="Wellness"
        question="What would support regulation, recovery, sleep, and care right now?"
        climate="wellness"
        destinations={destinations}
        aside={
          <div className="space-y-5">
            <div><small className="text-[11px] uppercase tracking-[.14em] text-[#718b89]">Current records</small><p className="mt-2 text-[28px] font-serif text-[#3f4d4b]">{entries.length}</p><p className="text-[12px] text-[#798784]">wellness check-ins</p></div>
            <div className="border-t border-[#d8e1dc] pt-4"><strong className="block text-[15px] text-[#43504d]">{activeMeds}</strong><span className="text-[12px] text-[#7b8885]">active medication records</span></div>
            <div className="border-t border-[#d8e1dc] pt-4"><strong className="block text-[15px] text-[#43504d]">{activeSupps}</strong><span className="text-[12px] text-[#7b8885]">active supplement records</span></div>
          </div>
        }
      >
        <div className="space-y-10">
          <section>
            <p className="text-[11px] uppercase tracking-[.16em] text-[#718b89]">Wellness log</p>
            <h2 className="mt-2 font-serif text-[28px] text-[#3e4b48]">Body signals over time</h2>
            <div className="mt-5"><WellnessEntryManager initialEntries={entries}/></div>
          </section>

          <section className="border-t border-[#dbe4df] pt-8">
            <div className="mb-5"><p className="text-[11px] uppercase tracking-[.16em] text-[#718b89]">Medication shelf</p><h2 className="mt-2 font-serif text-[26px] text-[#3e4b48]">Medication record</h2><p className="mt-2 max-w-2xl text-[13px] leading-6 text-[#788480]">A private organizer for what you take. Glow OS records what you enter and does not change doses or prescribe treatment.</p></div>
            <form action={createMedicationAction} className="grid gap-3 sm:grid-cols-2">
              <input name="name" required placeholder="Medication name" className={fieldClass}/><input name="dosage" placeholder="Dosage" className={fieldClass}/>
              <input name="frequency" placeholder="Frequency" className={fieldClass}/><input name="timeOfDay" placeholder="Time of day" className={fieldClass}/>
              <input name="prescriber" placeholder="Prescriber" className={fieldClass}/><input name="startedAt" type="date" className={fieldClass}/>
              <input name="instructions" placeholder="Instructions" className={`${fieldClass} sm:col-span-2`}/><textarea name="notes" rows={2} placeholder="Notes" className={`${fieldClass} sm:col-span-2`}/>
              <button type="submit" className="min-h-11 w-fit rounded-full bg-[#52635f] px-5 text-[13px] font-medium text-white">Add medication</button>
            </form>
            <div className="mt-6 divide-y divide-[#dce4df]">
              {medications.length===0?<p className="py-4 text-[13px] text-[#7f8a86]">No medication records are saved.</p>:medications.map((item)=><article key={item.id} className="flex flex-wrap items-start justify-between gap-4 py-4"><div><strong className="text-[15px] text-[#46524f]">{item.name}</strong><p className="mt-1 text-[12px] text-[#7b8783]">{[item.dosage,item.frequency,item.timeOfDay].filter(Boolean).join(' · ')||'No schedule details yet'}</p>{item.instructions?<p className="mt-2 text-[12px] text-[#74817d]">{item.instructions}</p>:null}</div><form action={setMedicationActiveAction.bind(null,item.id,!item.active)}><button type="submit" className="min-h-11 rounded-full border border-[#cfdad5] px-4 text-[12px] text-[#60716c]">{item.active?'Active · mark inactive':'Inactive · mark active'}</button></form></article>)}
            </div>
          </section>

          <section className="border-t border-[#dbe4df] pt-8">
            <div className="mb-5"><p className="text-[11px] uppercase tracking-[.16em] text-[#718b89]">Supplement shelf</p><h2 className="mt-2 font-serif text-[26px] text-[#3e4b48]">Supplement routine</h2></div>
            <form action={createSupplementAction} className="grid gap-3 sm:grid-cols-2">
              <input name="name" required placeholder="Supplement name" className={fieldClass}/><input name="dosage" placeholder="Dosage" className={fieldClass}/>
              <input name="frequency" placeholder="Frequency" className={fieldClass}/><input name="timeOfDay" placeholder="Time of day" className={fieldClass}/>
              <input name="startedAt" type="date" className={fieldClass}/><input name="instructions" placeholder="Instructions" className={fieldClass}/>
              <textarea name="notes" rows={2} placeholder="Notes" className={`${fieldClass} sm:col-span-2`}/>
              <button type="submit" className="min-h-11 w-fit rounded-full bg-[#52635f] px-5 text-[13px] font-medium text-white">Add supplement</button>
            </form>
            <div className="mt-6 divide-y divide-[#dce4df]">
              {supplements.length===0?<p className="py-4 text-[13px] text-[#7f8a86]">No supplement records are saved.</p>:supplements.map((item)=><article key={item.id} className="flex flex-wrap items-start justify-between gap-4 py-4"><div><strong className="text-[15px] text-[#46524f]">{item.name}</strong><p className="mt-1 text-[12px] text-[#7b8783]">{[item.dosage,item.frequency,item.timeOfDay].filter(Boolean).join(' · ')||'No schedule details yet'}</p></div><form action={setSupplementActiveAction.bind(null,item.id,!item.active)}><button type="submit" className="min-h-11 rounded-full border border-[#cfdad5] px-4 text-[12px] text-[#60716c]">{item.active?'Active · mark inactive':'Inactive · mark active'}</button></form></article>)}
            </div>
          </section>
        </div>
      </CanonicalDomainRoom>
    </AppShell>
  );
}
