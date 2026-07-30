import { Card } from '@/components/ui/card';

export function HabitCard({ name, progress, streak, note }: { name: string; progress: number; streak: number; note: string }) {
  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{name}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{note}</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
          {streak} day streak
        </span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
        <div className="h-2 rounded-full bg-gradient-to-r from-rose-400 to-amber-400" style={{ width: `${progress}%` }} />
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400">{progress}% complete today</p>
    </Card>
  );
}
