import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { FoodRoom } from '@/components/food/food-room';

export const dynamic = 'force-dynamic';

export default async function FoodPage(){
  const session=await auth();
  if(!session?.user?.id) redirect('/sign-in');
  return <AppShell><SectionPage eyebrow="Food Intelligence" title="The Nourishment Kitchen" description="Plan meals, groceries, pantry, meal prep and food spending as one connected Glow OS workflow."><FoodRoom/></SectionPage></AppShell>;
}
