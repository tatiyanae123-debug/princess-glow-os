import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';

const rooms = [
  ['Home', '/home', 'Your environment, resets, and household systems.'],
  ['Mind', '/brain', 'Context, recommendations, memory, and reflection.'],
  ['Fitness', '/wellness', 'Movement, recovery, and future gym intelligence.'],
  ['Beauty', '/beauty', 'Beauty routines and future product laboratory.'],
  ['Learning', '/notes', 'Notes, reading, school, and knowledge.'],
  ['Finance', '/finance', 'Spending, savings, and future forecasting.'],
  ['Travel', '/calendar', 'Trips, plans, and future world map.'],
  ['Saint', '/tasks', 'Care tasks and future Saint room.'],
  ['Career', '/projects', 'Career moves, applications, and work projects.'],
  ['Creativity', '/projects', 'Terrain Design, brands, content, and Creative Studio.'],
] as const;

export const dynamic = 'force-dynamic';

export default async function WorldPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  return (
    <AppShell>
      <SectionPage eyebrow="Life World" title="Walk through the systems of your life" description="This lightweight room map is the foundation for the future immersive world. No 3D dependencies are loaded yet.">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rooms.map(([title, href, description]) => (
            <Link key={title} href={href} className="group rounded-[28px] border border-slate-200 bg-white/80 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-950/70">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Room</p>
              <h2 className="mt-3 text-xl font-semibold">{title}</h2>
              <p className="mt-2 text-sm text-slate-500">{description}</p>
              <p className="mt-5 text-sm font-medium">Enter room →</p>
            </Link>
          ))}
        </div>
      </SectionPage>
    </AppShell>
  );
}
