import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { GlowCurrentHomeWorld } from '@/components/home/glow-current-home-world';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  if (process.env.VERCEL_ENV !== 'preview') {
    const session = await auth();
    if (!session?.user?.id) redirect('/sign-in');
  }

  return <GlowCurrentHomeWorld />;
}
