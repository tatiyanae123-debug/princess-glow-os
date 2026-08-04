'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FieldWrapper, TextInput, TextArea, SelectInput } from '@/components/ui/form-field';
import { useServerAction } from '@/lib/hooks/use-server-action';
import { createTaskAction, updateTaskAction } from '@/app/actions/tasks';
import type { Task } from '@/lib/types';

type TaskFormValues = {
  title: string;
  description: string;
  status: Task['status'];
  priority: Task['priority'];
  dueDate: string;
};

function toFormValues(task?: Task | null): TaskFormValues {
  return {
    title: task?.title ?? '',
    description: task?.description ?? '',
    status: task?.status ?? 'pending',
    priority: task?.priority ?? 'medium',
    dueDate: task?.dueDate ? task.dueDate.toISOString().slice(0, 10) : '',
  };
}

export function TaskForm({
  task,
  onSaved,
  onCancel,
}: {
  task?: Task | null;
  onSaved: (task: Task) => void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<TaskFormValues>(() => toFormValues(task));
  const create = useServerAction(createTaskAction);
  const update = useServerAction((input: Record<string, unknown>) => updateTaskAction(task?.id ?? '', input));
  const active = task ? update : create;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const payload = {
      title: values.title,
      description: values.description || undefined,
      status: values.status,
      priority: values.priority,
      dueDate: values.dueDate || undefined,
    };
    if (task) {
      update.run(payload, (data) => onSaved(data as Task));
    } else {
      create.run(payload, (data) => onSaved(data as Task));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FieldWrapper label="Title">
        <TextInput
          value={values.title}
          onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
          placeholder="What needs to happen?"
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
        <FieldWrapper label="Priority">
          <SelectInput
            value={values.priority}
            onChange={(e) => setValues((v) => ({ ...v, priority: e.target.value as Task['priority'] }))}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </SelectInput>
        </FieldWrapper>
        <FieldWrapper label="Status">
          <SelectInput
            value={values.status}
            onChange={(e) => setValues((v) => ({ ...v, status: e.target.value as Task['status'] }))}
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In progress</option>
            <option value="done">Done</option>
            <option value="cancelled">Cancelled</option>
          </SelectInput>
        </FieldWrapper>
      </div>
      <FieldWrapper label="Due date">
        <TextInput
          type="date"
          value={values.dueDate}
          onChange={(e) => setValues((v) => ({ ...v, dueDate: e.target.value }))}
        />
      </FieldWrapper>
      {active.error && <p className="text-sm text-rose-500">{active.error}</p>}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={active.isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={active.isPending}>
          {active.isPending ? 'Saving…' : task ? 'Save changes' : 'Add task'}
        </Button>
      </div>
    </form>
  );
}
