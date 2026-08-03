import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import { getAppointmentsByUser } from '@/lib/data/appointments';
import { getImportantLinksByUser } from '@/lib/data/important-links';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const [appointments, links] = await Promise.all([
    getAppointmentsByUser(session.user.id),
    getImportantLinksByUser(session.user.id),
  ]);

  return (
    <AppShell>
      <SectionPage eyebrow="Home" title="A place that supports your rhythm" description="Turn your home life into a calm, welcoming system that feels effortless to maintain.">
        <Card className="grid gap-3 md:grid-cols-2">
          <div className="rounded-[20px] border border-slate-200/70 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
            <p className="font-medium text-slate-900 dark:text-slate-100">Upcoming appointments</p>
            {appointments.length === 0 ? (
              <p className="mt-2 text-sm text-slate-400 dark:text-slate-500">No appointments scheduled.</p>
            ) : (
              <div className="mt-2 space-y-2">
                {appointments.slice(0, 3).map((appt) => (
                  <div key={appt.id} className="rounded-xl bg-white px-3 py-2 shadow-sm dark:bg-slate-900">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{appt.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {appt.startAt.toLocaleString('en', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      {appt.location ? ` · ${appt.location}` : ''}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="rounded-[20px] border border-slate-200/70 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
            <p className="font-medium text-slate-900 dark:text-slate-100">Important links</p>
            {links.length === 0 ? (
              <p className="mt-2 text-sm text-slate-400 dark:text-slate-500">No saved links yet.</p>
            ) : (
              <div className="mt-2 space-y-2">
                {links.slice(0, 5).map((link) => (
                  <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="block rounded-xl bg-white px-3 py-2 text-sm font-medium text-rose-600 shadow-sm hover:underline dark:bg-slate-900 dark:text-rose-400">
                    {link.title}
                  </a>
                ))}
              </div>
            )}
          </div>
        </Card>
      </SectionPage>
    </AppShell>
  );
}
