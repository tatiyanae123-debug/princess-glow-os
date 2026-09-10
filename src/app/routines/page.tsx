import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { RitualLibraryExperience } from '@/components/routines/ritual-library-experience';

export const dynamic = 'force-dynamic';

export default async function RoutinesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  return (
    <AppShell>
      <RitualLibraryExperience />
    </AppShell>
  );
}
