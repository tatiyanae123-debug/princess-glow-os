import Link from 'next/link';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BatteryCharging,
  CheckCircle2,
  Dumbbell,
  Droplets,
  HeartPulse,
  Moon,
  Pill,
  Search,
  Sparkles,
  Utensils,
} from 'lucide-react';
import styles from './life-reference-room.module.css';

const BODY_CARDS = [
  {
    title: 'Sleep',
    subtitle: 'Rest · Recovery',
    bullets: ['Last night', 'Restorative sleep', 'Sleep rhythm'],
    href: '/wellness?view=sleep',
    cta: 'Open sleep',
    icon: Moon,
  },
  {
    title: 'Energy',
    subtitle: 'How your body feels today',
    bullets: ['Energy check-in', 'Fatigue context', 'Daily capacity'],
    href: '/wellness',
    cta: 'Open energy',
    icon: BatteryCharging,
  },
  {
    title: 'Movement',
    subtitle: 'Strength · Mobility · Cardio',
    bullets: ['Training', 'Walking', 'Mobility'],
    href: '/fitness',
    cta: 'Open movement',
    icon: Dumbbell,
  },
  {
    title: 'Nutrition & Hydration',
    subtitle: 'Fuel · Water · Nourishment',
    bullets: ['Hydration', 'Meals', 'Protein & nourishment'],
    href: '/food?view=nutrition',
    cta: 'Open nourishment',
    icon: Droplets,
  },
  {
    title: 'Cycle & Hormones',
    subtitle: 'Patterns across time',
    bullets: ['Cycle context', 'Energy changes', 'Body patterns'],
    href: '/wellness?view=cycle',
    cta: 'Open cycle',
    icon: Activity,
  },
  {
    title: 'Symptoms',
    subtitle: 'Notice what your body is telling you',
    bullets: ['Current symptoms', 'Patterns', 'What changed'],
    href: '/wellness?view=symptoms',
    cta: 'Open symptoms',
    icon: HeartPulse,
  },
  {
    title: 'Medication',
    subtitle: 'Your real medication context only',
    bullets: ['Reminders', 'Schedule', 'Notes'],
    href: '/wellness?view=medication',
    cta: 'Open medication',
    icon: Pill,
  },
  {
    title: 'Care & Recovery',
    subtitle: 'Stretch · Breathe · Rest',
    bullets: ['Recovery', 'Body care', 'Restorative actions'],
    href: '/wellness?view=recovery',
    cta: 'Open recovery',
    icon: Sparkles,
  },
] as const;

export function LifeBodyReferenceRoom({ connectedCount }: { connectedCount: number }) {
  return (
    <main className={styles.world} data-glow-room="life-body">
      <div className={styles.causticA} aria-hidden="true" />
      <div className={styles.causticB} aria-hidden="true" />

      <section className={styles.frame} aria-label="Life · Body">
        <header className={styles.header}>
          <Link href="/life" className={styles.returnAnchor} aria-label="Return to Life">
            <ArrowLeft size={15} />
            <span>Back to Life</span>
          </Link>

          <div className={styles.identity}>
            <small>WORLD 3 · LIFE</small>
            <span>LIFE · THE PERSONAL HOUSE</span>
            <h1>BODY</h1>
            <p>How is my body today, and what does it need?</p>
          </div>

          <Link href="/ask-glow" className={styles.askGlow}>
            <Search size={14} />
            <span>Ask Glow…</span>
            <i aria-hidden="true" />
          </Link>
        </header>

        <nav className={styles.localTabs} aria-label="Body controls">
          <span className={styles.tabActive}>Body</span>
          <span>Mind</span>
          <span>Energy</span>
          <span>Recovery</span>
        </nav>

        <section className={styles.roomField}>
          <section className={styles.cardGrid} aria-label="Body areas">
            {BODY_CARDS.map((card, index) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.title}
                  href={card.href}
                  className={`${styles.roomCard} ${styles[`card_${index + 1}`]}`}
                >
                  <div className={styles.cardCopy}>
                    <strong>{card.title}</strong>
                    <small>{card.subtitle}</small>
                    <ul>
                      {card.bullets.map((bullet) => (
                        <li key={bullet}><CheckCircle2 size={12} />{bullet}</li>
                      ))}
                    </ul>
                    <span className={styles.cardCta}>{card.cta} <ArrowRight size={13} /></span>
                  </div>
                  <span className={styles.liquidObject} aria-hidden="true">
                    <span className={styles.objectGlow} />
                    <Icon size={25} strokeWidth={1.35} />
                    <i />
                    <b />
                  </span>
                </Link>
              );
            })}

            <Link href="/ask-glow" className={styles.centerPiece}>
              <span className={styles.centerHalo} aria-hidden="true"><i /><b /><em /></span>
              <div>
                <HeartPulse size={18} />
                <strong>Your body, in context.</strong>
                <small>Listen. Adjust. Be kind.</small>
              </div>
            </Link>
          </section>

          <aside className={styles.intelligenceRail}>
            <section className={styles.statusCard}>
              <span className={styles.eyebrow}>Body context</span>
              <div className={styles.statusValue}>
                <strong>{connectedCount}</strong>
                <small>connected</small>
                <span className={styles.statusArc} aria-hidden="true" />
              </div>
              <p>Glow only reflects body and wellness information that is actually connected. No body score is invented.</p>
              <div className={styles.statusList}>
                <span><i />Sleep</span>
                <span><i />Energy</span>
                <span><i />Hydration</span>
                <span><i />Movement</span>
                <span><i />Recovery</span>
              </div>
            </section>

            <section className={styles.nextCard}>
              <span className={styles.eyebrow}>Today’s guidance</span>
              <strong>Use your real signals.</strong>
              <p>Sleep, energy, movement, nourishment, symptoms, and recovery stay connected here without substituting sample health data.</p>
              <Link href="/ask-glow"><Sparkles size={13} /> Ask Glow about Body</Link>
            </section>

            <section className={styles.saveCard}>
              <Utensils size={14} />
              <span>Body stays connected to Food, Fitness, Wellness, and Today</span>
            </section>
          </aside>
        </section>
      </section>
    </main>
  );
}
