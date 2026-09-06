import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { MorningBriefReference } from '@/components/today/morning-brief-reference';
import { TodayContextWorlds } from '@/components/today/today-context-worlds';
import { TodayReferenceV2 } from '@/components/today/today-reference-v2';

export const dynamic = 'force-dynamic';

type TodayPageProps = {
  searchParams: Promise<{ room?: string | string[] }>;
};

const CONTEXT_ROOMS = new Set(['people', 'places', 'resources', 'journey']);

export default async function TodayPage({ searchParams }: TodayPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const params = await searchParams;
  const room = Array.isArray(params.room) ? params.room[0] : params.room;

  // The app-root Glow Current is the only navigation authority. Today now has
  // one reference-matched renderer for its nine core rooms, so Focus/What Now
  // cannot be mounted twice and room changes no longer require hard reloads.
  if (room === 'morning') return <MorningBriefReference />;
  if (room && CONTEXT_ROOMS.has(room)) return <TodayContextWorlds />;
  return <TodayReferenceV2 />;
}
