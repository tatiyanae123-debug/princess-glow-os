'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FieldWrapper, TextInput, TextArea, SelectInput } from '@/components/ui/form-field';
import { useServerAction } from '@/lib/hooks/use-server-action';
import { createRoutineAction, updateRoutineAction } from '@/app/actions/routines';
import type { Routine } from '@/lib/types';

const DAYS = [
  { value: 'monday', label: 'Mon' },
  { value: 'tuesday', label: 'Tue' },
  { value: 'wednesday', label: 'Wed' },
  { value: 'thursday', label: 'Thu' },
  { value: 'friday', label: 'Fri' },
  { value: 'saturday', label: 'Sat' },
  { value: 'sunday', label: 'Sun' },
];

type RoutineFormValues = {
  name: string;
  description: string;
  timeOfDay: Routine['timeOfDay'];
  daysOfWeek: string[];
};

function toFormValues(routine?: Routine | null): RoutineFormValues {
  return {
    name: routine?.name ?? '',
    description: routine?.description ?? '',
    timeOfDay: routine?.timeOfDay ?? 'morning',
    daysOfWeek: routine?.daysOfWeek ?? [],
  };
}

export function RoutineForm({
  routine,
  onSaved,
  onCancel,
}: {
  routine?: Routine | null;
  onSaved: (routine: Routine) => void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<RoutineFormValues>(() => toFormValues(routine));
  const create = useServerAction(createRoutineAction);
  const update = useServerAction((input: Record<string, unknown>) => updateRoutineAction(routine?.id ?? '', input));
  const active = routine ? update : create;

  function toggleDay(day: string) {
    setValues((v) => ({
      ...v,
      daysOfWeek: v.daysOfWeek.includes(day) ? v.daysOfWeek.filter((d) => d !== day) : [...v.daysOfWeek, day],
    }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const payload = {
      name: values.name,
      description: values.description || undefined,
      timeOfDay: values.timeOfDay,
      daysOfWeek: values.daysOfWeek.length > 0 ? values.daysOfWeek : undefined,
    };
    if (routine) {
      update.run(payload, (data) => onSaved(data as Routine));
    } else {
      create.run(payload, (data) => onSaved(data as Routine));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FieldWrapper label="Name">
        <TextInput
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
          placeholder="e.g. Morning Activation"
          required
        />
      </FieldWrapper>
      <FieldWrapper label="Description">
        <TextArea
          value={values.description}
          onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
          placeholder="Optional details"
        />
      </FieldWrapper>
      <FieldWrapper label="Time of day">
        <SelectInput
          value={values.timeOfDay}
          onChange={(e) => setValues((v) => ({ ...v, timeOfDay: e.target.value as Routine['timeOfDay'] }))}
        >
          <option value="morning">Morning</option>
          <option value="afternoon">Afternoon</option>
          <option value="evening">Evening</option>
          <option value="night">Night</option>
          <option value="anytime">Anytime</option>
        </SelectInput>
      </FieldWrapper>
      <FieldWrapper label="Days (leave blank for every day)">
        <div className="flex flex-wrap gap-2">
          {DAYS.map((day) => {
            const active = values.daysOfWeek.includes(day.value);
            return (
              <button
                key={day.value}
                type="button"
                onClick={() => toggleDay(day.value)}
                className="rounded-full px-3 py-1.5 text-xs font-medium transition"
                style={{
                  background: active ? 'var(--glow-accent)' : 'var(--glow-surface-muted)',
                  color: active ? '#fff' : 'var(--glow-text-muted)',
                  border: '1px solid var(--glow-border)',
                }}
              >
                {day.label}
              </button>
            );
          })}
        </div>
      </FieldWrapper>
      {active.error && <p className="text-sm text-rose-500">{active.error}</p>}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={active.isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={active.isPending}>
          {active.isPending ? 'Saving…' : routine ? 'Save changes' : 'Add routine'}
        </Button>
      </div>
    </form>
  );
}
