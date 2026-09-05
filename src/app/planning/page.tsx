import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { GlowPlanWorld } from '@/components/planning/glow-plan-world';

export const dynamic = 'force-dynamic';

export default async function PlanningPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  return <GlowPlanWorld />;
}
