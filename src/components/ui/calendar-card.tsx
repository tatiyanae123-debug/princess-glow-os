import { Card } from '@/components/ui/card';

export function CalendarCard({ title, time, location }: { title: string; time: string; location: string }) {
  return (
    <Card className="space-y-2">
      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</p>
      <p className="text-sm text-slate-500 dark:text-slate-400">{time}</p>
      <p className="text-sm text-slate-400">{location}</p>
    </Card>
  );
}
