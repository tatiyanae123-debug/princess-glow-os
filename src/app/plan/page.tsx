import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { OperatingAreaPage } from '@/components/operating-area-page';

export const dynamic = 'force-dynamic';

export default async function PlanPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  return (
    <AppShell>
      <OperatingAreaPage
        eyebrow="PLAN · TIME + COMMITMENTS"
        title="Plan without carrying the whole week in your head."
        description="Calendar, tasks, reminders, routines, habits, goals and projects now live in one planning environment. Start with the horizon that matters, then go deeper only when needed."
        question="What needs to happen, and when does it realistically fit?"
        groups={[
          { title: 'Focus views', description: 'Four ways to enter planning without opening every planning database.', items: [
            { label: 'Today', href: '/today', description: 'The smallest actionable view of what matters right now.', priority: 'essential' },
            { label: 'This Week', href: '/planning', description: 'Shape the week around commitments, routines and realistic capacity.', priority: 'normal' },
            { label: 'Upcoming', href: '/calendar', description: 'See future events, deadlines and time pressure in one place.', priority: 'normal' },
            { label: 'Goals', href: '/goals', description: 'Connect this week to longer-term direction without adding pressure.', priority: 'normal' },
          ]},
          { title: 'Planning tools', description: 'Deep tools remain available, but they are children of Plan rather than competing top-level destinations.', items: [
            { label: 'Calendar', href: '/calendar', description: 'Time, events, availability and scheduling.' },
            { label: 'Tasks', href: '/tasks', description: 'Actions, priorities, due dates and task detail.' },
            { label: 'Reminders', href: '/reminders', description: 'Time-sensitive prompts and things that must not be forgotten.' },
            { label: 'Routines', href: '/routines', description: 'Full, standard, minimum and essential routine versions.' },
            { label: 'Habits', href: '/habits', description: 'Capacity-aware habit tracking that can recognize recovery instead of failure.' },
            { label: 'Projects', href: '/projects', description: 'Multi-step work and creative outcomes.', priority: 'bonus' },
          ]},
        ]}
      />
    </AppShell>
  );
}
