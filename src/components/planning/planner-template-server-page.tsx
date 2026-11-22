import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { PlannerTemplatesV1 } from '@/components/planning/planner-templates-v1';
import { getPlannerTemplateDocuments } from '@/lib/data/planner-templates-v1';
import type { PlannerRouteView } from '@/lib/planning/planner-templates-v1';

export async function PlannerTemplateServerPage({
  routeView,
  initialKey,
}: {
  routeView: PlannerRouteView;
  initialKey?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const documents = await getPlannerTemplateDocuments(session.user.id);
  return <PlannerTemplatesV1 routeView={routeView} initialDocuments={documents} initialKey={initialKey} />;
}
