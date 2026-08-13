import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import { GmailMessageActions } from '@/components/gmail/gmail-message-actions';
import { getRecentInboxMessages } from '@/lib/google/gmail-client';
import { gmailActionInsight, safeGmailSummary } from '@/lib/gmail/intelligence';
import { Mail, LockKeyhole, Sparkles, TriangleAlert, CalendarDays, FolderKanban, ListChecks } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function GmailPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const result = await getRecentInboxMessages(session.user.id);
  const insights = result.ok
    ? result.messages.map((message) => ({ message, insight: gmailActionInsight(message) }))
    : [];
  const highPriority = insights.filter(({ insight }) => insight.priority === 'high').length;
  const calendarCandidates = insights.filter(({ insight }) => insight.route === 'calendar').length;
  const projectCandidates = insights.filter(({ insight }) => insight.route === 'projects').length;

  return (
    <AppShell>
      <SectionPage
        eyebrow="Gmail Intelligence"
        title="See what deserves attention without living in your inbox"
        description="Glow OS reads a bounded set of recent Gmail metadata and snippets only. It does not send, delete, archive, label, or modify your email. Actions below create or route work inside Glow OS only."
      >
        <div className="space-y-4">
          <Card className="relative overflow-hidden bg-[linear-gradient(145deg,#FDF8F6,#F1E8D9)]">
            <Mail size={54} strokeWidth={0.75} className="absolute right-5 top-4 text-[#9A7A3D]/22" />
            <p className="glow-eyebrow">Correspondence desk</p>
            <p className="glow-display mt-2 text-[24px] text-[#2B2420]">Read what matters. Route the action. Leave the noise in Gmail.</p>
            <div className="mt-3 flex items-center gap-2 text-[11px] text-[#8A8078]"><LockKeyhole size={12} />Read-only Gmail access</div>
          </Card>

          {!result.ok ? (
            <Card>
              <p className="glow-eyebrow">Connection notice</p>
              <h2 className="glow-display mt-2 text-[18px] text-[#2B2420]">Gmail needs attention</h2>
              <p className="mt-2 text-[12px] text-[#8A8078]">Connection state: {result.reason.replaceAll('_', ' ')}. Reconnect Google from Connections if needed.</p>
              <a href="/connections" className="mt-4 inline-block rounded-full bg-[#2B2420] px-3.5 py-2 text-[11px] font-medium text-white">Open Connections</a>
            </Card>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Card><p className="text-[10.5px] text-[#8A8078]">Recent messages</p><p className="glow-display mt-2 text-[26px] text-[#2B2420]">{result.messages.length}</p><p className="mt-1 text-[10px] text-[#B5ACA5]">{result.unreadCount} unread in sample</p></Card>
                <Card><p className="flex items-center gap-1 text-[10.5px] text-[#8A8078]"><TriangleAlert size={12} />Needs attention</p><p className="glow-display mt-2 text-[26px] text-[#2B2420]">{highPriority}</p><p className="mt-1 text-[10px] text-[#B5ACA5]">time-sensitive signals</p></Card>
                <Card><p className="flex items-center gap-1 text-[10.5px] text-[#8A8078]"><CalendarDays size={12} />Calendar candidates</p><p className="glow-display mt-2 text-[26px] text-[#2B2420]">{calendarCandidates}</p><p className="mt-1 text-[10px] text-[#B5ACA5]">appointments + travel</p></Card>
                <Card><p className="flex items-center gap-1 text-[10.5px] text-[#8A8078]"><FolderKanban size={12} />Project candidates</p><p className="glow-display mt-2 text-[26px] text-[#2B2420]">{projectCandidates}</p><p className="mt-1 text-[10px] text-[#B5ACA5]">work + school context</p></Card>
              </div>

              <Card className="bg-[#FDF8F6]">
                <div className="flex items-start gap-3">
                  <ListChecks size={17} className="mt-0.5 text-[#C9727E]" />
                  <div>
                    <p className="glow-eyebrow">Routing contract</p>
                    <p className="mt-2 text-[11.5px] leading-4 text-[#8A8078]">Create task writes a normal user-scoped Glow OS task with Gmail provenance and duplicate protection. Calendar and Project actions carry the message subject and Gmail source into those workspaces without changing the email itself.</p>
                  </div>
                </div>
              </Card>

              <Card className="overflow-hidden p-0">
                <div className="flex items-center gap-2 border-b border-[#F1E7E3] px-5 py-4">
                  <Sparkles size={13} className="text-[#C9727E]" />
                  <div><p className="glow-eyebrow">Attention edit</p><h2 className="glow-display mt-1 text-[19px] text-[#2B2420]">Actionable correspondence feed</h2></div>
                </div>
                {insights.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-[12px] text-[#8A8078]">No recent inbox messages returned.</p>
                    <a href="/connections" className="mt-3 inline-block text-[11px] font-medium text-[#C9727E] underline-offset-4 hover:underline">Review Gmail connection</a>
                  </div>
                ) : (
                  <div className="divide-y divide-[#F1E7E3]">
                    {insights.map(({ message, insight }, index) => (
                      <article key={message.id} className={`p-4 ${message.unread || index === 0 ? 'bg-[#FDF8F6]' : ''}`}>
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="glow-display text-[14px] text-[#2B2420]">{message.subject}</p>
                            <p className="mt-1 text-[10.5px] text-[#B5ACA5]">{message.from}</p>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            <span className="rounded-full bg-[#FBE4E8] px-2.5 py-1 text-[10px] capitalize text-[#B15A68]">{insight.category}</span>
                            <span className="rounded-full bg-[#F1E8D9] px-2.5 py-1 text-[10px] capitalize text-[#9A7A3D]">{insight.priority} priority</span>
                            <span className="rounded-full bg-[#E9E4F2] px-2.5 py-1 text-[10px] capitalize text-[#7C6B9C]">→ {insight.route}</span>
                            {message.unread ? <span className="rounded-full bg-[#2B2420] px-2.5 py-1 text-[10px] text-white">Unread</span> : null}
                          </div>
                        </div>
                        <p className="mt-3 text-[11px] leading-4 text-[#4A4440]">{safeGmailSummary(message)}</p>
                        <p className="mt-2 text-[10px] leading-4 text-[#B5ACA5]">{insight.rationale}</p>
                        {message.date ? <p className="mt-2 text-[10px] text-[#B5ACA5]">{message.date.toLocaleString()}</p> : null}
                        <GmailMessageActions
                          messageId={message.id}
                          threadId={message.threadId}
                          subject={message.subject}
                          from={message.from}
                          snippet={message.snippet}
                        />
                      </article>
                    ))}
                  </div>
                )}
              </Card>
            </>
          )}
        </div>
      </SectionPage>
    </AppShell>
  );
}
