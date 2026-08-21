import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { MakeupStudio } from '@/components/beauty/makeup-studio';

export const dynamic='force-dynamic';

export default async function MakeupPage(){
 const session=await auth();
 if(!session?.user?.id)redirect('/sign-in');
 return <AppShell><MakeupStudio/></AppShell>;
}
