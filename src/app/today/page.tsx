import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { MorningBriefReference } from '@/components/today/morning-brief-reference';
import { TodayContextWorlds } from '@/components/today/today-context-worlds';
import { TodayReferenceRooms } from '@/components/today/today-reference-rooms';
import { WhatNowReference } from '@/components/today/what-now-reference';

export const dynamic = 'force-dynamic';

export default async function TodayPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  // Today contributes room architecture only. The app-root Glow Current owns
  // the permanent frame, orientation, Return Anchor, Shakti, world movement,
  // action host and path memory so every Today state stays in the same OS.
  return (
    <>
      <MorningBriefReference />
      <WhatNowReference />
      <TodayContextWorlds />
      <TodayReferenceRooms />
    </>
  );
}
