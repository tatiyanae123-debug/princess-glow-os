import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { RoutineManager } from '@/components/routines/routine-manager';
import { RitualLibraryExperience } from '@/components/routines/ritual-library-experience';
import { getRoutinesByUser } from '@/lib/data/routines';

export const dynamic = 'force-dynamic';

export default async function RoutinesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const routines = await getRoutinesByUser(session.user.id);

  return (
    <AppShell>
      <RitualLibraryExperience />
      <section className="mt-5 rounded-[20px] border border-[#e6d9d1] bg-[#fffaf6]/58 p-3 shadow-[0_14px_45px_rgba(83,59,50,.045)] sm:p-5">
        <div className="mb-4 border-b border-[#eee2db] pb-4">
          <p className="text-[8px] font-bold uppercase tracking-[.18em] text-[#9c6d72]">Your editable ritual collection</p>
          <p className="glow-display mt-1 text-[23px] text-[#40332f]">Routine Library</p>
          <p className="mt-1 text-[9px] leading-5 text-[#826e67]">Create, edit, reorder and maintain the real routines that power the guided Ritual Library above.</p>
        </div>
        <RoutineManager initialRoutines={routines} />
      </section>
    </AppShell>
  );
}
