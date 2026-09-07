import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getAppleReminderConnection, getAppleRemindersByUser } from '@/lib/apple-reminders/service';
import { understandAppleReminder } from '@/lib/apple-reminders/intelligence';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import { getPlanObjectSettingsByPrefix } from '@/lib/plan/object-settings';
import {
  PlanRemindersV2,
  type PlanReminderCalendarEventV2,
  type PlanReminderV2,
  type ReminderSettingSnapshot,
} from '@/components/plan/plan-reminders-v2';

export const dynamic = 'force-dynamic';

type JsonMap = Record<string, unknown>;
function map(value: unknown): JsonMap { return value && typeof value === 'object' && !Array.isArray(value) ? value as JsonMap : {}; }
function text(value: unknown) { return typeof value === 'string' ? value : null; }
function bool(value: unknown) { return typeof value === 'boolean' ? value : null; }

export default async function RemindersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;

  const [rows, connection, calendarRows, settingsMap] = await Promise.all([
    getAppleRemindersByUser(userId),
    getAppleReminderConnection(userId),
    getCalendarEventsByUser(userId),
    getPlanObjectSettingsByPrefix(userId, 'plan:reminder:'),
  ]);

  const reminders: PlanReminderV2[] = rows.map((row) => {
    const intelligence = understandAppleReminder({ title: row.title, notes: row.notes, dueAt: row.dueAt, completed: row.completed });
    const audit = map(row.importAudit);
    const sourceFields = map(audit.sourceFields);
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
      source: {
        location: text(sourceFields.locationName),
        person: text(sourceFields.personName),
        recurrence: text(sourceFields.recurrence),
        notificationStyle: text(sourceFields.notificationStyle),
        spokenReminder: bool(sourceFields.spokenReminder),
        smartTiming: bool(sourceFields.smartTiming),
        url: text(sourceFields.url),
      },
    };
  });

  const calendarEvents: PlanReminderCalendarEventV2[] = calendarRows.map((event) => ({
    id: event.id,
    title: event.title,
    startAt: event.startAt.toISOString(),
    endAt: event.endAt?.toISOString() ?? null,
    allDay: event.allDay,
  }));
  const settings: ReminderSettingSnapshot = Object.fromEntries(Array.from(settingsMap.entries()).map(([key, row]) => [key, row.preferences]));

  return (
    <PlanRemindersV2
      reminders={reminders}
      connection={connection ? { status: connection.status, lastImportedAt: connection.lastImportedAt?.toISOString() ?? null } : null}
      calendarEvents={calendarEvents}
      settings={settings}
    />
  );
}
