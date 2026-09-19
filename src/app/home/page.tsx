import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { GlowThresholdReference } from '@/components/home/glow-threshold-reference';
import type { HomeIntelligence } from '@/components/home/glow-threshold-reference';
import { getAdaptiveState } from '@/lib/intelligence/adaptive-os';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  let intelligence: HomeIntelligence = null;

  try {
    const state = await getAdaptiveState(session.user.id);
    intelligence = {
      mode: state.activeMode
        ? {
            name: state.activeMode.name,
            slug: state.activeMode.slug,
            maxMajorTasks: state.activeMode.maxMajorTasks,
            energyTarget: state.activeMode.energyTarget,
          }
        : null,
      availableMinutes: state.now.availableMinutes,
      primary: state.now.primary,
      alternatives: state.now.alternatives,
      inboxCount: state.inboxCount,
      maintenance: state.maintenance.map((item) => ({
        id: item.id,
        domain: item.domain,
        title: item.title,
        dueAt: item.dueAt?.toISOString() ?? null,
        urgency: item.urgency,
        recommendation: item.recommendation,
      })),
      systemHealth: state.systemHealth,
    };
  } catch {
    intelligence = null;
  }

  return <GlowThresholdReference intelligence={intelligence} />;
}
