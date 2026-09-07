import { MASTER_BEAUTY_INVENTORY } from '@/lib/beauty/skincare-master';
import { getBeautyRoutinesByUser } from '@/lib/data/beauty-routines';

const FACIAL_ROUTINE_MATCH = /gua\s*sha|facial\s*massage|face\s*massage|facial\s*movement|lymphatic|face\s*yoga|jaw|cheek|neck\s*release/i;

export type GuaShaSavedStep = {
  id: string;
  name: string;
  notes: string | null;
  products: string[];
  stepOrder: number;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night' | 'anytime';
  source: string | null;
};

export type GuaShaOwnedTool = {
  name: string;
  status: 'confirmed' | 'backup' | 'needs-confirmation' | 'needs-identification';
  quantity: number;
  notes: string | null;
};

export async function getGuaShaStudioData(userId: string) {
  const routines = await getBeautyRoutinesByUser(userId);

  const savedRoutineSteps: GuaShaSavedStep[] = routines
    .filter((routine) => FACIAL_ROUTINE_MATCH.test(`${routine.name} ${routine.notes ?? ''}`))
    .map((routine) => ({
      id: routine.id,
      name: routine.name,
      notes: routine.notes ?? null,
      products: routine.products ?? [],
      stepOrder: routine.stepOrder,
      timeOfDay: routine.timeOfDay,
      source: routine.source ?? null,
    }))
    .sort((a, b) => a.stepOrder - b.stepOrder);

  const ownedTools: GuaShaOwnedTool[] = MASTER_BEAUTY_INVENTORY
    .filter((record) => record.category === 'Gua Sha + Massage Tools')
    .map((record) => ({
      name: record.name,
      status: record.status,
      quantity: record.quantity ?? 1,
      notes: record.notes ?? null,
    }));

  const linkedSlipProducts = Array.from(
    new Set(savedRoutineSteps.flatMap((step) => step.products).map((name) => name.trim()).filter(Boolean)),
  );

  return { savedRoutineSteps, ownedTools, linkedSlipProducts };
}
