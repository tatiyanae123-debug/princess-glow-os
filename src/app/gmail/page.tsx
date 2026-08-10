import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import { getRecentInboxMessages } from '@/lib/google/gmail-client';
import { classifyGmailMetadata, safeGmailSummary } from '@/lib/gmail/intelligence';

export const dynamic = 'force-dynamic';

export default async function GmailPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const result = await getRecentInboxMessages(session.user.id);

  return <AppShell><SectionPage eyebrow="Gmail Intelligence" title="See what deserves attention without living in your inbox" description="Glow OS reads a bounded set of recent Gmail metadata and snippets only. It does not send, delete, archive, or modify your email.">
    {!result.ok ? <Card><h2 className="text-lg font-semibold">Gmail needs attention</h2><p className="mt-2 text-sm text-slate-500">Connection state: {result.reason.replaceAll('_',' ')}. Reconnect Google from Connections if needed.</p><a href="/connections" className="mt-4 inline-block rounded-xl bg-slate-900 px-3 py-2 text-sm text-white dark:bg-white dark:text-slate-900">Open Connections</a></Card> : <>
      <div className="grid gap-4 sm:grid-cols-3"><Card><p className="text-sm text-slate-500">Recent messages</p><p className="mt-2 text-3xl font-semibold">{result.messages.length}</p></Card><Card><p className="text-sm text-slate-500">Unread in sample</p><p className="mt-2 text-3xl font-semibold">{result.unreadCount}</p></Card><Card><p className="text-sm text-slate-500">Access</p><p className="mt-2 text-lg font-semibold">Read-only</p></Card></div>
      <Card className="mt-5 space-y-3"><h2 className="text-xl font-semibold">Attention feed</h2>{result.messages.length===0?<p className="text-sm text-slate-500">No recent inbox messages returned.</p>:result.messages.map(message=>{const category=classifyGmailMetadata(message);return <article key={message.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"><div className="flex flex-wrap items-start justify-between gap-2"><div><p className="font-semibold">{message.subject}</p><p className="mt-1 text-xs text-slate-400">{message.from}</p></div><div className="flex gap-2"><span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] capitalize text-slate-600 dark:bg-slate-900 dark:text-slate-300">{category}</span>{message.unread&&<span className="rounded-full bg-slate-900 px-2 py-1 text-[11px] text-white dark:bg-white dark:text-slate-900">Unread</span>}</div></div><p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{safeGmailSummary(message)}</p>{message.date&&<p className="mt-2 text-xs text-slate-400">{message.date.toLocaleString()}</p>}</article>})}</Card>
    </>}
  </SectionPage></AppShell>;
}
