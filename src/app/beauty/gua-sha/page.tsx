import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { GuaShaExperience } from '@/components/beauty/gua-sha-experience';

export const dynamic = 'force-dynamic';

export default async function GuaShaPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  return (
    <AppShell>
      <GuaShaExperience />
    </AppShell>
  );
}
