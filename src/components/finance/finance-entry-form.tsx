'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FieldWrapper, TextInput, TextArea, SelectInput } from '@/components/ui/form-field';
import { useServerAction } from '@/lib/hooks/use-server-action';
import { createFinanceEntryAction, updateFinanceEntryAction } from '@/app/actions/finance-entries';
import type { FinanceEntry } from '@/lib/types';

const CATEGORIES = [
  'salary',
  'food',
  'transport',
  'beauty',
  'health',
  'entertainment',
  'utilities',
  'subscriptions',
  'shopping',
  'savings',
  'investments',
  'other',
];

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

type FinanceFormValues = {
  title: string;
  amount: string;
  type: FinanceEntry['type'];
  category: FinanceEntry['category'];
  entryDate: string;
  notes: string;
};

function toFormValues(entry?: FinanceEntry | null): FinanceFormValues {
  return {
    title: entry?.title ?? '',
    amount: entry?.amount ?? '',
    type: entry?.type ?? 'expense',
    category: entry?.category ?? 'other',
    entryDate: entry?.entryDate ?? todayKey(),
    notes: entry?.notes ?? '',
  };
}

export function FinanceEntryForm({
  entry,
  onSaved,
  onCancel,
}: {
  entry?: FinanceEntry | null;
  onSaved: (entry: FinanceEntry) => void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<FinanceFormValues>(() => toFormValues(entry));
  const create = useServerAction(createFinanceEntryAction);
  const update = useServerAction((input: Record<string, unknown>) => updateFinanceEntryAction(entry?.id ?? '', input));
  const active = entry ? update : create;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const payload = {
      title: values.title,
      amount: values.amount,
      type: values.type,
      category: values.category,
      entryDate: values.entryDate,
      notes: values.notes || undefined,
    };
    if (entry) {
      update.run(payload, (data) => onSaved(data as FinanceEntry));
    } else {
      create.run(payload, (data) => onSaved(data as FinanceEntry));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FieldWrapper label="Title">
        <TextInput
          value={values.title}
          onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
          placeholder="e.g. Bloomingdale's shift pay"
          required
        />
      </FieldWrapper>
      <div className="grid grid-cols-2 gap-3">
        <FieldWrapper label="Amount">
          <TextInput
            inputMode="decimal"
            value={values.amount}
            onChange={(e) => setValues((v) => ({ ...v, amount: e.target.value }))}
            placeholder="0.00"
            required
          />
        </FieldWrapper>
        <FieldWrapper label="Type">
          <SelectInput
            value={values.type}
            onChange={(e) => setValues((v) => ({ ...v, type: e.target.value as FinanceEntry['type'] }))}
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
            <option value="saving">Saving</option>
            <option value="investment">Investment</option>
          </SelectInput>
        </FieldWrapper>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FieldWrapper label="Category">
          <SelectInput
            value={values.category}
            onChange={(e) => setValues((v) => ({ ...v, category: e.target.value as FinanceEntry['category'] }))}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c[0].toUpperCase() + c.slice(1)}
              </option>
            ))}
          </SelectInput>
        </FieldWrapper>
        <FieldWrapper label="Date">
          <TextInput
            type="date"
            value={values.entryDate}
            onChange={(e) => setValues((v) => ({ ...v, entryDate: e.target.value }))}
            required
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
          {active.isPending ? 'Saving…' : entry ? 'Save changes' : 'Add entry'}
        </Button>
      </div>
    </form>
  );
}
