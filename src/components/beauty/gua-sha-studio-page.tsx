import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getGuaShaStudioData } from '@/lib/beauty/gua-sha-studio-data';
import { GuaShaReferenceStudioV5, type GuaShaReferenceView } from './gua-sha-reference-studio-v5';

export async function GuaShaStudioPage({ view }: { view: GuaShaReferenceView }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const data = await getGuaShaStudioData(session.user.id);

  return (
    <GuaShaReferenceStudioV5
      view={view}
      savedRoutineSteps={data.savedRoutineSteps}
      ownedTools={data.ownedTools}
      linkedSlipProducts={data.linkedSlipProducts}
      recentSessions={data.recentSessions}
      favoriteRoutineSlugs={data.favoriteRoutineSlugs}
      userName={session.user.name}
      userImage={session.user.image}
    />
  );
}
