import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getLivingDashboardData } from '@/lib/dashboard/living-dashboard';
import { LivingDashboard } from '@/components/dashboard/living-dashboard';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  try {
    const data = await getLivingDashboardData(session.user.id);
    return <LivingDashboard data={data} userName={session.user.name} />;
  } catch (error) {
    console.error('Glow dashboard live data unavailable', error);
    return (
      <main className="min-h-screen bg-[#fbf7f1] px-5 py-16 text-[#3c3435]">
        <section className="mx-auto max-w-xl rounded-3xl border border-[#e9deda] bg-white p-8 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-[#9b797e]">Glow OS · Connection status</p>
          <h1 className="mt-4 text-3xl font-medium">Your dashboard is temporarily unavailable</h1>
          <p className="mt-4 text-sm leading-7 text-[#685c5e]">
            You're signed in, but Glow couldn't load your connected data. Your information hasn't been deleted.
            You don't need to sign in again or create another account.
          </p>
          <a className="mt-6 inline-flex rounded-full bg-[#473b40] px-5 py-3 text-sm text-white" href="/home">
            Try loading dashboard again
          </a>
        </section>
      </main>
    );
  }
}
