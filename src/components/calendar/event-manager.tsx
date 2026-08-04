'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EventForm } from '@/components/calendar/event-form';
import { useServerAction } from '@/lib/hooks/use-server-action';
import { deleteCalendarEventAction } from '@/app/actions/calendar-events';
import type { CalendarEvent } from '@/lib/types';

export function EventManager({ initialEvents }: { initialEvents: CalendarEvent[] }) {
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [dialogEvent, setDialogEvent] = useState<CalendarEvent | 'new' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CalendarEvent | null>(null);
  const del = useServerAction((id: string) => deleteCalendarEventAction(id));

  function handleSaved(event: CalendarEvent) {
    setEvents((current) => {
      const exists = current.some((e) => e.id === event.id);
      const next = exists ? current.map((e) => (e.id === event.id ? event : e)) : [event, ...current];
      return [...next].sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
    });
    setDialogEvent(null);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    del.run(deleteTarget.id, () => {
      setEvents((current) => current.filter((e) => e.id !== deleteTarget.id));
      setDeleteTarget(null);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setDialogEvent('new')} className="flex items-center gap-1.5">
          <Plus size={14} /> Add event
        </Button>
      </div>
      {events.length === 0 ? (
        <Card>
          <p className="py-4 text-center text-sm" style={{ color: 'var(--glow-text-muted)' }}>
            No events yet. Add your first event to start shaping the week.
          </p>
        </Card>
      ) : (
        <Card className="grid gap-3 md:grid-cols-3">
          {events.map((event) => (
            <div
              key={event.id}
              className="rounded-[20px] border p-4"
              style={{ borderColor: 'var(--glow-border)', background: 'var(--glow-surface-muted)' }}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold" style={{ color: 'var(--glow-text)' }}>
                  {event.title}
                </p>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setDialogEvent(event)}
                    aria-label="Edit event"
                    className="rounded-full p-1 transition hover:opacity-70"
                    style={{ color: 'var(--glow-text-muted)' }}
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(event)}
                    aria-label="Delete event"
                    className="rounded-full p-1 transition hover:opacity-70"
                    style={{ color: 'var(--glow-text-muted)' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <p className="mt-1 text-sm" style={{ color: 'var(--glow-text-muted)' }}>
                {event.allDay
                  ? event.startAt.toLocaleDateString('en', { month: 'short', day: 'numeric' })
                  : event.startAt.toLocaleString('en', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
              </p>
              {event.description && (
                <p className="mt-2 text-sm" style={{ color: 'var(--glow-text-muted)' }}>
                  {event.description}
                </p>
              )}
              {event.location && (
                <p className="mt-1 text-xs" style={{ color: 'var(--glow-text-muted)' }}>
                  {event.location}
                </p>
              )}
            </div>
          ))}
        </Card>
      )}

      <Dialog open={dialogEvent !== null} onClose={() => setDialogEvent(null)} title={dialogEvent === 'new' ? 'Add event' : 'Edit event'}>
        <EventForm event={dialogEvent === 'new' ? null : dialogEvent} onSaved={handleSaved} onCancel={() => setDialogEvent(null)} />
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete this event?"
        description={deleteTarget ? `"${deleteTarget.title}" will be removed.` : undefined}
        pending={del.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
