import { CanonicalCatchAllRoute } from '@/components/glow/canonical-catch-all-route';

export const dynamic = 'force-dynamic';

export default async function Page() {
  return CanonicalCatchAllRoute({ base: '/body', segments: [] });
}
