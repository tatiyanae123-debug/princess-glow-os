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
const fieldClass = 'w-full rounded-lg border border-[#F1E7E3] px-3.5 py-2.5 text-[12px] text-[#2B2420] placeholder:text-[#B5ACA5] focus:border-[#7C6B9C] focus:outline-none';

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
          <Card className="relative overflow-hidden bg-[linear-gradient(145deg,#E9E4F2,#FDF6F1)]">
            <ShieldCheck size={52} strokeWidth={0.8} className="absolute right-5 top-4 text-[#7C6B9C]/25" />
            <p className="glow-eyebrow">Approval desk</p>
            <p className="glow-display mt-2 text-[24px] text-[#2B2420]">Glow can suggest. You stay in control.</p>
            <p className="mt-2 text-[12px] leading-5 text-[#8A8078]">
              {pending} proposal{pending === 1 ? '' : 's'} waiting · {executed} reversible action{executed === 1 ? '' : 's'} currently applied.
            </p>
          </Card>

          <div className="grid gap-4 xl:grid-cols-[.75fr_1.25fr]">
            <Card>
              <form action={createConciergeProposalAction} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-[#7C6B9C]" />
                  <h2 className="glow-display text-[20px] text-[#2B2420]">Create a proposal</h2>
                </div>
                <select name="actionType" defaultValue="advisory" className={fieldClass}>
                  <option value="advisory">Advisory only — no data change</option>
                  <option value="create_task">Create a task after approval</option>
                </select>
                <input name="intent" required placeholder="Intent, e.g. Make today lighter" className={fieldClass} />
                <textarea name="summary" required rows={3} placeholder="What should change?" className={fieldClass} />
                <textarea name="reason" required rows={4} placeholder="Why is this recommended?" className={fieldClass} />
                <div className="rounded-[12px] border border-[#F1E7E3] bg-[#FDF8F6] p-3">
                  <p className="glow-eyebrow">Optional executable task</p>
                  <p className="mb-3 mt-1 text-[10.5px] leading-4 text-[#8A8078]">
                    Fill these fields when "Create a task" is selected. Nothing is written until you approve the proposal.
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
                <button className="rounded-full bg-[#7C6B9C] px-4 py-2.5 text-[12px] font-medium text-white hover:bg-[#655682]">Create proposal</button>
              </form>
            </Card>

            <Card className="overflow-hidden p-0">
              <div className="border-b border-[#F1E7E3] px-5 py-4">
                <p className="glow-eyebrow">Approval queue</p>
                <h2 className="glow-display mt-1 text-[19px] text-[#2B2420]">Proposal queue</h2>
              </div>
              {proposals.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-[13px] text-[#8A8078]">No proposals yet.</p>
                  <p className="mt-2 text-[11px] leading-4 text-[#B5ACA5]">Create an advisory proposal or stage a task above. The approval queue will show exactly what Glow intends to do before anything changes.</p>
                </div>
              ) : (
                <div className="divide-y divide-[#F1E7E3]">
                  {proposals.map((proposal, index) => {
                    const payload = payloadOf(proposal.payload);
                    const canReverse = proposal.status === 'approved' && proposal.reversible && payload.execution?.entityType === 'task' && payload.execution.entityId && !payload.execution.reversedAt;
                    return (
                      <div key={proposal.id} className={`p-4 ${index === 0 && proposal.status === 'pending' ? 'bg-[#F5F2F9]' : ''}`}>
                        <div className="flex justify-between gap-3">
                          <div>
                            <p className="glow-display text-[14px] text-[#2B2420]">{proposal.summary}</p>
                            <p className="mt-1 text-[11px] leading-4 text-[#8A8078]">{proposal.reason}</p>
                          </div>
                          <span className="h-fit rounded-full bg-[#E9E4F2] px-2.5 py-1 text-[10px] uppercase text-[#7C6B9C]">{proposal.status}</span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-[#B5ACA5]">
                          <span>{actionLabel(payload)}</span>
                          <span>· Confidence {Math.round(proposal.confidence * 100)}%</span>
                          <span>· {proposal.reversible ? 'Safe undo supported' : 'No data write'}</span>
                        </div>
                        {payload.actionType === 'create_task' && payload.task?.title ? (
                          <div className="mt-3 rounded-[10px] border border-[#F1E7E3] bg-[#FDF8F6] px-3 py-2 text-[11px] leading-4 text-[#4A4440]">
                            <strong className="font-medium text-[#2B2420]">Planned task:</strong> {payload.task.title}
                            {payload.task.priority ? ` · ${payload.task.priority} priority` : ''}
                            {payload.task.dueDate ? ` · due ${new Date(payload.task.dueDate).toLocaleString()}` : ''}
                          </div>
                        ) : null}
                        {payload.execution?.entityId ? (
                          <p className="mt-2 text-[10.5px] text-[#8A8078]">
                            {payload.execution.reversedAt ? 'Undo completed. The Concierge-created task was removed.' : `Applied to Tasks · ${payload.execution.entityId.slice(0, 8)}…`}
                          </p>
                        ) : null}
                        {proposal.status === 'pending' ? (
                          <div className="mt-3 flex gap-2">
                            <form action={decideConciergeProposalAction.bind(null, proposal.id, 'approved')}>
                              <button className="inline-flex items-center gap-1 rounded-full bg-[#5A6E52] px-3.5 py-2 text-[11px] font-medium text-white"><Check size={10} />Approve</button>
                            </form>
                            <form action={decideConciergeProposalAction.bind(null, proposal.id, 'rejected')}>
                              <button className="inline-flex items-center gap-1 rounded-full border border-[#F1E7E3] px-3.5 py-2 text-[11px] text-[#8A8078] hover:bg-[#FDF8F6]"><X size={10} />Reject</button>
                            </form>
                          </div>
                        ) : null}
                        {canReverse ? (
                          <form action={reverseConciergeProposalAction.bind(null, proposal.id)} className="mt-3">
                            <button className="inline-flex items-center gap-1 rounded-full border border-[#F1E7E3] bg-white px-3.5 py-2 text-[11px] text-[#8A8078] hover:bg-[#FDF8F6]"><RotateCcw size={10} />Undo applied task</button>
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
            <div className="border-b border-[#F1E7E3] px-5 py-4">
              <p className="glow-eyebrow">Audit ribbon</p>
              <h2 className="glow-display mt-1 text-[17px] text-[#2B2420]">Decision + execution history</h2>
            </div>
            <div className="divide-y divide-[#F1E7E3]">
              {audit.length === 0 ? (
                <div className="p-6">
                  <p className="text-[12px] text-[#8A8078]">No approved, rejected, or reversed actions yet.</p>
                  <p className="mt-1 text-[11px] text-[#B5ACA5]">Every decision and safe undo will appear here automatically.</p>
                </div>
              ) : (
                audit.slice(0, 12).map((event) => (
                  <div key={event.id} className="flex justify-between gap-3 px-5 py-3 text-[11px]">
                    <span className="text-[#4A4440]">{event.action.replaceAll('_', ' ')}</span>
                    <span className="text-[#B5ACA5]">{event.createdAt.toLocaleString()}</span>
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
