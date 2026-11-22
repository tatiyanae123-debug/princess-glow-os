import { PlannerTemplateServerPage } from '@/components/planning/planner-template-server-page';

export const dynamic = 'force-dynamic';

export default async function TomorrowPlannerPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const query = await searchParams;
  const initialKey = typeof query.key === 'string' && query.key.length <= 40 ? query.key : undefined;
  return <PlannerTemplateServerPage routeView="tomorrow" initialKey={initialKey} />;
}
