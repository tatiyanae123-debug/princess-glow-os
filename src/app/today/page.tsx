import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { MorningBriefReference } from '@/components/today/morning-brief-reference';
import { TodayLivingCenter } from '@/components/today/today-living-center';
import { GlowCurrentTodayShell } from '@/components/today/glow-current-today-shell';

export const dynamic = 'force-dynamic';

export default async function TodayPage() {
  if (process.env.VERCEL_ENV !== 'preview') {
    const session = await auth();
    if (!session?.user?.id) redirect('/sign-in');
  }

  return (
    <GlowCurrentTodayShell>
      <TodayLivingCenter />
      <MorningBriefReference />
    </GlowCurrentTodayShell>
  );
}
