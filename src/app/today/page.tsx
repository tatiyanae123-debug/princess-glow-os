import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { MorningBriefReference } from '@/components/today/morning-brief-reference';
import { TodayLivingCenter } from '@/components/today/today-living-center';
import { TodaySimpleChrome } from '@/components/today/today-simple-chrome';
import { WhatNowReference } from '@/components/today/what-now-reference';

export const dynamic = 'force-dynamic';

export default async function TodayPage() {
  // Preview deployments open directly for visual QA.
  // Production keeps the existing authentication gate.
  if (process.env.VERCEL_ENV !== 'preview') {
    const session = await auth();
    if (!session?.user?.id) redirect('/sign-in');
  }

  // Glow Current lives underneath the interaction model.
  // Locked visual references remain the source of truth for each Today room.
  return (
    <>
      <TodayLivingCenter />
      <MorningBriefReference />
      <WhatNowReference />
      <TodaySimpleChrome />
    </>
  );
}
