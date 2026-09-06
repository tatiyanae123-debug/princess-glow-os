'use client';

import { ArrowRight, CalendarDays, Moon, Search, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { usePersonalContext } from '@/lib/personal-context/use-personal-context';
import styles from './glow-threshold-reference.module.css';

function travel(path: string) {
  document.dispatchEvent(new CustomEvent('glow:navigate', { detail: { path } }));
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function shortName(name: string | null | undefined) {
  return name?.trim().split(/\s+/)[0] || 'you';
}

const portals = [
  ['Routines', 'Your day, your way', '/routines', 'ritual'],
  ['Habits', 'Small steps. Big shifts.', '/habits', 'stones'],
  ['Spaces', 'Everything has a home.', '/life', 'room'],
  ['Reset', 'Clear space. More you.', '/today?room=replan', 'crystal'],
  ['Progress', 'Proof of becoming.', '/goals', 'book'],
  ['Concierge', 'Support your future self.', '/concierge', 'orb'],
] as const;

export function GlowThresholdReference() {
  const personal = usePersonalContext();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);

  const data = personal.status === 'ready' ? personal.data : null;
  const name = shortName(data?.user.name);
  const greeting = !now ? 'Welcome' : now.getHours() < 12 ? 'Good Morning' : now.getHours() < 18 ? 'Good Afternoon' : 'Good Evening';
  const dateText = now?.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) ?? '';

  const priorities = useMemo(() => {
    if (!data) return [];
    const rank = { urgent: 0, high: 1, medium: 2, low: 3 } as const;
    return [...data.tasks]
      .filter((task) => task.status !== 'done' && task.status !== 'cancelled')
      .sort((a, b) => rank[a.priority] - rank[b.priority])
      .slice(0, 3);
  }, [data]);

  const todayEvents = data?.todayEvents.slice(0, 6) ?? [];
  const energy = data?.wellness?.energy?.trim() || 'Steady';
  const sleep = data?.wellness?.sleepHours;
  const activeCount = data?.tasks.filter((task) => task.status === 'in_progress').length ?? 0;
  const goalCount = data?.goals.filter((goal) => goal.status !== 'complete').length ?? 0;

  function openGlow() {
    document.dispatchEvent(new CustomEvent('glow:open'));
  }

  return (
    <main className={styles.world} aria-label="Glow Home threshold">
      <div className={styles.sunwash} aria-hidden="true" />
      <div className={styles.crystalField} aria-hidden="true">
        <i className={styles.crystalOne} /><i className={styles.crystalTwo} /><i className={styles.crystalThree} />
      </div>
      <section className={styles.editorialMark} aria-hidden="true">
        <span className={styles.glowWord}>Glow<small>OS</small></span>
        <span>A MORE INTENTIONAL TOMORROW</span>
        <p>ROUTINES<br/>HABITS<br/>PLANNING<br/>WELLNESS<br/>ENVIRONMENT<br/>BEAUTY<br/>LIFE</p>
      </section>

      <section className={styles.arch} aria-label="Forward horizon">
        <div className={styles.archPearl} aria-hidden="true" />
        <div className={styles.horizon}><span>DISCIPLINE<br/>CREATES<br/>FREEDOM</span></div>
      </section>

      <section className={styles.console}>
        <header className={styles.consoleHead}>
          <div><small>{greeting},</small><h1>{name === 'you' ? 'Welcome' : name}</h1><p>Same you. A more intentional day.</p></div>
          <div className={styles.date}>{dateText}<span>☼</span></div>
        </header>

        <button type="button" onClick={openGlow} className={styles.askField} aria-label="Ask Glow what you would like to do today">
          <Search size={18} strokeWidth={1.4}/><span>What would you like to do today?</span><span className={styles.askPearl}><Sparkles size={16}/></span>
        </button>

        <div className={styles.mainGrid}>
          <section className={styles.focusCard}>
            <h2>Today&apos;s Focus</h2>
            {priorities.length ? priorities.map((task, index) => (
              <button key={task.id} type="button" onClick={() => travel('/today?room=what-now')} className={styles.focusRow}>
                <b>{index + 1}</b><span>{task.title}</span><i data-priority={task.priority}/>
              </button>
            )) : <button type="button" onClick={() => travel('/today?room=what-now')} className={styles.emptyFocus}>Choose what matters now <ArrowRight size={15}/></button>}
          </section>

          <button type="button" onClick={() => travel('/today?room=what-now')} className={styles.energyCard}>
            <div><h2>Energy</h2><span className={styles.energyOrb}>{energy}</span></div>
            <ul><li>Mental</li><li>Physical</li><li>Creative</li><li>Social</li></ul>
            <ArrowRight size={16}/>
          </button>

          <section className={styles.glanceCard}>
            <h2>Today at a Glance</h2>
            <div className={styles.glanceRows}>
              {todayEvents.length ? todayEvents.slice(0, 5).map((event, index) => (
                <button key={event.id} type="button" onClick={() => travel(`/today?room=meeting&event=${encodeURIComponent(event.id)}`)}>
                  <time>{formatTime(event.startAt)}</time><span>{event.title}</span><i style={{ '--offset': `${10 + index * 8}%`, '--width': `${32 + (index % 3) * 8}%` } as React.CSSProperties}/>
                </button>
              )) : <button type="button" onClick={() => travel('/today?room=day-view')}><time>Today</time><span>Your schedule is clear</span><i/></button>}
            </div>
          </section>

          <blockquote className={styles.quote}>Progress<br/>over perfection<br/>always.</blockquote>
        </div>

        <div className={styles.instruments}>
          <button type="button" onClick={() => travel('/planning')}><CalendarDays size={17}/><span>This Week</span><b>{todayEvents.length} today</b></button>
          <button type="button" onClick={() => travel('/wellness')}><Moon size={17}/><span>Sleep</span><b>{sleep ? `${sleep.toFixed(1)}h` : 'Not logged'}</b></button>
          <button type="button" onClick={() => travel('/today?room=focus')}><Sparkles size={17}/><span>Attention</span><b>{activeCount ? `${activeCount} active` : 'Available'}</b></button>
          <button type="button" onClick={() => travel('/goals')}><span className={styles.numbers}>3·2·1</span><span>Progress</span><b>{goalCount ? `${goalCount} goals` : 'Open horizon'}</b></button>
        </div>
      </section>

      <aside className={styles.portalStack} aria-label="Nearby Glow spaces">
        {portals.map(([label, subtitle, path, art]) => (
          <button key={label} type="button" onClick={() => travel(path)} className={styles.portal} data-art={art}>
            <span className={styles.portalImage} aria-hidden="true"/><span><b>{label}</b><small>{subtitle}</small></span><ArrowRight size={16}/>
          </button>
        ))}
      </aside>

      <p className={styles.mantra}>Not a<br/>perfect day.<br/><em>A purposeful one.</em></p>
      <p className={styles.footerThought}>You don&apos;t have to do more.<br/><em>You just have to do what matters.</em></p>
    </main>
  );
}
