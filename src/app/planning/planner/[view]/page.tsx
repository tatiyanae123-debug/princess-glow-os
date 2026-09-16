import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { PlannerTemplatesV1 } from '@/components/planning/planner-templates-v1';
import { getPlannerTemplateDocuments } from '@/lib/data/planner-templates-v1';
import { isPlannerRouteView } from '@/lib/planning/planner-templates-v1';

export const dynamic = 'force-dynamic';

export default async function PlannerTemplatePage({
  params,
  searchParams,
}: {
  params: Promise<{ view: string }>;
  searchParams: Promise<{ key?: string }>;
}) {
  const [{ view }, query] = await Promise.all([params, searchParams]);
  if (!isPlannerRouteView(view)) notFound();

  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const documents = await getPlannerTemplateDocuments(session.user.id);
  const initialKey = typeof query.key === 'string' && query.key.length <= 40 ? query.key : undefined;

  return <PlannerTemplatesV1 routeView={view} initialDocuments={documents} initialKey={initialKey} />;
}
