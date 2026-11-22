import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getLivingKernelContext } from '@/lib/intelligence/living-kernel';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

function toIso(value: unknown) {
  if (!value) return null;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function dateKey(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ ok: false, reason: 'not_signed_in' }, { status: 401 });

    const kernel = await getLivingKernelContext({ userId: session.user.id, route: '/today', maxObjects: 160 });
    const objects = kernel.objects;
    const tasks = objects
      .filter((item) => item.domain === 'task' && !['done', 'cancelled', 'archived'].includes(item.state))
      .map((item) => ({
        id: item.id.replace(/^task:/, ''), title: item.title, description: item.summary,
        status: item.state === 'in_progress' ? 'in_progress' : 'pending',
        priority: ['low', 'medium', 'high', 'urgent'].includes(String(item.metadata.priority)) ? item.metadata.priority : 'medium',
        dueDate: toIso(item.timing.dueAt),
      }));

    const events = objects
      .filter((item) => item.domain === 'calendar-event' && item.state !== 'archived')
      .map((item) => ({
        id: item.id.replace(/^calendar-event:/, ''),
        source: item.provenance.sourceSystem === 'google' ? 'google' : 'glow',
        title: item.title,
        startAt: toIso(item.timing.startAt),
        endAt: toIso(item.timing.endAt),
        allDay: item.timing.allDay === true,
        location: typeof item.metadata.location === 'string' ? item.metadata.location : null,
        htmlLink: typeof item.metadata.htmlLink === 'string' ? item.metadata.htmlLink : null,
      }))
      .filter((item): item is typeof item & { startAt: string } => Boolean(item.startAt))
      .sort((a, b) => a.startAt.localeCompare(b.startAt));

    const now = new Date();
    const today = dateKey(now);
    const tomorrowDate = new Date(now); tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrow = dateKey(tomorrowDate);
    const wellnessObject = objects.filter((item) => item.domain === 'wellness-signal').sort((a, b) => String(b.timing.occurredAt ?? '').localeCompare(String(a.timing.occurredAt ?? '')))[0];
    const googleConnected = objects.some((item) => item.domain === 'calendar-event' && item.provenance.sourceSystem === 'google');

    return NextResponse.json({
      ok: true,
      currentRealityId: kernel.currentRealityId,
      user: { name: session.user.name ?? null, email: session.user.email ?? null },
      tasks,
      activeTask: tasks.find((task) => task.status === 'in_progress') ?? tasks[0] ?? null,
      events,
      todayEvents: events.filter((event) => event.startAt.slice(0, 10) === today),
      tomorrowEvents: events.filter((event) => event.startAt.slice(0, 10) === tomorrow),
      routines: objects.filter((item) => item.domain === 'routine' && item.state !== 'archived').map((item) => ({
        id: item.id.replace(/^routine:/, ''), name: item.title, description: item.summary,
        timeOfDay: ['morning', 'afternoon', 'evening', 'night', 'anytime'].includes(String(item.timing.timeOfDay)) ? item.timing.timeOfDay : 'anytime',
      })),
      habits: objects.filter((item) => item.domain === 'habit' && item.state !== 'archived').map((item) => ({
        id: item.id.replace(/^habit:/, ''), name: item.title, description: item.summary,
        frequency: ['daily', 'weekdays', 'weekends', 'weekly', 'custom'].includes(String(item.metadata.frequency)) ? item.metadata.frequency : 'daily',
      })),
      notes: objects.filter((item) => item.domain === 'note' && item.state !== 'archived').slice(0, 12).map((item) => ({
        id: item.id.replace(/^note:/, ''), title: item.title, content: item.summary, pinned: item.metadata.pinned === true, updatedAt: kernel.generatedAt,
      })),
      goals: objects.filter((item) => item.domain === 'goal' && item.state !== 'archived').slice(0, 12).map((item) => ({
        id: item.id.replace(/^goal:/, ''), title: item.title, description: item.summary,
        category: String(item.metadata.category ?? 'other'), status: item.state, progress: Number(item.metadata.progress ?? 0), targetDate: toIso(item.timing.targetDate),
      })),
      wellness: wellnessObject ? {
        entryDate: String(wellnessObject.timing.occurredAt ?? '').slice(0, 10),
        mood: typeof wellnessObject.metadata.mood === 'string' ? wellnessObject.metadata.mood : null,
        energy: typeof wellnessObject.metadata.energy === 'string' ? wellnessObject.metadata.energy : null,
        sleepHours: wellnessObject.metadata.sleepHours == null ? null : Number(wellnessObject.metadata.sleepHours),
        waterGlasses: wellnessObject.metadata.waterGlasses == null ? null : Number(wellnessObject.metadata.waterGlasses),
        notes: wellnessObject.summary,
      } : null,
      sourceStatus: { googleCalendar: googleConnected ? 'connected' : 'not_connected' },
    });
  } catch (error) {
    console.error('personal-context kernel compatibility failed', error);
    return NextResponse.json({ ok: false, reason: 'error' }, { status: 500 });
  }
}
