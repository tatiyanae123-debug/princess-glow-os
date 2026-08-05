'use client';

import { useState } from 'react';
import { ListPlus, Check } from 'lucide-react';
import { useServerAction } from '@/lib/hooks/use-server-action';
import { createTaskFromEmailAction } from '@/app/actions/gmail-task';

export function CreateTaskFromEmailButton({
  messageId,
  threadId,
  subject,
  from,
  snippet,
}: {
  messageId: string;
  threadId: string;
  subject: string;
  from: string;
  snippet: string;
}) {
  const [done, setDone] = useState(false);
  const action = useServerAction(createTaskFromEmailAction);

  if (done) {
    return (
      <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--glow-text-muted)' }}>
        <Check size={12} /> Task created
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => action.run({ messageId, threadId, subject, from, snippet }, () => setDone(true))}
      disabled={action.isPending}
      className="flex items-center gap-1 rounded-full px-2 py-1 text-xs transition hover:opacity-80"
      style={{ background: 'var(--glow-accent-soft)', color: 'var(--glow-accent)' }}
    >
      <ListPlus size={12} />
      {action.isPending ? 'Adding…' : 'Create task'}
    </button>
  );
}
