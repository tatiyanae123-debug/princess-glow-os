import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { MorningTemporalRoom } from '@/components/today/morning-temporal-room';
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

  // Glow Current remains mounted once at the app root. Today rooms contribute
  // temporal/context identity and content without rebuilding global navigation.
  if (room === 'morning') return <MorningTemporalRoom />;
  if (room && CONTEXT_ROOMS.has(room)) return <TodayContextWorlds />;
  return <TodayReferenceV2 />;
}
