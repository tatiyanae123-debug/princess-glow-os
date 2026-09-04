import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { TodayLivingCenter } from '@/components/today/today-living-center';

export const dynamic = 'force-dynamic';

export default async function TodayPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  return <TodayLivingCenter />;
}
