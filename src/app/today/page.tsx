import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { MorningBriefReference } from '@/components/today/morning-brief-reference';
import { TodayContextWorlds } from '@/components/today/today-context-worlds';
import { TodayLiveRooms } from '@/components/today/today-live-rooms';
import { TodayNavigationAuthority } from '@/components/today/today-navigation-authority';
import { WhatNowReference } from '@/components/today/what-now-reference';

export const dynamic = 'force-dynamic';

export default async function TodayPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  // One navigation authority. One set of live room renderers.
  // The old TodayLivingCenter sample room is intentionally not mounted: it
  // contained reference-only names, meetings, files, meals, medications, and
  // schedules that must never be presented as the user's real life.
  return (
    <>
      <MorningBriefReference />
      <WhatNowReference />
      <TodayContextWorlds />
      <TodayLiveRooms />
      <TodayNavigationAuthority />
    </>
  );
}
