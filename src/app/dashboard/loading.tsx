import { AppShell } from '@/components/app-shell';
import { Card } from '@/components/ui/card';

export default function DashboardLoading() {
  return (
    <AppShell>
      <div className="space-y-4">
        <Card className="h-32 animate-pulse bg-slate-100 dark:bg-slate-800">
          <span className="sr-only">Loading header</span>
        </Card>
        <Card className="h-28 animate-pulse bg-slate-100 dark:bg-slate-800">
          <span className="sr-only">Loading widget</span>
        </Card>
        <Card className="h-28 animate-pulse bg-slate-100 dark:bg-slate-800">
          <span className="sr-only">Loading widget</span>
        </Card>
      </div>
    </AppShell>
  );
}
