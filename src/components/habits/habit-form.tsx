'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FieldWrapper, TextInput, TextArea, SelectInput } from '@/components/ui/form-field';
import { useServerAction } from '@/lib/hooks/use-server-action';
import { createHabitAction, updateHabitAction } from '@/app/actions/habits';
import type { Habit } from '@/lib/types';

type HabitFormValues = {
  name: string;
  description: string;
  frequency: Habit['frequency'];
  targetCount: number;
  color: string;
};

function toFormValues(habit?: Habit | null): HabitFormValues {
  return {
    name: habit?.name ?? '',
    description: habit?.description ?? '',
    frequency: habit?.frequency ?? 'daily',
    targetCount: habit?.targetCount ?? 1,
    color: habit?.color ?? '#f43f5e',
  };
}

export function HabitForm({
  habit,
  onSaved,
  onCancel,
}: {
  habit?: Habit | null;
  onSaved: (habit: Habit) => void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<HabitFormValues>(() => toFormValues(habit));
  const create = useServerAction(createHabitAction);
  const update = useServerAction((input: Record<string, unknown>) => updateHabitAction(habit?.id ?? '', input));
  const active = habit ? update : create;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const payload = {
      name: values.name,
      description: values.description || undefined,
      frequency: values.frequency,
      targetCount: Number(values.targetCount) || 1,
      color: values.color,
    };
    if (habit) {
      update.run(payload, (data) => onSaved(data as Habit));
    } else {
      create.run(payload, (data) => onSaved(data as Habit));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FieldWrapper label="Name">
        <TextInput
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
          placeholder="e.g. Morning skincare"
          required
        />
      </FieldWrapper>
      <FieldWrapper label="Notes">
        <TextArea
          value={values.description}
          onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
          placeholder="Optional details"
        />
      </FieldWrapper>
      <div className="grid grid-cols-2 gap-3">
        <FieldWrapper label="Frequency">
          <SelectInput
            value={values.frequency}
            onChange={(e) => setValues((v) => ({ ...v, frequency: e.target.value as Habit['frequency'] }))}
          >
            <option value="daily">Daily</option>
            <option value="weekdays">Weekdays</option>
            <option value="weekends">Weekends</option>
            <option value="weekly">Weekly</option>
            <option value="custom">Custom</option>
          </SelectInput>
        </FieldWrapper>
        <FieldWrapper label="Target per day">
          <TextInput
            type="number"
            min={1}
            value={values.targetCount}
            onChange={(e) => setValues((v) => ({ ...v, targetCount: Number(e.target.value) }))}
          />
        </FieldWrapper>
      </div>
      <FieldWrapper label="Color">
        <input
          type="color"
          value={values.color}
          onChange={(e) => setValues((v) => ({ ...v, color: e.target.value }))}
          className="h-10 w-16 cursor-pointer rounded-xl border"
          style={{ borderColor: 'var(--glow-border)' }}
        />
      </FieldWrapper>
      {active.error && <p className="text-sm text-rose-500">{active.error}</p>}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={active.isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={active.isPending}>
          {active.isPending ? 'Saving…' : habit ? 'Save changes' : 'Add habit'}
        </Button>
      </div>
    </form>
  );
}
