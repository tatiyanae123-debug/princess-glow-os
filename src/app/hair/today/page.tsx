import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { HairTodayWorld } from '@/components/hair/hair-studio-world';
import { getHairStudioModel } from '@/lib/hair/hair-studio-data';

export const dynamic = 'force-dynamic';

export default async function HairTodayPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const model = await getHairStudioModel(session.user.id, {
    name: session.user.name,
    image: session.user.image,
  });

  return <HairTodayWorld model={model}/>;
}
