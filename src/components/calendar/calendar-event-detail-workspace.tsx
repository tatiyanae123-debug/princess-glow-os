'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, CalendarDays, Clock3, MapPin, Sparkles } from 'lucide-react';
import { EventForm } from '@/components/calendar/event-form';
import type { CalendarEvent } from '@/lib/types';

function dateTime(value: Date | null | undefined) {
  if (!value) return 'Not set';
  return value.toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export function CalendarEventDetailWorkspace({ event }: { event: CalendarEvent }) {
  const router = useRouter();

  return (
    <div className="grid gap-4 md:grid-cols-[1.05fr_.95fr]">
      <section className="editorial-surface p-4 sm:p-5">
        <button type="button" onClick={() => router.back()} className="mb-4 inline-flex items-center gap-1.5 text-[8px] text-[#887a72]">
          <ArrowLeft size={11} /> Back
        </button>
        <p className="glow-eyebrow">Canonical calendar event</p>
        <h2 className="glow-display mt-2 text-[28px] leading-tight text-[#332c28]">{event.title}</h2>
        <div className="mt-4 space-y-2">
          <div className="flex items-start gap-2 rounded-[12px] bg-white/42 p-3"><CalendarDays size={12} className="mt-0.5 text-[#8c7e76]"/><div><p className="text-[6.5px] uppercase tracking-[.14em] text-[#9b8c84]">Starts</p><p className="mt-1 text-[9px] text-[#514740]">{event.allDay ? event.startAt.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' }) + ' · All day' : dateTime(event.startAt)}</p></div></div>
          <div className="flex items-start gap-2 rounded-[12px] bg-white/42 p-3"><Clock3 size={12} className="mt-0.5 text-[#8c7e76]"/><div><p className="text-[6.5px] uppercase tracking-[.14em] text-[#9b8c84]">Ends</p><p className="mt-1 text-[9px] text-[#514740]">{dateTime(event.endAt)}</p></div></div>
          <div className="flex items-start gap-2 rounded-[12px] bg-white/42 p-3"><MapPin size={12} className="mt-0.5 text-[#8c7e76]"/><div><p className="text-[6.5px] uppercase tracking-[.14em] text-[#9b8c84]">Location</p><p className="mt-1 text-[9px] text-[#514740]">{event.location || 'No location saved'}</p></div></div>
        </div>
        {event.description ? <p className="mt-4 whitespace-pre-wrap text-[9px] leading-5 text-[#73665f]">{event.description}</p> : <div className="mt-4 rounded-[12px] border border-dashed border-[#ddd1c9] p-3 text-[8px] italic text-[#9b8d84]">No notes are attached to this event.</div>}
      </section>

      <section className="editorial-surface p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-2"><Sparkles size={13} className="text-[#8d7ea2]" /><div><p className="glow-eyebrow">Edit event</p><p className="glow-display text-[18px] text-[#443a35]">Change the real event</p></div></div>
        <EventForm
          event={event}
          onSaved={() => router.refresh()}
          onCancel={() => router.back()}
        />
      </section>
    </div>
  );
}
