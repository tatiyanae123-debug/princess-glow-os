'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Camera, CalendarDays, Droplets, PackageOpen, Play, Plus, Sparkles, ThermometerSun, Target, Waves } from 'lucide-react';
import { EditableRoomImage } from '@/components/media/editable-room-image';
import { RoutineStepPlayer } from '@/components/routines/routine-step-player';
import { createHairLogAction } from '@/app/actions/completion-v1';
import type { CalendarEvent, Goal, Routine, RoutineStep } from '@/lib/types';

type HairLog = { id: string; eventType: string; occurredAt: Date; style: string | null; products: string | null; heatUsed: boolean; notes: string | null; nextAction: string | null };
type TimelineEventLite = { id: string; title: string; occurredAt: Date; category: string; summary: string | null; imageUrl: string | null; relatedEntityType: string | null };

const dayMs = 86400000;
const fieldClass = 'w-full rounded-lg border border-[#F1E7E3] px-3 py-2.5 text-[11.5px]';

function isWash(eventType: string) {
  return /wash|shampoo|clarif|cleanse/i.test(eventType);
}
function isTreatment(eventType: string) {
  return /treat|mask|bond|protein|deep condition|scalp|oil/i.test(eventType);
}
function isHairAppointment(title: string, description: string | null) {
  return /hair|salon|trim|silk press|install|braid|loc|weave|color|dye|stylist|barber/i.test(`${title} ${description ?? ''}`);
}
function isHairGoal(title: string, description: string | null) {
  return /hair|scalp|growth|edges|silk press|braid|loc|protective style|length/i.test(`${title} ${description ?? ''}`);
}
function isHairRoutine(name: string) {
  return /hair|wash day|scalp|silk press|braid|protective|detangle/i.test(name);
}
function averageInterval(dates: Date[], fallbackDays: number) {
  if (dates.length < 2) return fallbackDays;
  const intervals = dates.slice(0, 6).map((date, index) => index < dates.length - 1 ? Math.max(1, Math.round((date.getTime() - dates[index + 1].getTime()) / dayMs)) : null).filter((v): v is number => v != null);
  if (!intervals.length) return fallbackDays;
  return Math.max(1, Math.round(intervals.reduce((sum, v) => sum + v, 0) / intervals.length));
}
function addDays(date: Date | undefined, days: number) {
  const next = new Date(date ?? new Date());
  next.setDate(next.getDate() + days);
  return next;
}
function fmt(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
function daysAgo(date: Date) {
  return Math.max(0, Math.round((Date.now() - date.getTime()) / dayMs));
}

export function HairExperience({
  logs,
  timeline,
  routines,
  routineSteps,
  events,
  goals,
}: {
  logs: HairLog[];
  timeline: TimelineEventLite[];
  routines: Routine[];
  routineSteps: RoutineStep[];
  events: CalendarEvent[];
  goals: Goal[];
}) {
  const [playingRoutine, setPlayingRoutine] = useState<Routine | null>(null);

  const last = logs[0] ?? null;
  const washLogs = logs.filter((log) => isWash(log.eventType));
  const treatmentLogs = logs.filter((log) => isTreatment(log.eventType));
  const washInterval = averageInterval(washLogs.map((l) => l.occurredAt), 7);
  const treatmentInterval = averageInterval(treatmentLogs.map((l) => l.occurredAt), 14);
  const nextWash = addDays(washLogs[0]?.occurredAt, washInterval);
  const nextTreatment = addDays(treatmentLogs[0]?.occurredAt, treatmentInterval);
  const heatCount30 = logs.filter((log) => log.heatUsed && Date.now() - log.occurredAt.getTime() <= 30 * dayMs).length;

  const productCounts = new Map<string, number>();
  logs.forEach((log) => log.products?.split(/[,;+]/).map((item) => item.trim()).filter(Boolean).forEach((product) => productCounts.set(product, (productCounts.get(product) ?? 0) + 1)));
  const shelf = [...productCounts.entries()].sort((a, b) => b[1] - a[1]);

  const photoJourney = timeline.filter((event) => event.imageUrl && (/hair/i.test(event.category) || /hair/i.test(event.title) || event.relatedEntityType === 'hair'));

  const hairRoutines = routines.filter((routine) => isHairRoutine(routine.name));
  const washDayRoutine = hairRoutines.find((routine) => /wash day/i.test(routine.name)) ?? null;
  const washDaySteps = washDayRoutine ? routineSteps.filter((step) => step.routineId === washDayRoutine.id).sort((a, b) => a.order - b.order) : [];

  const hairAppointments = events
    .filter((event) => event.startAt.getTime() >= Date.now() && isHairAppointment(event.title, event.description))
    .sort((a, b) => a.startAt.getTime() - b.startAt.getTime())
    .slice(0, 4);

  const hairGoals = goals.filter((goal) => isHairGoal(goal.title, goal.description) && goal.status !== 'achieved' && goal.status !== 'abandoned').slice(0, 3);

  const insight = washLogs.length >= 2
    ? `You tend to go about ${washInterval} days between wash days, based on your last ${Math.min(washLogs.length, 6)} entries.`
    : washLogs.length === 1
      ? "You've logged one wash so far — Glow will learn your rhythm as you add more."
      : 'Log a couple of wash days and Glow will start forecasting your rhythm here.';

  return (
    <div className="space-y-6">
      <div className="grid gap-5 lg:grid-cols-[1fr_1.05fr]">
        <div className="flex flex-col justify-center">
          <p className="text-[11px] font-semibold uppercase tracking-[.14em] text-[#C9727E]">Hair</p>
          <h1 className="glow-display mt-1 text-[38px] leading-[1.05] text-[#2B2420] sm:text-[44px]">Your hair,<br />understood over time.</h1>
          <p className="mt-3 max-w-md text-[13px] text-[#8A8078]">A private studio for wash days, treatments, products, and the rhythm that keeps it all healthy.</p>
        </div>
        <div className="overflow-hidden rounded-[20px] border border-[#F1E7E3]">
          <EditableRoomImage slot="hair:hero" label="Hair hero" className="min-h-[190px] sm:min-h-[230px]" />
        </div>
      </div>

      <div>
        <p className="text-[13px] font-medium text-[#2B2420]">Today&apos;s Hair</p>
        <div className="mt-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-4">
            <div className="flex items-center gap-1.5 text-[10.5px] font-medium text-[#9A9088]"><Sparkles size={12} className="text-[#C9727E]" />Current Style</div>
            <p className="glow-display mt-2 text-[17px] text-[#2B2420]">{last?.style ?? 'Not logged'}</p>
            {last ? <p className="mt-1 text-[10px] text-[#9A9088]">Since {fmt(last.occurredAt)}</p> : null}
          </div>
          <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-4">
            <div className="flex items-center gap-1.5 text-[10.5px] font-medium text-[#9A9088]"><Droplets size={12} className="text-[#7C6B9C]" />Last Wash</div>
            <p className="glow-display mt-2 text-[17px] text-[#2B2420]">{washLogs[0] ? `${daysAgo(washLogs[0].occurredAt)}d ago` : '—'}</p>
            {washLogs[0] ? <p className="mt-1 text-[10px] text-[#9A9088]">{fmt(washLogs[0].occurredAt)}</p> : null}
          </div>
          <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-4">
            <div className="flex items-center gap-1.5 text-[10.5px] font-medium text-[#9A9088]"><CalendarDays size={12} className="text-[#C9727E]" />Next Wash</div>
            <p className="glow-display mt-2 text-[17px] text-[#2B2420]">{fmt(nextWash)}</p>
            <p className="mt-1 text-[10px] text-[#9A9088]">~every {washInterval}d</p>
          </div>
          <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-4">
            <div className="flex items-center gap-1.5 text-[10.5px] font-medium text-[#9A9088]"><ThermometerSun size={12} className="text-[#9A6A3D]" />Heat / 30 days</div>
            <p className="glow-display mt-2 text-[17px] text-[#2B2420]">{heatCount30}</p>
            <p className="mt-1 text-[10px] text-[#9A9088]">{last?.nextAction ? `Next: ${last.nextAction}` : 'No action pending'}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5"><Waves size={14} className="text-[#C9727E]" /><p className="text-[13px] font-medium text-[#2B2420]">Wash Day</p></div>
            <span className="text-[10px] text-[#9A9088]">Next treatment {fmt(nextTreatment)}</span>
          </div>
          {washDayRoutine ? (
            <>
              <p className="mt-2 text-[11.5px] text-[#8A8078]">{washDaySteps.length} steps · {washDayRoutine.timeOfDay}</p>
              <button type="button" onClick={() => setPlayingRoutine(washDayRoutine)} className="mt-3 flex items-center gap-1.5 rounded-full bg-[#4A4440] px-4 py-2 text-[12px] font-medium text-white"><Play size={12} />Start Wash Day</button>
            </>
          ) : (
            <>
              <p className="mt-2 text-[11.5px] text-[#8A8078]">Build a &ldquo;Wash Day&rdquo; routine in Routines to unlock a guided, one-step-at-a-time wash day here.</p>
              <Link href="/routines" className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[#F1E7E3] px-4 py-2 text-[12px] font-medium text-[#4A4440]"><Plus size={12} />Create Wash Day routine</Link>
            </>
          )}
          <details className="mt-4 border-t border-[#F1E7E3] pt-3">
            <summary className="cursor-pointer text-[11.5px] font-medium text-[#C9727E]">Log wash day / treatment now</summary>
            <form action={createHairLogAction} className="mt-3 space-y-2">
              <input name="eventType" required placeholder="Wash day, bond treatment, trim…" className={fieldClass} />
              <input name="occurredAt" type="datetime-local" className={fieldClass} />
              <input name="style" placeholder="Style" className={fieldClass} />
              <input name="products" placeholder="Products used, separated by commas" className={fieldClass} />
              <label className="flex items-center gap-2 text-[11px] text-[#8A8078]"><input name="heatUsed" type="checkbox" />Heat used</label>
              <textarea name="notes" rows={2} placeholder="Buildup, breakage, scalp, shedding, moisture, result" className={fieldClass} />
              <input name="nextAction" placeholder="Next required action" className={fieldClass} />
              <button className="rounded-lg bg-[#4A4440] px-3.5 py-2 text-[11px] font-medium text-white">Save hair log</button>
            </form>
          </details>
        </div>

        <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-5">
          <p className="text-[13px] font-medium text-[#2B2420]">Routines</p>
          <div className="mt-3 space-y-2">
            {hairRoutines.length === 0 ? <p className="text-[11.5px] text-[#9A9088]">No hair routines yet.</p> : hairRoutines.map((routine) => {
              const stepCount = routineSteps.filter((step) => step.routineId === routine.id).length;
              return (
                <div key={routine.id} className="flex items-center justify-between gap-2 rounded-[12px] border border-[#F1E7E3] px-3 py-2.5">
                  <div className="min-w-0"><p className="truncate text-[12px] font-medium text-[#3A332E]">{routine.name}</p><p className="text-[10px] text-[#9A9088]">{stepCount} steps · {routine.timeOfDay}</p></div>
                  <button type="button" onClick={() => setPlayingRoutine(routine)} className="shrink-0 rounded-full bg-[#FBE4E8] px-3 py-1.5 text-[10.5px] font-medium text-[#B15A68]">Start</button>
                </div>
              );
            })}
          </div>
          <Link href="/routines" className="mt-3 inline-block text-[11px] font-medium text-[#C9727E]">Manage routines →</Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <div className="overflow-hidden rounded-[18px] border border-[#F1E7E3] bg-white">
          <div className="border-b border-[#F1E7E3] px-5 py-3.5"><p className="text-[13px] font-medium text-[#2B2420]">Hair Journey</p></div>
          {logs.length === 0 ? (
            <div className="p-8 text-center"><p className="text-[12px] text-[#9A9088]">No hair care logged yet. Start with your next wash or treatment.</p></div>
          ) : (
            <div className="max-h-[420px] divide-y divide-[#F4ECE8] overflow-y-auto">
              {logs.map((log, index) => (
                <div key={log.id} className={`flex gap-3 px-5 py-3.5 ${index === 0 ? 'bg-[#FDFAF8]' : ''}`}>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FBE4E8] text-[#C9727E]">{isWash(log.eventType) ? <Droplets size={14} /> : isTreatment(log.eventType) ? <Sparkles size={14} /> : <Waves size={14} />}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2"><p className="text-[12.5px] font-medium text-[#2B2420]">{log.eventType}</p><span className="text-[10px] text-[#9A9088]">{fmt(log.occurredAt)}</span>{log.heatUsed ? <span className="rounded-full bg-[#F1E8D9] px-2 py-0.5 text-[9px] text-[#9A7A3D]">heat</span> : null}</div>
                    {log.style ? <p className="mt-0.5 text-[11px] text-[#8A8078]">Style: {log.style}</p> : null}
                    {log.products ? <p className="text-[11px] text-[#8A8078]">Products: {log.products}</p> : null}
                    {log.nextAction ? <p className="mt-1.5 inline-block rounded-full bg-[#F1E8E4] px-2.5 py-1 text-[10px] text-[#8A5A56]">Next: {log.nextAction}</p> : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-5">
            <div className="flex items-center gap-1.5"><CalendarDays size={13} className="text-[#C9727E]" /><p className="text-[13px] font-medium text-[#2B2420]">Appointments</p></div>
            <div className="mt-3 space-y-2">
              {hairAppointments.length === 0 ? <p className="text-[11.5px] text-[#9A9088]">No upcoming hair appointments.</p> : hairAppointments.map((event) => (
                <div key={event.id}><p className="text-[12px] font-medium text-[#3A332E]">{event.title}</p><p className="text-[10px] text-[#9A9088]">{fmt(event.startAt)}{event.location ? ` · ${event.location}` : ''}</p></div>
              ))}
            </div>
            <Link href="/calendar" className="mt-3 inline-block text-[11px] font-medium text-[#C9727E]">Open calendar →</Link>
          </div>

          <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-5">
            <div className="flex items-center gap-1.5"><Target size={13} className="text-[#C9727E]" /><p className="text-[13px] font-medium text-[#2B2420]">Hair Goals</p></div>
            <div className="mt-3 space-y-2.5">
              {hairGoals.length === 0 ? <p className="text-[11.5px] text-[#9A9088]">No hair goals yet.</p> : hairGoals.map((goal) => (
                <div key={goal.id}>
                  <div className="flex items-center justify-between gap-2"><p className="truncate text-[12px] font-medium text-[#3A332E]">{goal.title}</p><span className="text-[10px] text-[#9A9088]">{Math.round(goal.progress)}%</span></div>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-[#F4ECE8]"><div className="h-full rounded-full bg-[#C9727E]" style={{ width: `${Math.min(100, goal.progress)}%` }} /></div>
                </div>
              ))}
            </div>
            <Link href="/goals" className="mt-3 inline-block text-[11px] font-medium text-[#C9727E]">Open Goals →</Link>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between"><p className="text-[13px] font-medium text-[#2B2420]">Product Shelf</p><span className="text-[10.5px] text-[#9A9088]">{shelf.length} tracked</span></div>
        {shelf.length === 0 ? (
          <div className="mt-3 rounded-[18px] border border-dashed border-[#F1E7E3] bg-white p-6 text-center">
            <PackageOpen size={20} className="mx-auto text-[#D8CDC8]" />
            <p className="mt-2 text-[12px] text-[#9A9088]">Your shelf builds automatically from products entered in hair logs.</p>
          </div>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {shelf.slice(0, 8).map(([product, count]) => (
              <div key={product} className="rounded-[16px] border border-[#F1E7E3] bg-white p-3.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FBE4E8] text-[#C9727E]"><PackageOpen size={14} /></span>
                <p className="mt-2.5 truncate text-[12px] font-medium text-[#2B2420]">{product}</p>
                <p className="text-[10.5px] text-[#9A9088]">Used {count}×</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {photoJourney.length > 0 ? (
        <div className="overflow-hidden rounded-[18px] border border-[#F1E7E3] bg-white">
          <div className="flex items-center justify-between border-b border-[#F1E7E3] px-5 py-3.5"><div className="flex items-center gap-1.5"><Camera size={14} className="text-[#C9727E]" /><p className="text-[13px] font-medium text-[#2B2420]">Photo Journey</p></div><Link href="/timeline" className="text-[11px] font-medium text-[#C9727E]">Open Timeline →</Link></div>
          <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
            {photoJourney.slice(0, 8).map((event) => (
              // eslint-disable-next-line @next/next/no-img-element
              <div key={event.id} className="overflow-hidden rounded-[12px] border border-[#F1E7E3]">
                <div className="aspect-[4/3] overflow-hidden bg-[#F4ECE8]"><img src={event.imageUrl!} alt={event.title} className="h-full w-full object-cover" /></div>
                <div className="p-2.5"><p className="truncate text-[11px] font-medium text-[#2B2420]">{event.title}</p><p className="text-[10px] text-[#9A9088]">{fmt(event.occurredAt)}</p></div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="relative overflow-hidden rounded-[18px] border border-[#F1E7E3] bg-[#FDF8F6] p-5">
        <div className="flex items-center gap-1.5"><Sparkles size={14} className="text-[#C9727E]" /><p className="text-[12px] font-medium text-[#2B2420]">Glow Hair Insight</p></div>
        <p className="mt-2 max-w-xl text-[12.5px] leading-5 text-[#6B6560]">{insight}</p>
      </div>

      {playingRoutine ? <RoutineStepPlayer routine={playingRoutine} steps={routineSteps.filter((step) => step.routineId === playingRoutine.id).sort((a, b) => a.order - b.order)} onClose={() => setPlayingRoutine(null)} /> : null}
    </div>
  );
}
