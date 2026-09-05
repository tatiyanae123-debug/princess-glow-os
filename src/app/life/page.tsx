import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { LifePersonalHouse } from '@/components/life/life-personal-house';

export const dynamic = 'force-dynamic';

export default async function LifePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  return <LifePersonalHouse />;
}
