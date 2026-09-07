import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getGuaShaStudioData } from '@/lib/beauty/gua-sha-studio-data';
import { GuaShaReferenceStudioV2, type GuaShaStudioView } from './gua-sha-reference-studio-v2';

export async function GuaShaStudioPage({ view }: { view: GuaShaStudioView }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const data = await getGuaShaStudioData(session.user.id);

  return (
    <GuaShaReferenceStudioV2
      view={view}
      savedRoutineSteps={data.savedRoutineSteps}
      ownedTools={data.ownedTools}
      linkedSlipProducts={data.linkedSlipProducts}
      userName={session.user.name}
      userImage={session.user.image}
    />
  );
}
