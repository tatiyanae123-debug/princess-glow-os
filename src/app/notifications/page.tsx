import { CanonicalCatchAllRoute } from '@/components/glow/canonical-catch-all-route';

export default async function NotificationsPage() {
  return CanonicalCatchAllRoute({ base: '/notifications', segments: [] });
}
