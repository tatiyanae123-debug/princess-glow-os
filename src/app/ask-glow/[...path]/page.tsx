import { CanonicalCatchAllRoute } from '@/components/glow/canonical-catch-all-route';

export default async function CanonicalAskglowRoute({ params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return CanonicalCatchAllRoute({ base: '/ask-glow', segments: path });
}
