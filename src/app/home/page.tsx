import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { GlowHomeDashboard } from '@/components/home/glow-home-dashboard';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  return <GlowHomeDashboard />;
}
