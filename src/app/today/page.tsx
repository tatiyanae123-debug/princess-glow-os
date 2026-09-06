import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { MorningBriefReference } from '@/components/today/morning-brief-reference';
import { TodayContextWorlds } from '@/components/today/today-context-worlds';
import { TodayLiveRooms } from '@/components/today/today-live-rooms';
import { WhatNowReference } from '@/components/today/what-now-reference';

export const dynamic = 'force-dynamic';

export default async function TodayPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  // Today contributes rooms only. The app-root Glow Current owns the permanent
  // shell, orientation, Shakti, return behavior, world movement and path memory.
  return (
    <>
      <MorningBriefReference />
      <WhatNowReference />
      <TodayContextWorlds />
      <TodayLiveRooms />
    </>
  );
}
