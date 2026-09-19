import { CanonicalCatchAllRoute } from '@/components/glow/canonical-catch-all-route';

export default async function CanonicalHomeRoute({ params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return CanonicalCatchAllRoute({ base: '/home', segments: path });
}
