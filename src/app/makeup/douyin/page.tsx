import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { DouyinLookStudio } from '@/components/beauty/douyin-look-studio';
import { getBeautyProducts } from '@/lib/data/completion-v1';

export const dynamic='force-dynamic';

export default async function DouyinLookPage(){
 const session=await auth();
 if(!session?.user?.id)redirect('/sign-in');
 const products=await getBeautyProducts(session.user.id);
 return <AppShell><DouyinLookStudio products={products}/></AppShell>;
}
