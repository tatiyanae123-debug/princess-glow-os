import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { CreateWorld } from '@/components/create/create-world';

export const dynamic='force-dynamic';

export default async function CreatePage(){
  const session=await auth();
  if(!session?.user?.id)redirect('/sign-in');
  return <CreateWorld/>;
}
