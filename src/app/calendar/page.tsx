import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';

const events = [
  { title: 'Morning planning', time: '08:30', detail: 'Map the day with calm intention.' },
  { title: 'Lunch walk', time: '12:30', detail: 'Get outside and reset.' },
  { title: 'Evening reset', time: '20:00', detail: 'Prep tomorrow before you unplug.' },
];

export default function CalendarPage() {
  return (
    <AppShell>
      <SectionPage eyebrow="Calendar" title="A beautifully paced week" description="Keep your commitments visible without letting the schedule feel crowded.">
        <Card className="grid gap-3 md:grid-cols-3">
          {events.map((event) => (
            <div key={event.title} className="rounded-[20px] border border-slate-200/70 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{event.title}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{event.time}</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{event.detail}</p>
            </div>
          ))}
        </Card>
      </SectionPage>
    </AppShell>
  );
}
