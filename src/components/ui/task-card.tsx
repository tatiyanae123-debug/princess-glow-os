import { Card } from '@/components/ui/card';

export function TaskCard({ title, note, priority, time }: { title: string; note: string; priority: string; time: string }) {
  return (
    <Card className="flex items-start justify-between gap-3">
      <div>
        <p className="font-semibold text-slate-900 dark:text-slate-100">{title}</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{note}</p>
      </div>
      <div className="text-right text-sm">
        <p className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{priority}</p>
        <p className="mt-2 text-slate-400">{time}</p>
      </div>
    </Card>
  );
}
