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
          <Card className="relative overflow-hidden bg-[linear-gradient(145deg,#eeeae6,#f7f1ec)] p-5">
            <Mail size={54} strokeWidth={0.75} className="absolute right-5 top-3 text-[#7e756d]/15" />
            <p className="glow-eyebrow">Correspondence desk</p>
            <p className="glow-display mt-2 text-[24px] text-[#4a413a]">Read what matters. Route the action. Leave the noise in Gmail.</p>
            <div className="mt-3 flex items-center gap-2 text-[8px] text-[#7c7169]"><LockKeyhole size={10} />Read-only Gmail access</div>
          </Card>

          {!result.ok ? (
            <Card>
              <p className="glow-eyebrow">Connection notice</p>
              <h2 className="glow-display mt-2 text-[18px] text-[#4a413a]">Gmail needs attention</h2>
              <p className="mt-2 text-[9px] text-[#7f736b]">Connection state: {result.reason.replaceAll('_', ' ')}. Reconnect Google from Connections if needed.</p>
              <a href="/connections" className="mt-4 inline-block rounded-[6px] bg-[#443b35] px-3 py-2 text-[8px] text-white">Open Connections</a>
            </Card>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Card><p className="text-[8px] text-[#83776f]">Recent messages</p><p className="glow-display mt-2 text-[26px] text-[#4b423b]">{result.messages.length}</p><p className="mt-1 text-[7px] text-[#9a8d85]">{result.unreadCount} unread in sample</p></Card>
                <Card><p className="flex items-center gap-1 text-[8px] text-[#83776f]"><TriangleAlert size={11} />Needs attention</p><p className="glow-display mt-2 text-[26px] text-[#4b423b]">{highPriority}</p><p className="mt-1 text-[7px] text-[#9a8d85]">time-sensitive signals</p></Card>
                <Card><p className="flex items-center gap-1 text-[8px] text-[#83776f]"><CalendarDays size={11} />Calendar candidates</p><p className="glow-display mt-2 text-[26px] text-[#4b423b]">{calendarCandidates}</p><p className="mt-1 text-[7px] text-[#9a8d85]">appointments + travel</p></Card>
                <Card><p className="flex items-center gap-1 text-[8px] text-[#83776f]"><FolderKanban size={11} />Project candidates</p><p className="glow-display mt-2 text-[26px] text-[#4b423b]">{projectCandidates}</p><p className="mt-1 text-[7px] text-[#9a8d85]">work + school context</p></Card>
              </div>

              <Card className="border-[#ded3cc] bg-[#fbf7f4]">
                <div className="flex items-start gap-3">
                  <ListChecks size={17} className="mt-0.5 text-[#6e625b]" />
                  <div>
                    <p className="glow-eyebrow">Routing contract</p>
                    <p className="mt-2 text-[9px] leading-4 text-[#766b64]">Create task writes a normal user-scoped Glow OS task with Gmail provenance and duplicate protection. Calendar and Project actions carry the message subject and Gmail source into those workspaces without changing the email itself.</p>
                  </div>
                </div>
              </Card>

              <Card className="overflow-hidden p-0">
                <div className="flex items-center gap-2 border-b border-[#e7ddd7] px-5 py-4">
                  <Sparkles size={13} className="text-[#81756c]" />
                  <div><p className="glow-eyebrow">Attention edit</p><h2 className="glow-display mt-1 text-[19px] text-[#4a413a]">Actionable correspondence feed</h2></div>
                </div>
                {insights.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-[9px] text-[#887b73]">No recent inbox messages returned.</p>
                    <a href="/connections" className="mt-3 inline-block text-[8px] underline text-[#6f625a]">Review Gmail connection</a>
                  </div>
                ) : (
                  <div className="divide-y divide-[#eee5df]">
                    {insights.map(({ message, insight }, index) => (
                      <article key={message.id} className={`p-4 ${message.unread || index === 0 ? 'bg-[#f7efea]/65' : ''}`}>
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="glow-display text-[14px] text-[#4a413a]">{message.subject}</p>
                            <p className="mt-1 text-[7px] text-[#96877e]">{message.from}</p>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            <span className="rounded-full bg-white/60 px-2 py-1 text-[7px] capitalize text-[#766b64]">{insight.category}</span>
                            <span className="rounded-full bg-white/60 px-2 py-1 text-[7px] capitalize text-[#766b64]">{insight.priority} priority</span>
                            <span className="rounded-full bg-white/60 px-2 py-1 text-[7px] capitalize text-[#766b64]">→ {insight.route}</span>
                            {message.unread ? <span className="rounded-full bg-[#514740] px-2 py-1 text-[7px] text-white">Unread</span> : null}
                          </div>
                        </div>
                        <p className="mt-3 text-[8px] leading-4 text-[#766b64]">{safeGmailSummary(message)}</p>
                        <p className="mt-2 text-[7px] leading-3 text-[#92857d]">{insight.rationale}</p>
                        {message.date ? <p className="mt-2 text-[7px] text-[#9b8d84]">{message.date.toLocaleString()}</p> : null}
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
