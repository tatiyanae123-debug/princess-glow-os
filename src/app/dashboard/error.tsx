'use client';

import { useEffect } from 'react';
import { AppShell } from '@/components/app-shell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <AppShell>
      <Card className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-500">Dashboard error</p>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">We hit an issue loading this dashboard.</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">Please try again. If this continues, check your database configuration.</p>
        <Button type="button" onClick={reset}>
          Try again
        </Button>
      </Card>
    </AppShell>
  );
}
