'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FieldWrapper, TextInput, TextArea, SelectInput } from '@/components/ui/form-field';
import { useServerAction } from '@/lib/hooks/use-server-action';
import { createBeautyRoutineAction, updateBeautyRoutineAction } from '@/app/actions/beauty-routines';
import type { BeautyRoutine } from '@/lib/types';

type BeautyFormValues = {
  name: string;
  timeOfDay: BeautyRoutine['timeOfDay'];
  products: string;
  notes: string;
};

function toFormValues(routine?: BeautyRoutine | null): BeautyFormValues {
  return {
    name: routine?.name ?? '',
    timeOfDay: routine?.timeOfDay ?? 'morning',
    products: routine?.products?.join(', ') ?? '',
    notes: routine?.notes ?? '',
  };
}

export function BeautyRoutineForm({
  routine,
  onSaved,
  onCancel,
}: {
  routine?: BeautyRoutine | null;
  onSaved: (routine: BeautyRoutine) => void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<BeautyFormValues>(() => toFormValues(routine));
  const create = useServerAction(createBeautyRoutineAction);
  const update = useServerAction((input: Record<string, unknown>) => updateBeautyRoutineAction(routine?.id ?? '', input));
  const active = routine ? update : create;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const products = values.products
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);
    const payload = {
      name: values.name,
      timeOfDay: values.timeOfDay,
      products: products.length > 0 ? products : undefined,
      notes: values.notes || undefined,
    };
    if (routine) {
      update.run(payload, (data) => onSaved(data as BeautyRoutine));
    } else {
      create.run(payload, (data) => onSaved(data as BeautyRoutine));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FieldWrapper label="Step name">
        <TextInput
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
          placeholder="e.g. Skincare AM"
          required
        />
      </FieldWrapper>
      <FieldWrapper label="Time of day">
        <SelectInput
          value={values.timeOfDay}
          onChange={(e) => setValues((v) => ({ ...v, timeOfDay: e.target.value as BeautyRoutine['timeOfDay'] }))}
        >
          <option value="morning">Morning</option>
          <option value="afternoon">Afternoon</option>
          <option value="evening">Evening</option>
          <option value="night">Night</option>
          <option value="anytime">Anytime</option>
        </SelectInput>
      </FieldWrapper>
      <FieldWrapper label="Products (comma separated)">
        <TextInput
          value={values.products}
          onChange={(e) => setValues((v) => ({ ...v, products: e.target.value }))}
          placeholder="Cleanser, toner, serum"
        />
      </FieldWrapper>
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
          {active.isPending ? 'Saving…' : routine ? 'Save changes' : 'Add step'}
        </Button>
      </div>
    </form>
  );
}
