import { redirect } from 'next/navigation';

export default function LegacyDashboardPage() {
  redirect('/today?room=what-now');
}
