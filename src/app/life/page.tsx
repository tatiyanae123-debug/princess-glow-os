import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { OperatingAreaPage } from '@/components/operating-area-page';

export const dynamic = 'force-dynamic';

export default async function LifePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  return (
    <AppShell>
      <OperatingAreaPage
        eyebrow="LIFE · PERSONAL SYSTEMS"
        title="Your life, arranged into rooms instead of one giant control panel."
        description="Body, Beauty, Home, Money and Work stay deep and powerful, but they now live inside one calm Life area. Each room keeps its full page while the surface remains simple."
        question="Which part of life actually needs attention right now?"
        groups={[
          { id: 'body', title: 'Body', description: 'Wellness, movement, nourishment and essential care.', items: [
            { label: 'Wellness', href: '/wellness', description: 'Energy, mood, sleep, hydration and personal wellness context.', priority: 'essential' },
            { label: 'Fitness', href: '/fitness', description: 'Full workouts, normal movement and recovery alternatives.' },
            { label: 'Food & Nutrition', href: '/food', description: 'Meals, groceries, easy-food options and nutrition planning.', priority: 'essential' },
            { label: 'Medications & Supplements', href: '/maintenance', description: 'Essential medication and supplement routines.', priority: 'essential' },
          ]},
          { id: 'beauty', title: 'Beauty', description: 'Personal care stays expressive without becoming navigational clutter.', items: [
            { label: 'Beauty', href: '/beauty', description: 'Your main beauty routine and maintenance hub.' },
            { label: 'Beauty Lab', href: '/beauty/lab', description: 'Products, experiments, treatments and deeper analysis.', priority: 'bonus' },
            { label: 'Hair', href: '/hair', description: 'Wash days, maintenance, styles and hair planning.' },
            { label: 'Closet', href: '/closet', description: 'Wardrobe, outfit planning and personal style.', priority: 'bonus' },
          ]},
          { id: 'home', title: 'Home', description: 'Keep the environment supportive, not perfect.', items: [
            { label: 'Home', href: '/home', description: 'Household overview, spaces and current home priorities.' },
            { label: 'All Rooms', href: '/all-rooms', description: 'Open deeper household spaces only when you need them.', priority: 'bonus' },
          ]},
          { id: 'money', title: 'Money', description: 'Financial information and intelligence in one calm area.', items: [
            { label: 'Finance', href: '/finance', description: 'Spending, bills, balances and day-to-day money management.', priority: 'essential' },
            { label: 'Financial Brain', href: '/finance/brain', description: 'Patterns, forecasts and higher-level financial intelligence.' },
          ]},
          { id: 'work', title: 'Work', description: 'Career responsibilities and professional direction without mixing them into everything else.', items: [
            { label: 'Work', href: '/work', description: 'Active work, career responsibilities and professional context.' },
            { label: 'Projects', href: '/projects', description: 'Multi-step professional and personal projects.', priority: 'bonus' },
          ]},
        ]}
      />
    </AppShell>
  );
}
