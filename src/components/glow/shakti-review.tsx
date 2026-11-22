import Link from 'next/link';
import { Check, ChevronRight } from 'lucide-react';

export type ShaktiAction = {
  title: string;
  type: string;
  destinations: string[];
  confidence: number;
  executor?: 'verified' | 'review-queue';
};

export type ShaktiReceipt = {
  summary: string;
  status?: string;
  completed?: string[];
  failed?: string[];
  queued?: string[];
  destinations?: string[];
  queuedDestinations?: string[];
  needsAttention?: boolean;
  refreshPending?: boolean;
};

export type ShaktiProposal = {
  scenarioId: string;
  text: string;
  actions: ShaktiAction[];
  selected: number[];
};

export function ShaktiReview({ proposal, pending, onSelect, onApprove, onCancel }: {
  proposal: ShaktiProposal;
  pending: boolean;
  onSelect: (index: number) => void;
  onApprove: () => void;
  onCancel: () => void;
}) {
  return (
    <section className="shakti-paper shakti-review" aria-label="Proposed changes">
      <span className="shakti-status-label">Ready for review</span>
      <h2>Proposed Changes</h2>
      {proposal.actions.map((action, index) => (
        <label className="shakti-review-row" key={index}>
          <input type="checkbox" checked={proposal.selected.includes(index)} disabled={pending} onChange={() => onSelect(index)} />
          <span><strong>{action.title}</strong>
            <small>{action.destinations.join(' · ') || action.type}{action.executor === 'review-queue' ? ' · Review queue' : ''}</small>
          </span>
        </label>
      ))}
      <div className="shakti-paper-actions">
        <button type="button" onClick={onCancel} disabled={pending}>Cancel</button>
        <button type="button" onClick={onApprove} disabled={pending || !proposal.selected.length}>
          {pending ? 'Applying…' : `Apply ${proposal.selected.length} ${proposal.selected.length === 1 ? 'change' : 'changes'}`}
        </button>
      </div>
    </section>
  );
}

export function ShaktiConfirmation({ receipt }: { receipt: ShaktiReceipt }) {
  const destinations: Record<string, string> = { Tasks: '/tasks', Notes: '/notes', Inbox: '/inbox' };
  return (
    <section className="shakti-paper shakti-confirmation" aria-label="Action receipt">
      <header>
        <span aria-hidden="true">{receipt.needsAttention ? '!' : <Check size={18} />}</span>
        <div><h2>{receipt.needsAttention ? 'Needs Attention' : 'Shakti Confirmation'}</h2>
          <p role="status">{receipt.needsAttention ? 'Review the results below.' : 'Applied changes are saved.'}</p></div>
      </header>
      {receipt.refreshPending && <p>Some room views may need to refresh.</p>}
      <ul>
        {receipt.completed?.map((item, index) => <li key={`done-${index}`}>{item}</li>)}
        {receipt.queued?.map((item, index) => <li key={`queue-${index}`}>Queued for review · {item}</li>)}
        {receipt.failed?.map((item, index) => <li key={`failed-${index}`}>Needs attention · {item}</li>)}
      </ul>
      {Array.from(new Set([...(receipt.destinations ?? []), ...(receipt.queuedDestinations ?? [])])).map(destination =>
        destinations[destination] ? <Link key={destination} href={destinations[destination]}>Open {destination}<ChevronRight size={15} /></Link> : null)}
    </section>
  );
}
