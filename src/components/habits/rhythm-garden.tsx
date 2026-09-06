'use client';

import {
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  FolderKanban,
  Orbit,
  Plus,
  RotateCcw,
  Sparkles,
  Target,
} from 'lucide-react';
import { useMemo, useState, type CSSProperties } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { HabitForm } from '@/components/habits/habit-form';
import { useServerAction } from '@/lib/hooks/use-server-action';
import { logHabitAction } from '@/app/actions/habits';
import { buildHabitInsights } from '@/lib/habits/insights';
import type { Habit, HabitLog } from '@/lib/types';
import styles from './rhythm-garden.module.css';

type Tone = 'rose' | 'violet' | 'peach';

const PLAN_NEIGHBORS = [
  { label: 'Calendar', href: '/calendar', icon: CalendarDays },
  { label: 'Tasks', href: '/tasks', icon: CheckCircle2 },
  { label: 'Reminders', href: '/reminders', icon: Bell },
  { label: 'Goals', href: '/goals', icon: Target },
  { label: 'Projects', href: '/projects', icon: FolderKanban },
  { label: 'Routines', href: '/routines', icon: RotateCcw },
  { label: 'Habits', href: '/habits', icon: Orbit },
] as const;

const TONES: Tone[] = ['rose', 'violet', 'peach'];

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function navigate(path: string) {
  document.dispatchEvent(new CustomEvent('glow:navigate', { detail: { path } }));
}

