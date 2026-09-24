import { auth } from '@/auth';
import { getAppleRemindersByUser } from '@/lib/apple-reminders/service';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ ok: false, reason: 'not_signed_in' }, { status: 401 });
  }

  try {
    const reminders = await getAppleRemindersByUser(session.user.id);
    return Response.json({
      ok: true,
      reminders: reminders.slice(0, 24).map((reminder) => ({
        id: reminder.id,
        title: reminder.title,
        notes: reminder.notes,
        listName: reminder.listName,
        dueAt: reminder.dueAt ? reminder.dueAt.toISOString() : null,
        completed: reminder.completed,
      })),
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('living reminders failed', error);
    return Response.json({ ok: false, reason: 'error' }, { status: 500 });
  }
}
