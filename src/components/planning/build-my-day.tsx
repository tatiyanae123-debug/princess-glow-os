import { buildMyDayAction } from '@/app/actions/build-my-day';
import { Card } from '@/components/ui/card';
import { BuildMyDayClient } from './build-my-day-client';

export async function BuildMyDay() {
  const proposal = await buildMyDayAction('standard');
  return (
    <Card className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Glow Intelligence</p>
        <h2 className="mt-2 text-xl font-semibold">Build My Day</h2>
        <p className="mt-1 text-sm text-slate-500">Fit the strongest next actions around your real schedule without moving fixed commitments.</p>
      </div>
      <BuildMyDayClient initialProposal={proposal} />
    </Card>
  );
}
