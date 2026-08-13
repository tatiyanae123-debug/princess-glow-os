'use client';

import { useState } from 'react';
import { Briefcase, Pencil, Plus, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useServerAction } from '@/lib/hooks/use-server-action';
import { createWorkScheduleAction, deleteWorkScheduleAction, updateWorkScheduleAction } from '@/app/actions/work-schedules';

type WorkSchedule = {
  id: string;
  title: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  notes: string | null;
};

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
const fieldClass = 'w-full rounded-lg border border-[#F1E7E3] px-3.5 py-2.5 text-[12px] text-[#2B2420] placeholder:text-[#B5ACA5] focus:border-[#C9727E] focus:outline-none';

function formatTime(value: string) {
  const [h, m] = value.split(':');
  const hour = Number(h);
  const period = hour >= 12 ? 'PM' : 'AM';
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}:${m} ${period}`;
}

function ScheduleForm({ schedule, onSaved, onCancel }: { schedule: WorkSchedule | null; onSaved: (s: WorkSchedule) => void; onCancel: () => void }) {
  const [values, setValues] = useState({
    title: schedule?.title ?? '',
    dayOfWeek: schedule?.dayOfWeek ?? 'monday',
    startTime: schedule?.startTime?.slice(0, 5) ?? '',
    endTime: schedule?.endTime?.slice(0, 5) ?? '',
    notes: schedule?.notes ?? '',
  });
  const create = useServerAction(createWorkScheduleAction);
  const update = useServerAction((input: Record<string, unknown>) => updateWorkScheduleAction(schedule!.id, input));
  const action = schedule ? update : create;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const payload = {
      title: values.title,
      dayOfWeek: values.dayOfWeek,
      startTime: values.startTime,
      endTime: values.endTime,
      notes: values.notes || undefined,
    };
    action.run(payload, (result) => onSaved(result as unknown as WorkSchedule));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input required value={values.title} onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))} placeholder="Shift name, e.g. Morning shift" className={fieldClass} />
      <select value={values.dayOfWeek} onChange={(e) => setValues((v) => ({ ...v, dayOfWeek: e.target.value }))} className={fieldClass}>
        {DAYS.map((day) => <option key={day} value={day}>{day.charAt(0).toUpperCase() + day.slice(1)}</option>)}
      </select>
      <div className="grid grid-cols-2 gap-2">
        <input type="time" required value={values.startTime} onChange={(e) => setValues((v) => ({ ...v, startTime: e.target.value }))} className={fieldClass} />
        <input type="time" required value={values.endTime} onChange={(e) => setValues((v) => ({ ...v, endTime: e.target.value }))} className={fieldClass} />
      </div>
      <textarea rows={3} value={values.notes} onChange={(e) => setValues((v) => ({ ...v, notes: e.target.value }))} placeholder="Notes" className={fieldClass} />
      {action.error ? <p className="text-[11px] text-[#B15A68]">{action.error}</p> : null}
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={action.isPending}>Cancel</Button>
        <Button type="submit" disabled={action.isPending}>{action.isPending ? 'Saving…' : 'Save shift'}</Button>
      </div>
    </form>
  );
}

export function WorkScheduleManager({ initialSchedules }: { initialSchedules: WorkSchedule[] }) {
  const [schedules, setSchedules] = useState<WorkSchedule[]>(initialSchedules);
  const [dialogSchedule, setDialogSchedule] = useState<WorkSchedule | 'new' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WorkSchedule | null>(null);
  const del = useServerAction((id: string) => deleteWorkScheduleAction(id));

  function handleSaved(schedule: WorkSchedule) {
    setSchedules((current) => {
      const exists = current.some((s) => s.id === schedule.id);
      return exists ? current.map((s) => (s.id === schedule.id ? schedule : s)) : [schedule, ...current];
    });
    setDialogSchedule(null);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    del.run(deleteTarget.id, () => {
      setSchedules((current) => current.filter((s) => s.id !== deleteTarget.id));
      setDeleteTarget(null);
    });
  }

  const byDay = DAYS.map((day) => ({ day, shifts: schedules.filter((s) => s.dayOfWeek === day) }));
  const weeklyHours = schedules.reduce((sum, s) => {
    const [sh, sm] = s.startTime.split(':').map(Number);
    const [eh, em] = s.endTime.split(':').map(Number);
    const minutes = (eh * 60 + em) - (sh * 60 + sm);
    return sum + Math.max(0, minutes) / 60;
  }, 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <Card>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div><p className="text-[10px] uppercase tracking-[.12em] text-[#B5ACA5]">Shifts this week</p><p className="glow-display mt-1 text-[24px] text-[#2B2420]">{schedules.length}</p></div>
            <div><p className="text-[10px] uppercase tracking-[.12em] text-[#B5ACA5]">Scheduled hours</p><p className="glow-display mt-1 text-[24px] text-[#2B2420]">{weeklyHours.toFixed(1)}h</p></div>
            <div className="hidden sm:block"><p className="text-[10px] uppercase tracking-[.12em] text-[#B5ACA5]">Days covered</p><p className="glow-display mt-1 text-[24px] text-[#2B2420]">{byDay.filter((d) => d.shifts.length > 0).length}/7</p></div>
          </div>
        </Card>
        <Button onClick={() => setDialogSchedule('new')} className="flex h-fit items-center gap-1.5 self-center"><Plus size={14} />Add shift</Button>
      </div>

      {schedules.length === 0 ? (
        <Card className="p-8 text-center">
          <Briefcase className="mx-auto text-[#C9727E]" size={22} />
          <p className="glow-display mt-3 text-[18px] text-[#2B2420]">No work schedule yet.</p>
          <p className="mx-auto mt-2 max-w-md text-[12px] leading-4 text-[#8A8078]">Add your recurring shifts so Glow OS can plan your days and weeks around real work hours.</p>
          <Button onClick={() => setDialogSchedule('new')} className="mt-4"><Plus size={12} className="mr-1" />Add your first shift</Button>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {byDay.map(({ day, shifts }) => (
            <Card key={day} className={shifts.length ? '' : 'opacity-60'}>
              <p className="text-[11px] font-semibold capitalize text-[#2B2420]">{day}</p>
              {shifts.length === 0 ? (
                <p className="mt-2 text-[10.5px] text-[#B5ACA5]">No shift</p>
              ) : (
                <div className="mt-2 space-y-2">
                  {shifts.map((s) => (
                    <div key={s.id} className="rounded-[12px] border border-[#F1E7E3] bg-[#FDF8F6] p-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[11.5px] font-medium text-[#2B2420]">{s.title}</p>
                        <div className="flex gap-1">
                          <button type="button" onClick={() => setDialogSchedule(s)} aria-label="Edit shift" className="rounded-full p-1 text-[#8A8078] hover:bg-white"><Pencil size={11} /></button>
                          <button type="button" onClick={() => setDeleteTarget(s)} aria-label="Delete shift" className="rounded-full p-1 text-[#8A8078] hover:bg-white"><Trash2 size={11} /></button>
                        </div>
                      </div>
                      <p className="mt-1 text-[10.5px] text-[#8A8078]">{formatTime(s.startTime)} – {formatTime(s.endTime)}</p>
                      {s.notes ? <p className="mt-1 text-[10px] leading-4 text-[#9A9088]">{s.notes}</p> : null}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogSchedule !== null} onClose={() => setDialogSchedule(null)} title={dialogSchedule === 'new' ? 'Add shift' : 'Edit shift'}>
        <ScheduleForm schedule={dialogSchedule === 'new' ? null : dialogSchedule} onSaved={handleSaved} onCancel={() => setDialogSchedule(null)} />
      </Dialog>
      <ConfirmDialog open={deleteTarget !== null} title="Delete this shift?" description={deleteTarget ? `"${deleteTarget.title}" will be removed.` : undefined} pending={del.isPending} onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} />
    </div>
  );
}
