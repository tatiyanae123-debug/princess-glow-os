import { ReferenceLivingWorkspaceRoute } from '@/components/living/reference-living-workspace-route';

export const dynamic = 'force-dynamic';

export default async function Page() {
  return <ReferenceLivingWorkspaceRoute workspace="midday-reset" />;
}
