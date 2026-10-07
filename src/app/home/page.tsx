import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { LivingDashboard } from '@/components/home/living-dashboard';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  return <LivingDashboard />;
}
