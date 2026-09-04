import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { MorningBriefReference } from '@/components/today/morning-brief-reference';
import { TodayLivingCenter } from '@/components/today/today-living-center';

export const dynamic = 'force-dynamic';

export default async function TodayPage() {
  // Preview deployments open directly for visual QA.
  // Production keeps the existing authentication gate.
  if (process.env.VERCEL_ENV !== 'preview') {
    const session = await auth();
    if (!session?.user?.id) redirect('/sign-in');
  }

  // Glow Current now lives underneath the interaction model.
  // Visible controls stay simple and direct: press a destination and the
  // existing room transition carries context forward. Advanced gestures are
  // optional enhancements and are not mounted as required navigation.
  return (
    <>
      <TodayLivingCenter />
      <MorningBriefReference />
    </>
  );
}
