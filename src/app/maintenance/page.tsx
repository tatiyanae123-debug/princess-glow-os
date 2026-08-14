import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function MedicationsRoute({ searchParams }: { searchParams: Promise<{ medicationId?: string; supplementId?: string }> }) {
  const { medicationId, supplementId } = await searchParams;
  if (medicationId) redirect(`/wellness?medicationId=${encodeURIComponent(medicationId)}#medications-supplements`);
  if (supplementId) redirect(`/wellness?supplementId=${encodeURIComponent(supplementId)}#medications-supplements`);
  redirect('/wellness#medications-supplements');
}
