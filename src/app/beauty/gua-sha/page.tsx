import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { GuaShaStudio } from '@/components/beauty/gua-sha-studio';
import { GuaShaSourceVault } from '@/components/beauty/gua-sha-source-vault';

export const dynamic = 'force-dynamic';

export default async function GuaShaPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  return (
    <AppShell>
      <div className="space-y-6">
        <GuaShaStudio />
        <GuaShaSourceVault />
      </div>
    </AppShell>
  );
}
