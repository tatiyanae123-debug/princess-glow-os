import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { BeautyLabExperience } from '@/components/beauty/beauty-lab-experience';
import { getBeautyProducts } from '@/lib/data/completion-v1';
import { getBeautyRoutinesByUser } from '@/lib/data/beauty-routines';

export const dynamic = 'force-dynamic';

export default async function BeautyLabPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const [products, routines] = await Promise.all([
    getBeautyProducts(session.user.id),
    getBeautyRoutinesByUser(session.user.id),
  ]);

  return (
    <AppShell>
      <BeautyLabExperience products={products} routines={routines} />
    </AppShell>
  );
}
