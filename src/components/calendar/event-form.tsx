'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FieldWrapper, TextInput, TextArea } from '@/components/ui/form-field';
import { useServerAction } from '@/lib/hooks/use-server-action';
import { createCalendarEventAction, updateCalendarEventAction } from '@/app/actions/calendar-events';
import type { CalendarEvent } from '@/lib/types';

type EventFormValues = {
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  location: string;
  allDay: boolean;
};

function toLocalInput(date: Date | null | undefined) {
  if (!date) return '';
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

function toFormValues(event?: CalendarEvent | null, initialTitle?: string | null): EventFormValues {
  return {
    title: event?.title ?? initialTitle ?? '',
    description: event?.description ?? '',
    startAt: toLocalInput(event?.startAt),
    endAt: toLocalInput(event?.endAt),
    location: event?.location ?? '',
    allDay: event?.allDay ?? false,
  };
}

export function EventForm({
  event,
  initialTitle,
  onSaved,
  onCancel,
}: {
  event?: CalendarEvent | null;
  initialTitle?: string | null;
  onSaved: (event: CalendarEvent) => void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<EventFormValues>(() => toFormValues(event, initialTitle));
  const create = useServerAction(createCalendarEventAction);
  const update = useServerAction((input: Record<string, unknown>) => updateCalendarEventAction(event?.id ?? '', input));
  const active = event ? update : create;

  function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();
    const payload = {
      title: values.title,
      description: values.description || undefined,
      startAt: values.startAt,
      endAt: values.endAt || undefined,
      location: values.location || undefined,
      allDay: values.allDay,
    };
    if (event) {
      update.run(payload, (data) => onSaved(data as CalendarEvent));
    } else {
      create.run(payload, (data) => onSaved(data as CalendarEvent));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!event && initialTitle ? (
        <p className="rounded-[12px] bg-[#FDF8F6] px-3 py-2 text-[11px] leading-4 text-[#8A8078]">Pre-filled from Gmail. Review the details before saving — nothing is created until you submit.</p>
      ) : null}
      <FieldWrapper label="Title">
        <TextInput
          value={values.title}
          onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
          placeholder="What's happening?"
          required
        />
      </FieldWrapper>
      <div className="grid grid-cols-2 gap-3">
        <FieldWrapper label="Starts">
          <TextInput
            type="datetime-local"
            value={values.startAt}
            onChange={(e) => setValues((v) => ({ ...v, startAt: e.target.value }))}
            required
          />
        </FieldWrapper>
        <FieldWrapper label="Ends">
          <TextInput
            type="datetime-local"
            value={values.endAt}
            onChange={(e) => setValues((v) => ({ ...v, endAt: e.target.value }))}
          />
        </FieldWrapper>
      </div>
      <FieldWrapper label="Location">
        <TextInput
          value={values.location}
          onChange={(e) => setValues((v) => ({ ...v, location: e.target.value }))}
          placeholder="Optional"
        />
      </FieldWrapper>
      <FieldWrapper label="Notes">
        <TextArea
          value={values.description}
          onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
          placeholder="Optional details"
        />
      </FieldWrapper>
      <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--glow-text-muted)' }}>
        <input
          type="checkbox"
          checked={values.allDay}
          onChange={(e) => setValues((v) => ({ ...v, allDay: e.target.checked }))}
          className="h-4 w-4 rounded"
        />
        All day
      </label>
      {active.error && <p className="text-sm text-rose-500">{active.error}</p>}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={active.isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={active.isPending}>
          {active.isPending ? 'Saving…' : event ? 'Save changes' : 'Add event'}
        </Button>
      </div>
    </form>
  );
}
