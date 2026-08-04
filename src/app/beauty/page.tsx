import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { BeautyRoutineManager } from '@/components/beauty/beauty-routine-manager';
import { getBeautyRoutinesByUser } from '@/lib/data/beauty-routines';

export const dynamic = 'force-dynamic';

export default async function BeautyPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const routines = await getBeautyRoutinesByUser(session.user.id);

  return (
    <AppShell>
      <SectionPage eyebrow="Beauty" title="Care that feels luxurious" description="Treat beauty as an intentional ritual rather than an afterthought.">
        <BeautyRoutineManager initialRoutines={routines} />
      </SectionPage>
    </AppShell>
  );
}
