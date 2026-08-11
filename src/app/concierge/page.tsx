import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import {
  createConciergeProposalAction,
  decideConciergeProposalAction,
  reverseConciergeProposalAction,
} from '@/app/actions/concierge';
import { getAiProposals, getAuditEvents } from '@/lib/data/completion-v1';
import { Check, RotateCcw, ShieldCheck, Sparkles, X } from 'lucide-react';

export const dynamic = 'force-dynamic';
const fieldClass = 'w-full border px-4 py-3 text-[10px]';

type ProposalPayload = Record<string, unknown> & {
  actionType?: string;
  task?: { title?: string; priority?: string; dueDate?: string | null };
  execution?: { entityType?: string; entityId?: string; executedAt?: string; reversedAt?: string };
};

function payloadOf(value: unknown): ProposalPayload {
  return value && typeof value === 'object' ? (value as ProposalPayload) : {};
}

function actionLabel(payload: ProposalPayload) {
  return payload.actionType === 'create_task' ? 'Create task' : 'Advisory only';
}

export default async function ConciergePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const [proposals, audit] = await Promise.all([
    getAiProposals(session.user.id),
    getAuditEvents(session.user.id),
  ]);
  const pending = proposals.filter((proposal) => proposal.status === 'pending').length;
  const executed = proposals.filter((proposal) => {
    const payload = payloadOf(proposal.payload);
    return proposal.status === 'approved' && payload.execution?.entityId && !payload.execution.reversedAt;
  }).length;

  return (
    <AppShell>
      <SectionPage
        eyebrow="AI Concierge"
        title="Ask, propose, approve"
        description="Glow can reason immediately. Any real change is previewed first, executed only after approval, recorded in the audit trail, and reversible when the action supports a safe undo."
      >
        <div className="space-y-4">
          <Card className="relative overflow-hidden bg-[linear-gradient(145deg,#eee6ef,#f6efeb)] p-5">
            <ShieldCheck size={52} strokeWidth={0.8} className="absolute right-5 top-3 text-[#7e6b83]/16" />
            <p className="glow-eyebrow">Approval desk</p>
            <p className="glow-display mt-2 text-[24px] text-[#4d414d]">Glow can suggest. You stay in control.</p>
            <p className="mt-2 text-[9px] leading-4 text-[#796d78]">
              {pending} proposal{pending === 1 ? '' : 's'} waiting · {executed} reversible action{executed === 1 ? '' : 's'} currently applied.
            </p>
          </Card>

          <div className="grid gap-5 xl:grid-cols-[.75fr_1.25fr]">
            <Card className="paper-card">
              <form action={createConciergeProposalAction} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-[#806b85]" />
                  <h2 className="glow-display text-[20px] text-[#4d414d]">Create a proposal</h2>
                </div>
                <select name="actionType" defaultValue="advisory" className={fieldClass}>
                  <option value="advisory">Advisory only — no data change</option>
                  <option value="create_task">Create a task after approval</option>
                </select>
                <input name="intent" required placeholder="Intent, e.g. Make today lighter" className={fieldClass} />
                <textarea name="summary" required rows={3} placeholder="What should change?" className={fieldClass} />
                <textarea name="reason" required rows={4} placeholder="Why is this recommended?" className={fieldClass} />
                <div className="rounded-[8px] border border-[#e4dce3] bg-white/55 p-3">
                  <p className="glow-eyebrow">Optional executable task</p>
                  <p className="mb-3 mt-1 text-[8px] leading-4 text-[#847984]">
                    Fill these fields when “Create a task” is selected. Nothing is written until you approve the proposal.
                  </p>
                  <div className="space-y-2">
                    <input name="taskTitle" placeholder="Task title" className={fieldClass} />
                    <div className="grid gap-2 sm:grid-cols-2">
                      <select name="taskPriority" defaultValue="medium" className={fieldClass}>
                        <option value="low">Low priority</option>
                        <option value="medium">Medium priority</option>
                        <option value="high">High priority</option>
                        <option value="urgent">Urgent priority</option>
                      </select>
                      <input name="taskDueDate" type="datetime-local" className={fieldClass} />
                    </div>
                  </div>
                </div>
                <button className="rounded-[6px] bg-[#443a44] px-4 py-2 text-[9px] text-white">Create proposal</button>
              </form>
            </Card>

            <Card className="overflow-hidden p-0">
              <div className="border-b border-[#e4dae4] px-5 py-4">
                <p className="glow-eyebrow">Approval queue</p>
                <h2 className="glow-display mt-1 text-[19px] text-[#4d414d]">Proposal queue</h2>
              </div>
              {proposals.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-[10px] text-[#776b76]">No proposals yet.</p>
                  <p className="mt-2 text-[8px] leading-4 text-[#978b96]">Create an advisory proposal or stage a task above. The approval queue will show exactly what Glow intends to do before anything changes.</p>
                </div>
              ) : (
                <div className="divide-y divide-[#ebe3ea]">
                  {proposals.map((proposal, index) => {
                    const payload = payloadOf(proposal.payload);
                    const canReverse = proposal.status === 'approved' && proposal.reversible && payload.execution?.entityType === 'task' && payload.execution.entityId && !payload.execution.reversedAt;
                    return (
                      <div key={proposal.id} className={`p-4 ${index === 0 && proposal.status === 'pending' ? 'bg-[#f0e5ef]/55' : ''}`}>
                        <div className="flex justify-between gap-3">
                          <div>
                            <p className="glow-display text-[14px] text-[#4c404c]">{proposal.summary}</p>
                            <p className="mt-1 text-[8px] leading-4 text-[#7c707b]">{proposal.reason}</p>
                          </div>
                          <span className="h-fit rounded-full bg-white/50 px-2 py-1 text-[7px] uppercase text-[#847784]">{proposal.status}</span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2 text-[7px] text-[#998d98]">
                          <span>{actionLabel(payload)}</span>
                          <span>· Confidence {Math.round(proposal.confidence * 100)}%</span>
                          <span>· {proposal.reversible ? 'Safe undo supported' : 'No data write'}</span>
                        </div>
                        {payload.actionType === 'create_task' && payload.task?.title ? (
                          <div className="mt-3 rounded-[7px] border border-[#e8dfe7] bg-white/55 px-3 py-2 text-[8px] leading-4 text-[#756a74]">
                            <strong className="font-medium text-[#564b55]">Planned task:</strong> {payload.task.title}
                            {payload.task.priority ? ` · ${payload.task.priority} priority` : ''}
                            {payload.task.dueDate ? ` · due ${new Date(payload.task.dueDate).toLocaleString()}` : ''}
                          </div>
                        ) : null}
                        {payload.execution?.entityId ? (
                          <p className="mt-2 text-[7px] text-[#897e88]">
                            {payload.execution.reversedAt ? 'Undo completed. The Concierge-created task was removed.' : `Applied to Tasks · ${payload.execution.entityId.slice(0, 8)}…`}
                          </p>
                        ) : null}
                        {proposal.status === 'pending' ? (
                          <div className="mt-3 flex gap-2">
                            <form action={decideConciergeProposalAction.bind(null, proposal.id, 'approved')}>
                              <button className="inline-flex items-center gap-1 rounded-[6px] bg-[#485047] px-3 py-2 text-[8px] text-white"><Check size={9} />Approve</button>
                            </form>
                            <form action={decideConciergeProposalAction.bind(null, proposal.id, 'rejected')}>
                              <button className="inline-flex items-center gap-1 rounded-[6px] border border-[#ded3dd] px-3 py-2 text-[8px] text-[#6e626d]"><X size={9} />Reject</button>
                            </form>
                          </div>
                        ) : null}
                        {canReverse ? (
                          <form action={reverseConciergeProposalAction.bind(null, proposal.id)} className="mt-3">
                            <button className="inline-flex items-center gap-1 rounded-[6px] border border-[#d7cbd5] bg-white/70 px-3 py-2 text-[8px] text-[#655a64]"><RotateCcw size={9} />Undo applied task</button>
                          </form>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          <Card className="overflow-hidden p-0">
            <div className="border-b border-[#e4dae4] px-5 py-4">
              <p className="glow-eyebrow">Audit ribbon</p>
              <h2 className="glow-display mt-1 text-[17px] text-[#4d414d]">Decision + execution history</h2>
            </div>
            <div className="divide-y divide-[#ece5eb]">
              {audit.length === 0 ? (
                <div className="p-6">
                  <p className="text-[9px] text-[#897d88]">No approved, rejected, or reversed actions yet.</p>
                  <p className="mt-1 text-[8px] text-[#a0949f]">Every decision and safe undo will appear here automatically.</p>
                </div>
              ) : (
                audit.slice(0, 12).map((event) => (
                  <div key={event.id} className="flex justify-between gap-3 px-5 py-3 text-[8px]">
                    <span className="text-[#685d67]">{event.action.replaceAll('_', ' ')}</span>
                    <span className="text-[#998d98]">{event.createdAt.toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </SectionPage>
    </AppShell>
  );
}
