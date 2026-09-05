import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { FacialMassageStudio } from '@/components/beauty/facial-massage-studio';
import { MASTER_BEAUTY_INVENTORY } from '@/lib/beauty/skincare-master';
import { getBeautyRoutinesByUser } from '@/lib/data/beauty-routines';

export const dynamic = 'force-dynamic';

const FACIAL_ROUTINE_MATCH = /gua\s*sha|facial\s*massage|face\s*massage|facial\s*movement|lymphatic|face\s*yoga/i;

export default async function FacialMassagePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const routines = await getBeautyRoutinesByUser(session.user.id);
  const savedRoutineSteps = routines
    .filter((routine) => FACIAL_ROUTINE_MATCH.test(`${routine.name} ${routine.notes ?? ''}`))
    .map((routine) => ({
      id: routine.id,
      name: routine.name,
      notes: routine.notes ?? null,
      products: routine.products ?? [],
      stepOrder: routine.stepOrder,
    }))
    .sort((a, b) => a.stepOrder - b.stepOrder);

  const ownedTools = MASTER_BEAUTY_INVENTORY
    .filter((record) => record.category === 'Gua Sha + Massage Tools')
    .map((record) => ({
      name: record.name,
      status: record.status,
      quantity: record.quantity ?? 1,
      notes: record.notes ?? null,
    }));

  return (
    <FacialMassageStudio
      savedRoutineSteps={savedRoutineSteps}
      ownedTools={ownedTools}
      userName={session.user.name}
    />
  );
}
