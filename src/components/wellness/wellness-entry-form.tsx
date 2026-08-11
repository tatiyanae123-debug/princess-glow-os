'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FieldWrapper, TextInput, TextArea, SelectInput } from '@/components/ui/form-field';
import { useServerAction } from '@/lib/hooks/use-server-action';
import { createWellnessEntryAction, updateWellnessEntryAction } from '@/app/actions/wellness-entries';
import type { WellnessEntry } from '@/lib/types';

type WellnessFormValues = {
  entryDate: string;
  mood: string;
  energy: string;
  stressLevel: string;
  sleepHours: string;
  waterGlasses: string;
  notes: string;
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function toFormValues(entry?: WellnessEntry | null): WellnessFormValues {
  return {
    entryDate: entry?.entryDate ?? todayKey(),
    mood: entry?.mood ?? '',
    energy: entry?.energy ?? '',
    stressLevel: entry?.stressLevel != null ? String(entry.stressLevel) : '',
    sleepHours: entry?.sleepHours != null ? String(entry.sleepHours) : '',
    waterGlasses: entry?.waterGlasses != null ? String(entry.waterGlasses) : '',
    notes: entry?.notes ?? '',
  };
}

export function WellnessEntryForm({
  entry,
  onSaved,
  onCancel,
}: {
  entry?: WellnessEntry | null;
  onSaved: (entry: WellnessEntry) => void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<WellnessFormValues>(() => toFormValues(entry));
  const create = useServerAction(createWellnessEntryAction);
  const update = useServerAction((input: Record<string, unknown>) => updateWellnessEntryAction(entry?.id ?? '', input));
  const active = entry ? update : create;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const payload = {
      entryDate: values.entryDate,
      mood: values.mood || undefined,
      energy: values.energy || undefined,
      stressLevel: values.stressLevel ? Number(values.stressLevel) : undefined,
      sleepHours: values.sleepHours ? Number(values.sleepHours) : undefined,
      waterGlasses: values.waterGlasses ? Number(values.waterGlasses) : undefined,
      notes: values.notes || undefined,
    };
    if (entry) {
      update.run(payload, (data) => onSaved(data as WellnessEntry));
    } else {
      create.run(payload, (data) => onSaved(data as WellnessEntry));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FieldWrapper label="Date">
        <TextInput
          type="date"
          value={values.entryDate}
          onChange={(e) => setValues((v) => ({ ...v, entryDate: e.target.value }))}
          required
        />
      </FieldWrapper>
      <div className="grid grid-cols-2 gap-3">
        <FieldWrapper label="Mood">
          <SelectInput value={values.mood} onChange={(e) => setValues((v) => ({ ...v, mood: e.target.value }))}>
            <option value="">–</option>
            <option value="great">Great</option>
            <option value="good">Good</option>
            <option value="okay">Okay</option>
            <option value="low">Low</option>
            <option value="rough">Rough</option>
          </SelectInput>
        </FieldWrapper>
        <FieldWrapper label="Energy">
          <SelectInput value={values.energy} onChange={(e) => setValues((v) => ({ ...v, energy: e.target.value }))}>
            <option value="">–</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="exhausted">Exhausted</option>
          </SelectInput>
        </FieldWrapper>
      </div>
      <FieldWrapper label="Stress">
        <SelectInput value={values.stressLevel} onChange={(e) => setValues((v) => ({ ...v, stressLevel: e.target.value }))}>
          <option value="">–</option>
          <option value="1">1 · Calm</option>
          <option value="2">2 · Light</option>
          <option value="3">3 · Moderate</option>
          <option value="4">4 · High</option>
          <option value="5">5 · Overwhelmed</option>
        </SelectInput>
      </FieldWrapper>
      <div className="grid grid-cols-2 gap-3">
        <FieldWrapper label="Sleep (hours)">
          <TextInput
            type="number"
            min={0}
            max={24}
            step={0.5}
            value={values.sleepHours}
            onChange={(e) => setValues((v) => ({ ...v, sleepHours: e.target.value }))}
          />
        </FieldWrapper>
        <FieldWrapper label="Water (glasses)">
          <TextInput
            type="number"
            min={0}
            max={30}
            value={values.waterGlasses}
            onChange={(e) => setValues((v) => ({ ...v, waterGlasses: e.target.value }))}
          />
        </FieldWrapper>
      </div>
      <FieldWrapper label="Notes">
        <TextArea
          value={values.notes}
          onChange={(e) => setValues((v) => ({ ...v, notes: e.target.value }))}
          placeholder="Optional details"
        />
      </FieldWrapper>
      {active.error && <p className="text-sm text-rose-500">{active.error}</p>}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={active.isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={active.isPending}>
          {active.isPending ? 'Saving…' : entry ? 'Save changes' : 'Log check-in'}
        </Button>
      </div>
    </form>
  );
}
