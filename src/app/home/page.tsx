import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { GlowThresholdReference } from '@/components/home/glow-threshold-reference';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  return <><GlowThresholdReference /><a href="/life-studio" style={{ position: 'fixed', right: 18, bottom: 22, zIndex: 1000, padding: '12px 18px', borderRadius: 999, background: '#292929', color: '#F7F6F2', fontSize: 12, boxShadow: '0 8px 30px #0002', textDecoration: 'none' }}>Life Studio 2.0 ↗</a></>;
}
