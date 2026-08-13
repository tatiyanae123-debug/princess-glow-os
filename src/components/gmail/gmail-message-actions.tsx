'use client';

import Link from 'next/link';
import { CalendarPlus, FolderKanban, ListPlus } from 'lucide-react';
import { CreateTaskFromEmailButton } from '@/components/dashboard/create-task-from-email-button';

export function GmailMessageActions({
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
  const calendarHref = `/calendar?source=gmail&subject=${encodeURIComponent(subject)}&messageId=${encodeURIComponent(messageId)}`;
  const projectHref = `/projects?source=gmail&subject=${encodeURIComponent(subject)}&messageId=${encodeURIComponent(messageId)}`;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <CreateTaskFromEmailButton
        messageId={messageId}
        threadId={threadId}
        subject={subject}
        from={from}
        snippet={snippet}
      />
      <Link
        href={calendarHref}
        className="flex items-center gap-1 rounded-full border border-[#F1E7E3] bg-white px-2.5 py-1.5 text-[10.5px] text-[#8A8078] transition hover:bg-[#FDF8F6]"
        aria-label={`Plan ${subject} on calendar`}
      >
        <CalendarPlus size={11} /> Plan on calendar
      </Link>
      <Link
        href={projectHref}
        className="flex items-center gap-1 rounded-full border border-[#F1E7E3] bg-white px-2.5 py-1.5 text-[10.5px] text-[#8A8078] transition hover:bg-[#FDF8F6]"
        aria-label={`Route ${subject} to projects`}
      >
        <FolderKanban size={11} /> Route to project
      </Link>
      <span className="sr-only"><ListPlus size={1} /> Gmail stays read-only; these actions only create or route Glow OS work.</span>
    </div>
  );
}
