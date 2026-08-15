'use client';

import { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Dialog } from '@/components/ui/dialog';
import { EventForm } from '@/components/calendar/event-form';
import { EventManager } from '@/components/calendar/event-manager';
import type { CalendarEvent } from '@/lib/types';

function withoutEventParams(params: URLSearchParams) {
  const next = new URLSearchParams(params.toString());
  next.delete('eventId');
  next.delete('event');
  return next;
}

export function CalendarRouteExperience({ initialEvents }: { initialEvents: CalendarEvent[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedId = searchParams.get('eventId') ?? searchParams.get('event');
  const selectedEvent = useMemo(
    () => (requestedId ? initialEvents.find((event) => event.id === requestedId) ?? null : null),
    [initialEvents, requestedId],
  );

  function closeRecord() {
    const next = withoutEventParams(new URLSearchParams(searchParams.toString()));
    router.replace(next.toString() ? `/calendar?${next.toString()}` : '/calendar', { scroll: false });
  }

  return (
    <>
      <EventManager initialEvents={initialEvents} />
      <Dialog open={Boolean(requestedId && selectedEvent)} onClose={closeRecord} title={selectedEvent ? `Event · ${selectedEvent.title}` : 'Event'}>
        {selectedEvent ? (
          <EventForm
            event={selectedEvent}
            onSaved={() => {
              closeRecord();
              router.refresh();
            }}
            onCancel={closeRecord}
          />
        ) : null}
      </Dialog>
      {requestedId && !selectedEvent ? (
        <div role="status" className="fixed bottom-5 left-1/2 z-[170] -translate-x-1/2 rounded-full border border-[#F7D1D8] bg-white px-4 py-2 text-[11px] text-[#7b535c] shadow-lg">
          That calendar event is no longer available.
        </div>
      ) : null}
    </>
  );
}
