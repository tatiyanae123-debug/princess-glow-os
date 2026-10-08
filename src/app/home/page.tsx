import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getLivingDashboardData } from '@/lib/dashboard/living-dashboard';
import { LivingDashboard } from '@/components/dashboard/living-dashboard';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  try {
    const data = await getLivingDashboardData(session.user.id);
    return <LivingDashboard data={data} userName={session.user.name} />;
  } catch (error) {
    console.error('Glow dashboard failed to load live data', error);
    const data = await getLivingDashboardData(session.user.id);
    return <LivingDashboard data={data} error="Live data is reconnecting." userName={session.user.name} />;
  }
}
