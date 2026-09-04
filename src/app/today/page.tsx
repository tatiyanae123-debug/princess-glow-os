import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { MorningBriefReference } from '@/components/today/morning-brief-reference';
import { TodayLivingCenter } from '@/components/today/today-living-center';

export const dynamic = 'force-dynamic';

export default async function TodayPage() {
  // Preview deployments for visual QA should open the Living Center directly.
  // Production keeps the existing authentication gate.
  if (process.env.VERCEL_ENV !== 'preview') {
    const session = await auth();
    if (!session?.user?.id) redirect('/sign-in');
  }

  return (
    <>
      <TodayLivingCenter />
      <MorningBriefReference />
    </>
  );
}
