'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FieldWrapper, TextInput, TextArea, SelectInput } from '@/components/ui/form-field';
import { useServerAction } from '@/lib/hooks/use-server-action';
import { createGoalAction, updateGoalAction } from '@/app/actions/goals';
import type { Goal } from '@/lib/types';

type GoalFormValues = {
  title: string;
  description: string;
  category: Goal['category'];
  status: Goal['status'];
  targetDate: string;
  progress: number;
};

function toFormValues(goal?: Goal | null): GoalFormValues {
  return {
    title: goal?.title ?? '',
    description: goal?.description ?? '',
    category: goal?.category ?? 'personal',
    status: goal?.status ?? 'not_started',
    targetDate: goal?.targetDate ? goal.targetDate.toISOString().slice(0, 10) : '',
    progress: goal?.progress ?? 0,
  };
}

export function GoalForm({
  goal,
  onSaved,
  onCancel,
}: {
  goal?: Goal | null;
  onSaved: (goal: Goal) => void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<GoalFormValues>(() => toFormValues(goal));
  const create = useServerAction(createGoalAction);
  const update = useServerAction((input: Record<string, unknown>) => updateGoalAction(goal?.id ?? '', input));
  const active = goal ? update : create;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const payload = {
      title: values.title,
      description: values.description || undefined,
      category: values.category,
      status: values.status,
      targetDate: values.targetDate || undefined,
      progress: Number(values.progress) || 0,
    };
    if (goal) {
      update.run(payload, (data) => onSaved(data as Goal));
    } else {
      create.run(payload, (data) => onSaved(data as Goal));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FieldWrapper label="Title">
        <TextInput
          value={values.title}
          onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
          placeholder="What are you working toward?"
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
      <div className="grid grid-cols-2 gap-3">
        <FieldWrapper label="Category">
          <SelectInput
            value={values.category}
            onChange={(e) => setValues((v) => ({ ...v, category: e.target.value as Goal['category'] }))}
          >
            {['health', 'career', 'finance', 'personal', 'relationships', 'learning', 'travel', 'other'].map((c) => (
              <option key={c} value={c}>
                {c[0].toUpperCase() + c.slice(1)}
              </option>
            ))}
          </SelectInput>
        </FieldWrapper>
        <FieldWrapper label="Status">
          <SelectInput
            value={values.status}
            onChange={(e) => setValues((v) => ({ ...v, status: e.target.value as Goal['status'] }))}
          >
            <option value="not_started">Not started</option>
            <option value="in_progress">In progress</option>
            <option value="achieved">Achieved</option>
            <option value="paused">Paused</option>
            <option value="abandoned">Abandoned</option>
          </SelectInput>
        </FieldWrapper>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FieldWrapper label="Target date">
          <TextInput
            type="date"
            value={values.targetDate}
            onChange={(e) => setValues((v) => ({ ...v, targetDate: e.target.value }))}
          />
        </FieldWrapper>
        <FieldWrapper label="Progress (%)">
          <TextInput
            type="number"
            min={0}
            max={100}
            value={values.progress}
            onChange={(e) => setValues((v) => ({ ...v, progress: Number(e.target.value) }))}
          />
        </FieldWrapper>
      </div>
      {active.error && <p className="text-sm text-rose-500">{active.error}</p>}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={active.isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={active.isPending}>
          {active.isPending ? 'Saving…' : goal ? 'Save changes' : 'Add goal'}
        </Button>
      </div>
    </form>
  );
}
