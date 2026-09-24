import { auth } from '@/auth';
import { getRecentInboxMessages } from '@/lib/google/gmail-client';
import { gmailActionInsight, safeGmailSummary } from '@/lib/gmail/intelligence';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ ok: false, reason: 'not_signed_in' }, { status: 401 });
  }

  try {
    const result = await getRecentInboxMessages(session.user.id);
    if (!result.ok) {
      return Response.json({ ok: false, reason: result.reason }, { status: 200 });
    }

    return Response.json({
      ok: true,
      unreadCount: result.unreadCount,
      messages: result.messages.slice(0, 18).map((message) => {
        const insight = gmailActionInsight(message);
        return {
          id: message.id,
          threadId: message.threadId,
          from: message.from,
          subject: message.subject,
          summary: safeGmailSummary(message),
          unread: message.unread,
          date: message.date ? message.date.toISOString() : null,
          category: insight.category,
          priority: insight.priority,
          route: insight.route,
          rationale: insight.rationale,
        };
      }),
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('living inbox failed', error);
    return Response.json({ ok: false, reason: 'error' }, { status: 500 });
  }
}
