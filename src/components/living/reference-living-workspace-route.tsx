import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { ReferenceLivingWorkspace, type LivingWorkspaceId } from './reference-living-workspace';

export async function ReferenceLivingWorkspaceRoute({ workspace }: { workspace: LivingWorkspaceId }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  return (
    <ReferenceLivingWorkspace
      workspace={workspace}
      userName={session.user.name ?? null}
    />
  );
}
