import { TodayScenePage } from '@/components/today/today-scene-page';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  return <TodayScenePage view="home"/>;
}
