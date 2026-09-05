import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { MeetingPeopleAlias } from '@/components/today/meeting-people-alias';
import { MorningBriefReference } from '@/components/today/morning-brief-reference';
import { TodayContextWorlds } from '@/components/today/today-context-worlds';
import { TodayLivingCenter } from '@/components/today/today-living-center';
import { TodayNavigationAuthority } from '@/components/today/today-navigation-authority';
import { WhatNowReference } from '@/components/today/what-now-reference';

export const dynamic = 'force-dynamic';

export default async function TodayPage() {
  // Preview deployments open directly for visual QA.
  // Production keeps the existing authentication gate.
  if (process.env.VERCEL_ENV !== 'preview') {
    const session = await auth();
    if (!session?.user?.id) redirect('/sign-in');
  }

  // There is exactly one navigation authority for every Today environment.
  // Room content and reference surfaces live underneath it and may scroll,
  // transform, or change independently without ever hiding Home / Today / Ask Glow.
  return (
    <>
      <MeetingPeopleAlias />
      <TodayLivingCenter />
      <MorningBriefReference />
      <WhatNowReference />
      <TodayContextWorlds />
      <TodayNavigationAuthority />
    </>
  );
}
