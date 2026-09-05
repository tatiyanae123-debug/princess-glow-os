import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getAppleReminderConnection, getAppleRemindersByUser } from '@/lib/apple-reminders/service';
import { understandAppleReminder } from '@/lib/apple-reminders/intelligence';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import { PlanRemindersRoom, type PlanReminderCalendarEvent, type PlanReminderItem } from '@/components/plan/plan-reminders-room';

export const dynamic = 'force-dynamic';

export default async function RemindersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;

  const [rows, connection, calendarRows] = await Promise.all([
    getAppleRemindersByUser(userId),
    getAppleReminderConnection(userId),
    getCalendarEventsByUser(userId),
  ]);

  const reminders: PlanReminderItem[] = rows.map((row) => {
    const intelligence = understandAppleReminder({ title: row.title, notes: row.notes, dueAt: row.dueAt, completed: row.completed });
    return {
      id: row.id,
      title: row.title,
      notes: row.notes,
      listName: row.listName,
      dueAt: row.dueAt?.toISOString() ?? null,
      completed: row.completed,
      lastSyncedAt: row.lastSyncedAt.toISOString(),
      domain: intelligence.domain,
      intent: intelligence.intent,
      urgency: intelligence.urgency,
      nextAction: intelligence.nextAction,
    };
  });

  const calendarEvents: PlanReminderCalendarEvent[] = calendarRows.map((event) => ({
    id: event.id,
    title: event.title,
    startAt: event.startAt.toISOString(),
    endAt: event.endAt?.toISOString() ?? null,
    allDay: event.allDay,
  }));

  return (
    <PlanRemindersRoom
      reminders={reminders}
      connection={connection ? { status: connection.status, lastImportedAt: connection.lastImportedAt?.toISOString() ?? null } : null}
      calendarEvents={calendarEvents}
    />
  );
}
