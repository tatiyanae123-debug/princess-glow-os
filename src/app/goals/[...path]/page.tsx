import { CanonicalCatchAllRoute } from '@/components/glow/canonical-catch-all-route';

export default async function CanonicalGoalsRoute({ params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return CanonicalCatchAllRoute({ base: '/goals', segments: path });
}