function titleCase(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function isScheduledOn(habit: Habit, date: Date) {
  const day = date.getUTCDay();
  if (habit.frequency === 'daily') return true;
  if (habit.frequency === 'weekdays') return day >= 1 && day <= 5;
  if (habit.frequency === 'weekends') return day === 0 || day === 6;
  return true;
}

function rhythmFor(habit: Habit, logs: HabitLog[]) {
  const completed = new Set(
    logs.filter((log) => log.habitId === habit.id && log.count > 0).map((log) => log.loggedDate),
  );

  if (habit.frequency === 'weekly') {
    let successfulWeeks = 0;
    for (let week = 0; week < 4; week += 1) {
      const end = new Date();
      end.setUTCHours(0, 0, 0, 0);
      end.setUTCDate(end.getUTCDate() - week * 7);
      let hit = false;
      for (let offset = 0; offset < 7; offset += 1) {
        const day = new Date(end);
        day.setUTCDate(day.getUTCDate() - offset);
        if (completed.has(dateKey(day))) hit = true;
      }
      if (hit) successfulWeeks += 1;
    }
    return Math.round((successfulWeeks / 4) * 100);
  }

  const scheduled: string[] = [];
  for (let offset = 0; offset < 28; offset += 1) {
    const day = new Date();
    day.setUTCHours(0, 0, 0, 0);
    day.setUTCDate(day.getUTCDate() - offset);
    if (isScheduledOn(habit, day)) scheduled.push(dateKey(day));
  }
  if (!scheduled.length) return 0;
  return Math.round((scheduled.filter((day) => completed.has(day)).length / scheduled.length) * 100);
}

function descriptionMinutes(habit: Habit) {
  const match = habit.description?.match(/\b(\d{1,3})\s*(?:min|mins|minute|minutes)\b/i);
  return match ? `${match[1]} min` : null;
}

function descriptionWindow(habit: Habit) {
  const match = habit.description?.match(/(\d{1,2}(?::\d{2})?\s*(?:AM|PM))\s*[–-]\s*(\d{1,2}(?::\d{2})?\s*(?:AM|PM))/i);
  return match ? `${match[1]} – ${match[2]}` : null;
}

function descriptionContext(habit: Habit) {
  const text = `${habit.name} ${habit.description ?? ''}`.toLowerCase();
  if (/gym|fitness studio/.test(text)) return 'Gym';
  if (/outdoor|walk|run|park/.test(text)) return 'Home / Outdoors';
  if (/desk|study|work|focus|project/.test(text)) return 'Desk / Work';
  if (/bed|sleep|night|unwind/.test(text)) return 'Home';
  if (/home|room|kitchen|laundry/.test(text)) return 'Home';
  return 'Flexible';
}

function gentleRecovery(habit: Habit) {
  const minutes = descriptionMinutes(habit);
  if (minutes) return `Return with ${minutes.toLowerCase()} next window`;
  return 'Return at the next window';
}

function weekRange() {
  const today = new Date();
  const mondayOffset = (today.getDay() + 6) % 7;
  const start = new Date(today);
  start.setDate(today.getDate() - mondayOffset);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const sameMonth = start.getMonth() === end.getMonth();
  const startLabel = start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const endLabel = end.toLocaleDateString(undefined, sameMonth ? { day: 'numeric' } : { month: 'short', day: 'numeric' });
  return `${startLabel} – ${endLabel}`;
}

function nextWindowLabel(habit: Habit) {
  return descriptionWindow(habit) ?? titleCase(habit.frequency);
}

function GardenFlower({
  habit,
  score,
  tone,
  index,
  selected,
  onSelect,
}: {
  habit: Habit;
  score: number;
  tone: Tone;
  index: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const style = { '--score': `${score}%` } as CSSProperties;
  return (
    <button
      type="button"
      className={`${styles.flower} ${selected ? styles.flowerSelected : ''}`}
      data-tone={tone}
      data-index={index}
      style={style}
      onClick={onSelect}
      aria-label={`${habit.name}, ${score}% rhythm`}
    >
      <span className={styles.flowerLabel}>{habit.name}</span>
      <span className={styles.rhythmHalo}>
        <span><strong>{score}%</strong><small>Rhythm score</small></span>
      </span>
      <span className={styles.bloom} aria-hidden="true">
        <i /><i /><i /><i /><i /><b />
      </span>
      <span className={styles.stem} aria-hidden="true" />
      <span className={`${styles.leaf} ${styles.leafLeft}`} aria-hidden="true" />
      <span className={`${styles.leaf} ${styles.leafRight}`} aria-hidden="true" />
    </button>
  );
}

export function RhythmGarden({ initialHabits, initialLogs }: { initialHabits: Habit[]; initialLogs: HabitLog[] }) {
  const [habits, setHabits] = useState(initialHabits);
  const [logs, setLogs] = useState(initialLogs);
  const [dialogHabit, setDialogHabit] = useState<Habit | 'new' | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const log = useServerAction(logHabitAction);
  const insights = useMemo(() => buildHabitInsights(habits, logs), [habits, logs]);
  const today = dateKey(new Date());
  const loggedToday = useMemo(
    () => new Set(logs.filter((item) => item.loggedDate === today && item.count > 0).map((item) => item.habitId)),
    [logs, today],
  );
  const activeHabits = useMemo(() => habits.filter((habit) => !habit.archived), [habits]);
  const rhythm = useMemo(
    () => new Map(activeHabits.map((habit) => [habit.id, rhythmFor(habit, logs)])),
    [activeHabits, logs],
  );
  const gardenHabits = useMemo(
    () => [...activeHabits]
      .sort((a, b) => Number(loggedToday.has(a.id)) - Number(loggedToday.has(b.id)) || (rhythm.get(b.id) ?? 0) - (rhythm.get(a.id) ?? 0))
      .slice(0, 3),
    [activeHabits, loggedToday, rhythm],
  );
  const selectedHabit = activeHabits.find((habit) => habit.id === selectedId) ?? gardenHabits[0] ?? null;
  const selectedGardenIndex = Math.max(0, gardenHabits.findIndex((habit) => habit.id === selectedHabit?.id));

  const dailyTrace = useMemo(() => {
    const values = Array.from({ length: 7 }, (_, index) => {
      const day = new Date();
      day.setUTCHours(0, 0, 0, 0);
      day.setUTCDate(day.getUTCDate() - (6 - index));
      const scheduled = activeHabits.filter((habit) => isScheduledOn(habit, day));
      if (!scheduled.length) return 0;
      const complete = scheduled.filter((habit) => logs.some((item) => item.habitId === habit.id && item.loggedDate === dateKey(day) && item.count > 0)).length;
      return Math.round((complete / scheduled.length) * 100);
    });
    return values;
  }, [activeHabits, logs]);

  const consistency = activeHabits.length
    ? Math.round(activeHabits.reduce((sum, habit) => sum + (rhythm.get(habit.id) ?? 0), 0) / activeHabits.length)
    : 0;
  const longestRhythm = activeHabits.length
    ? Math.max(...activeHabits.map((habit) => insights.get(habit.id)?.bestStreak ?? 0))
    : 0;
  const completedTotal = logs.filter((item) => item.count > 0).length;
  const previousWeekValues = dailyTrace.slice(0, 3);
  const currentWeekValues = dailyTrace.slice(3);
  const previousAverage = previousWeekValues.length ? previousWeekValues.reduce((sum, value) => sum + value, 0) / previousWeekValues.length : 0;
  const currentAverage = currentWeekValues.length ? currentWeekValues.reduce((sum, value) => sum + value, 0) / currentWeekValues.length : 0;
  const delta = Math.round(currentAverage - previousAverage);

  const tracePoints = dailyTrace.map((value, index) => `${index * 38 + 7},${64 - Math.max(4, value) * 0.52}`).join(' ');

  function handleSaved(habit: Habit) {
    setHabits((current) => current.some((item) => item.id === habit.id)
      ? current.map((item) => item.id === habit.id ? habit : item)
      : [habit, ...current]);
    setDialogHabit(null);
    setSelectedId(habit.id);
  }

  function markSelectedDone() {
    if (!selectedHabit || loggedToday.has(selectedHabit.id)) return;
    log.run(
      { habitId: selectedHabit.id, loggedDate: today, count: 1 },
      (saved) => setLogs((current) => current.some((item) => item.id === saved.id) ? current : [saved, ...current]),
    );
  }

  function openGlow() {
    document.dispatchEvent(new CustomEvent('glow:open', {
      detail: selectedHabit ? { context: { room: 'Habits · Rhythm Garden', selectedHabitId: selectedHabit.id, selectedHabitName: selectedHabit.name } } : undefined,
    }));
  }

  return (
    <main className={styles.rhythmWorld} aria-label="Habits Rhythm Garden">
      <div className={styles.ambientGlow} aria-hidden="true" />
      <header className={styles.header}>
        <div className={styles.titleBlock}>
          <p>GLOW OS BATCH 1 <span>·</span> SUBPAGES ROUND 2</p>
          <h1>Habits <span>·</span> Rhythm Garden</h1>
          <small>Small, consistent actions. Natural rhythm. Lasting change.</small>
        </div>

        <nav className={styles.stageNav} aria-label="Habit building stages">
          <button type="button" onClick={() => navigate('/planning')}>Plan</button>
          <button type="button" onClick={() => navigate('/today?room=focus')}>Focus</button>
          <button type="button" className={styles.stageActive} aria-current="page">Build</button>
          <a href="#rhythm-insights">Reflect</a>
        </nav>

        <button type="button" className={styles.askGlow} onClick={openGlow}>
          <span className={styles.askPearl} aria-hidden="true" /> Ask Glow
        </button>
      </header>

      <div className={styles.roomGrid}>
        <aside className={styles.planNeighbors} aria-label="Nearby Plan rooms">
          {PLAN_NEIGHBORS.map(({ label, href, icon: Icon }) => (
            <button
              key={label}
              type="button"
              className={label === 'Habits' ? styles.neighborActive : undefined}
              onClick={() => label === 'Habits' ? undefined : navigate(href)}
              aria-current={label === 'Habits' ? 'page' : undefined}
            >
              <Icon aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
        </aside>

        <section className={styles.todayGarden}>
          <div className={styles.panelHeading}>
            <h2>Today&apos;s Garden</h2>
            <p>{gardenHabits.filter((habit) => !loggedToday.has(habit.id)).length} habits need attention</p>
          </div>

          <div className={styles.attentionList}>
            {gardenHabits.map((habit, index) => {
              const tone = TONES[index] ?? 'rose';
              const selected = selectedHabit?.id === habit.id;
              return (
                <button
                  key={habit.id}
                  type="button"
                  className={`${styles.attentionCard} ${selected ? styles.attentionSelected : ''}`}
                  data-tone={tone}
                  onClick={() => setSelectedId(habit.id)}
                >
                  <span className={styles.habitDot} />
                  <span className={styles.attentionCopy}>
                    <strong>{habit.name}</strong>
                    <small>{titleCase(habit.frequency)} · Target {habit.targetCount}×</small>
                    <em>{nextWindowLabel(habit)}</em>
                  </span>
                  <span className={styles.miniFlower} aria-hidden="true"><i /><b /></span>
                  <span className={styles.miniRing}>{rhythm.get(habit.id) ?? 0}%</span>
                </button>
              );
            })}
          </div>

          {!gardenHabits.length ? (
            <div className={styles.emptyPanel}>
              <span className={styles.emptyBud} aria-hidden="true" />
              <strong>Your garden is ready.</strong>
              <p>Add one small rhythm you want Glow to help protect.</p>
              <button type="button" onClick={() => setDialogHabit('new')}><Plus /> Add first habit</button>
            </div>
          ) : null}

          <button type="button" className={styles.reviewButton} onClick={() => navigate('/habits/daily')}>
            Review all habits <ChevronRight />
          </button>
        </section>

        <section className={styles.rhythmHero} aria-label="Your rhythm">
          <div className={styles.rhythmHeading}>
            <div><h2>Your Rhythm</h2><p>{weekRange()}</p></div>
            <span>This week <ChevronRight aria-hidden="true" /></span>
          </div>

          <div className={styles.gardenStage}>
            <div className={styles.pond} aria-hidden="true"><i /><i /><i /></div>
            {gardenHabits.map((habit, index) => (
              <GardenFlower
                key={habit.id}
                habit={habit}
                score={rhythm.get(habit.id) ?? 0}
                tone={TONES[index] ?? 'rose'}
                index={index}
                selected={selectedHabit?.id === habit.id}
                onSelect={() => setSelectedId(habit.id)}
              />
            ))}
            {!gardenHabits.length ? <div className={styles.emptyStageCopy}>Your first habit will grow here.</div> : null}
          </div>

          <div className={styles.gardenMessage}>
            <span className={styles.messagePearl} aria-hidden="true" />
            <div><strong>You&apos;re showing up.</strong><small>Rhythm grows with kindness and consistency.</small></div>
            {selectedHabit ? (
              <button type="button" onClick={markSelectedDone} disabled={loggedToday.has(selectedHabit.id) || log.isPending}>
                {loggedToday.has(selectedHabit.id) ? <><Check /> Completed today</> : <><Check /> Mark today</>}
              </button>
            ) : null}
          </div>
        </section>

        <aside className={styles.insightRail} id="rhythm-insights">
          <section className={styles.insightCard}>
            <div className={styles.panelHeading}><h2>Rhythm Insights</h2><p>All habits</p></div>
            <svg className={styles.trace} viewBox="0 0 250 74" role="img" aria-label="Seven day habit rhythm trace">
              <defs>
                <linearGradient id="rhythmTrace" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="rgba(213,142,158,.65)" />
                  <stop offset="50%" stopColor="rgba(153,157,224,.7)" />
                  <stop offset="100%" stopColor="rgba(220,170,123,.62)" />
                </linearGradient>
              </defs>
              <polyline points={tracePoints} fill="none" stroke="url(#rhythmTrace)" strokeWidth="2" />
              {dailyTrace.map((value, index) => <circle key={index} cx={index * 38 + 7} cy={64 - Math.max(4, value) * 0.52} r="3.25" />)}
            </svg>
            <dl className={styles.metrics}>
              <div><dt>Consistency</dt><dd>{consistency}%</dd><small>{delta === 0 ? 'Steady vs recent days' : `${delta > 0 ? '↑' : '↓'} ${Math.abs(delta)}% vs recent days`}</small></div>
              <div><dt>Longest rhythm</dt><dd>{longestRhythm} days</dd></div>
              <div><dt>Logged completions</dt><dd>{completedTotal}</dd></div>
            </dl>
          </section>

          <section className={styles.upNextCard}>
            <h2>Up next today</h2>
            <div className={styles.upNextList}>
              {gardenHabits.map((habit, index) => (
                <button key={habit.id} type="button" onClick={() => setSelectedId(habit.id)}>
                  <i data-tone={TONES[index]} />
                  <span>{habit.name}</span>
                  <small>{descriptionWindow(habit) ?? titleCase(habit.frequency)}</small>
                </button>
              ))}
            </div>
            <div className={styles.minimumNote}>
              <span className={styles.tinyPlant} aria-hidden="true"><i /><b /></span>
              <p><strong>Protect the minimum.</strong><br />Let the ideal be your north star.</p>
            </div>
          </section>
        </aside>
      </div>

      <section className={styles.gardenTable} aria-label="Habits in your garden">
        <div className={styles.tableHeading}>
          <div><h2>Habits in your garden</h2><p>Tap a habit to grow</p></div>
          <span>{activeHabits.length} {activeHabits.length === 1 ? 'habit' : 'habits'} shown</span>
        </div>

        <div className={styles.tableHeader} aria-hidden="true">
          <span>Habit</span><span>Frequency</span><span>Minimum version</span><span>Ideal version</span><span>Time window</span><span>Context</span><span>Flexible target</span><span>Recovery rule</span><span>Rhythm</span>
        </div>

        <div className={styles.tableRows}>
          {activeHabits.map((habit, index) => {
            const min = descriptionMinutes(habit);
            const window = descriptionWindow(habit);
            const score = rhythm.get(habit.id) ?? 0;
            const tone = TONES[index % TONES.length];
            return (
              <button
                key={habit.id}
                type="button"
                className={`${styles.tableRow} ${selectedHabit?.id === habit.id ? styles.tableRowSelected : ''}`}
                onClick={() => setSelectedId(habit.id)}
                data-tone={tone}
              >
                <span className={styles.tableHabit}><i>{habit.icon ? habit.icon.slice(0, 2) : '✦'}</i><strong>{habit.name}</strong></span>
                <span>{titleCase(habit.frequency)}</span>
                <span><strong>{min ?? 'Not set'}</strong><small>{min ? 'Smallest stated version' : 'Add a minimum version'}</small></span>
                <span><strong>{habit.description ? 'Full version' : 'Not set'}</strong><small>{habit.description ?? 'Add an ideal version'}</small></span>
                <span>{window ?? 'Flexible today'}</span>
                <span>{descriptionContext(habit)}</span>
                <span>{habit.targetCount > 1 ? `≥ ${habit.targetCount}×` : 'Complete once'}</span>
                <span><small>{gentleRecovery(habit)}</small></span>
                <span className={styles.rhythmCell}><strong>{score}%</strong><i style={{ '--score': `${score}%` } as CSSProperties} /></span>
                <ChevronRight className={styles.rowChevron} />
              </button>
            );
          })}
        </div>

        {!activeHabits.length ? <p className={styles.tableEmpty}>Your saved habits will appear here as soon as you add one.</p> : null}
        <button type="button" className={styles.addHabit} onClick={() => setDialogHabit('new')}><Plus /> Add habit</button>
      </section>

      <Dialog open={dialogHabit !== null} onClose={() => setDialogHabit(null)} title={dialogHabit === 'new' ? 'Add habit' : 'Edit habit'}>
        <HabitForm habit={dialogHabit === 'new' ? null : dialogHabit} onSaved={handleSaved} onCancel={() => setDialogHabit(null)} />
      </Dialog>
    </main>
  );
}
