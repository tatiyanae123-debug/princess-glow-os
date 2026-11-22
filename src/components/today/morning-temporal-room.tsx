'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { usePersonalContext } from '@/lib/personal-context/use-personal-context';
import styles from './morning-temporal-room.module.css';

function timeLabel(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});
}

export function MorningTemporalRoom() {
  const personal = usePersonalContext();
  const data = personal.data;
  const name = data?.user.name?.trim().split(/\s+/)[0] || 'You';
  const morningRoutines = data?.routines.filter((routine)=>routine.timeOfDay==='morning') ?? [];
  const firstEvent = data?.todayEvents[0] ?? null;
  const pendingTasks = data?.tasks.filter((task)=>task.status==='pending' || task.status==='in_progress') ?? [];
  const highPriority = pendingTasks.find((task)=>task.priority==='urgent' || task.priority==='high') ?? pendingTasks[0] ?? null;
  const wellness = data?.wellness ?? null;

  const phases = [
    { label:'WAKE', title:wellness?.sleepHours != null ? `${wellness.sleepHours}h sleep recorded` : 'Orient before adding pressure', note:'Sleep context changes emphasis. No wake time is guessed when it is not recorded.' },
    { label:'CARE', title:morningRoutines[0]?.name ?? 'Morning routine', note:morningRoutines[0]?.description ?? 'Use the version that fits today’s energy and situation.' },
    { label:'NOURISH', title:'Breakfast + hydration', note:'Food appears as a morning need, not as a separate dashboard widget.' },
    { label:'PREPARE', title:firstEvent ? `Prepare for ${firstEvent.title}` : 'Prepare for the day', note:firstEvent?.location ? `Location: ${firstEvent.location}` : 'Only preparation tied to real commitments should surface.' },
    { label:'LEAVE / BEGIN', title:firstEvent ? `${timeLabel(firstEvent.startAt) ?? 'Next'} commitment` : highPriority?.title ?? 'Begin what matters', note:'The morning flows into the next real commitment instead of ending at a checklist.' },
  ];

  return <main className={styles.room} data-temporal-room="morning">
    <div className={styles.canvas}>
      <header className={styles.opening}>
        <div><span className={styles.eyebrow}>TODAY · MORNING</span><h1>Good morning, {name}.</h1></div>
        <div className={styles.openingCopy}><strong>Open the day progressively.</strong><p>Morning is a temporal room. It combines current energy, sleep context, routines, the first commitment and what must happen before the day begins without duplicating those objects.</p></div>
      </header>

      <section className={styles.current}>
        <article className={styles.now}>
          <div><span className={styles.eyebrow}>WHAT MATTERS FIRST</span><h2>{morningRoutines[0]?.name ?? highPriority?.title ?? 'Start gently, then orient.'}</h2><p>{morningRoutines[0]?.description ?? highPriority?.description ?? 'Glow stays sparse when there is no real item that deserves the first position.'}</p></div>
          <Link className={styles.nextAction} href={morningRoutines.length ? '/routines/daily-life/morning' : '/today?room=what-now'}><span>{morningRoutines.length ? 'Enter Morning Routine' : 'Decide what to do now'}</span><ArrowRight size={16}/></Link>
        </article>

        <aside className={styles.context} aria-label="Morning context">
          <div className={styles.contextRow}><small>ENERGY</small><div><strong>{wellness?.energy || 'Not recorded'}</strong><p>Energy changes the version of the morning, not where the routine lives.</p></div></div>
          <div className={styles.contextRow}><small>SLEEP</small><div><strong>{wellness?.sleepHours != null ? `${wellness.sleepHours} hours` : 'No sleep value recorded'}</strong><p>Unrecorded context remains unknown instead of being filled with sample data.</p></div></div>
          <div className={styles.contextRow}><small>FIRST EVENT</small><div><strong>{firstEvent?.title ?? 'No event currently surfaced'}</strong><p>{firstEvent ? `${timeLabel(firstEvent.startAt) ?? ''}${firstEvent.location ? ` · ${firstEvent.location}` : ''}` : 'The room remains calm when the calendar is open.'}</p></div></div>
          <div className={styles.contextRow}><small>ROUTINES</small><div><strong>{morningRoutines.length ? `${morningRoutines.length} morning routine${morningRoutines.length===1?'':'s'}` : 'None connected'}</strong><p>These remain the same Routine objects visible in Plan.</p></div></div>
        </aside>
      </section>

      <section className={styles.flow}>
        <div className={styles.flowHeader}><div><span className={styles.eyebrow}>MORNING CURRENT</span><h2>The day opens in sequence.</h2></div><p>Each stage is contextual. The interface should reveal what is useful as you move forward rather than place twenty unrelated cards on screen.</p></div>
        <div className={styles.river}>{phases.map((phase)=><article className={styles.phase} key={phase.label}><small>{phase.label}</small><strong>{phase.title}</strong><p>{phase.note}</p></article>)}</div>
      </section>

      <footer className={styles.orbit}><p>Morning does not own your routines, calendar, tasks or wellness state. It is a present-tense lens into those shared Glow Objects.</p><div className={styles.links}><Link href="/today?room=what-now">What Now</Link><Link href="/routines/daily-life/morning">Morning Routine</Link></div></footer>
    </div>
  </main>;
}
