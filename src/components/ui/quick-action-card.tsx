import type { ElementType } from 'react';
import { Card } from '@/components/ui/card';

export function QuickActionCard({ title, description, icon: Icon }: { title: string; description: string; icon: ElementType }) {
  return (
    <Card className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-400 dark:bg-rose-500/10 dark:text-rose-300">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>
    </Card>
  );
}
