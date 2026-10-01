import { redirect } from 'next/navigation';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

type TodayPageProps = {
  searchParams: Promise<{ room?: string | string[] }>;
};

export default async function TodayPage({ searchParams }: TodayPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const params = await searchParams;
  const room = Array.isArray(params.room) ? params.room[0] : params.room;

  const destination = (() => {
    if (room === 'people') return '/living/people-to-contact';
    if (room === 'replan' || room === 'tomorrow') return '/living/planning-studio';
    if (room === 'meeting' || room === 'later' || room === 'tonight' || room === 'day-view' || room === 'journey') return '/living/day-flow';
    if (room === 'focus' || room === 'next-up' || room === 'what-now' || room === 'morning') return '/living/what-now';
    if (room === 'places' || room === 'resources') return '/life';
    return '/living/what-now';
  })();

  redirect(destination);
}
