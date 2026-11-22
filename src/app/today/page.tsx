import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { TodayContextWorlds } from '@/components/today/today-context-worlds';
import { TodayExperienceFamily } from '@/components/today/today-experience-family';

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

  // Today is one living day. Morning, What Now, Focus, Event, Next Up, Later,
  // Tonight, Tomorrow, Replan and Day View are projections of the same shared
  // personal context and canonical Glow object identities. Context worlds remain
  // distinct lenses while the global Glow Current stays mounted at the app root.
  if (room && CONTEXT_ROOMS.has(room)) return <TodayContextWorlds />;
  return <TodayExperienceFamily />;
}
