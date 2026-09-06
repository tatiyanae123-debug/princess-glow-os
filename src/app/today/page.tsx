import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { MorningBriefReference } from '@/components/today/morning-brief-reference';
import { TodayContextWorlds } from '@/components/today/today-context-worlds';
import { TodayNavigationAuthority } from '@/components/today/today-navigation-authority';
import { TodayReferenceRooms } from '@/components/today/today-reference-rooms';
import { WhatNowReference } from '@/components/today/what-now-reference';

export const dynamic = 'force-dynamic';

export default async function TodayPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  // Today uses one navigation authority and reference-driven room architecture.
  // Morning Brief and What Now keep their locked reference renderers. The rest
  // of the Today depth system is handled by TodayReferenceRooms so Focus,
  // Event Detail, Next Up, Later, Tonight, Tomorrow Preview, Replan My Day,
  // and Day View no longer fall back to the older generic live-room shell.
  return (
    <>
      <MorningBriefReference />
      <WhatNowReference />
      <TodayContextWorlds />
      <TodayReferenceRooms />
      <TodayNavigationAuthority />
    </>
  );
}
