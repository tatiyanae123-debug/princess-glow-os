import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { CanonicalDomainRoom } from '@/components/glow/canonical-domain-room';
import { FoodRoom } from '@/components/food/food-room';

export const dynamic = 'force-dynamic';

const destinations = [
  { label: 'Meal Plan', href: '/food/meal-plan', cue: 'Shape the week' },
  { label: 'Recipes', href: '/food/recipes', cue: 'Cook from what exists' },
  { label: 'Groceries', href: '/food/groceries', cue: 'Buy with purpose' },
  { label: 'Pantry', href: '/food/pantry', cue: 'Use what is owned' },
  { label: 'Meal Prep', href: '/food/meal-prep', cue: 'Prepare in parallel' },
];

export default async function FoodPage(){
  const session=await auth();
  if(!session?.user?.id) redirect('/sign-in');
  return (
    <AppShell>
      <CanonicalDomainRoom
        eyebrow="Life · Food"
        title="The Nourishment Kitchen"
        question="What do I need to eat, make, use, or prepare next?"
        climate="food"
        destinations={destinations}
      >
        <FoodRoom/>
      </CanonicalDomainRoom>
    </AppShell>
  );
}
