import Link from 'next/link';
import { ArrowLeft, Search, Sparkles } from 'lucide-react';
import styles from './life-wing.module.css';

export type LifeRoomId =
  | 'body'
  | 'beauty'
  | 'closet'
  | 'food'
  | 'home'
  | 'money'
  | 'work'
  | 'relationships'
  | 'travel';

type LifeDestination = {
  label: string;
  description: string;
  href: string;
};

type LifeWingConfig = {
  title: string;
  eyebrow: string;
  description: string;
  destinations: LifeDestination[];
};

const LIFE_WINGS: Record<LifeRoomId, LifeWingConfig> = {
  body: {
    title: 'Body',
    eyebrow: 'Energy · Sleep · Movement',
    description: 'Your physical state, recovery, movement, sleep, and wellness stay connected inside one Body wing.',
    destinations: [
      { label: 'Fitness', description: 'Training, workouts, strength, cardio, posture, and recovery context.', href: '/fitness' },
      { label: 'Wellness', description: 'Energy, sleep, mood, recovery, and body signals.', href: '/wellness' },
      { label: 'Sleep', description: 'Rest and recovery context from your real wellness information.', href: '/wellness?view=sleep' },
      { label: 'Movement', description: 'Walking, mobility, cardio, and active-day context.', href: '/fitness?view=movement' },
    ],
  },
  beauty: {
    title: 'Beauty',
    eyebrow: 'Skin · Hair · Makeup · Maintenance',
    description: 'Beauty opens as one connected preparation and care world before you move into a specific studio.',
    destinations: [
      { label: 'Beauty Command Center', description: 'Your central beauty preparation, routines, timing, and maintenance context.', href: '/beauty' },
      { label: 'Skincare', description: 'Skin routines, treatments, products, progress, and care context.', href: '/beauty?studio=skincare' },
      { label: 'Hair', description: 'Hair care, maintenance, styling, protection, and next actions.', href: '/hair' },
      { label: 'Makeup', description: 'Makeup routines, products, looks, and preparation context.', href: '/beauty?studio=makeup' },
      { label: 'Gua Sha', description: 'Facial massage, lymphatic, posture, and ritual context.', href: '/beauty?studio=gua-sha' },
    ],
  },
  closet: {
    title: 'Closet',
    eyebrow: 'Wardrobe · Outfits · Style',
    description: 'Your wardrobe becomes a physical style wing rather than a list of clothing records.',
    destinations: [
      { label: 'Wardrobe', description: 'What you own and how it fits into your life.', href: '/closet' },
      { label: 'Outfits', description: 'Looks and combinations for real plans and days.', href: '/closet?view=outfits' },
      { label: 'Style', description: 'Your visual identity, preferences, silhouettes, and references.', href: '/closet?view=style' },
    ],
  },
  food: {
    title: 'Food',
    eyebrow: 'Meals · Nutrition · Recipes · Groceries',
    description: 'Food keeps nourishment, planning, recipes, and groceries in one connected wing.',
    destinations: [
      { label: 'Meals', description: 'Your current meal planning and food context.', href: '/food' },
      { label: 'Nutrition', description: 'Protein, nourishment, balance, and nutrition context.', href: '/food?view=nutrition' },
      { label: 'Recipes', description: 'Saved and useful recipes connected to how you actually eat.', href: '/food?view=recipes' },
      { label: 'Groceries', description: 'Shopping and restock context for food and home needs.', href: '/food?view=groceries' },
    ],
  },
  home: {
    title: 'Home',
    eyebrow: 'Spaces · Objects · Atmosphere',
    description: 'Your physical environment, belongings, organization, resets, and maintenance live together here.',
    destinations: [
      { label: 'Spaces', description: 'Rooms, layouts, organization, and physical environment context.', href: '/tasks?context=home' },
      { label: 'Organization', description: 'Resets, storage, belongings, and where things live.', href: '/tasks?context=organization' },
      { label: 'Maintenance', description: 'Repairs, replacements, household care, and recurring needs.', href: '/maintenance' },
      { label: 'Home routines', description: 'Cleaning, reset, laundry, and recurring care systems.', href: '/routines?context=home' },
    ],
  },
  money: {
    title: 'Money',
    eyebrow: 'Budget · Saving · Debt · Investing',
    description: 'Your financial life stays one connected money environment before opening a specific financial layer.',
    destinations: [
      { label: 'Money Home', description: 'Current spending, entries, and practical money context.', href: '/finance' },
      { label: 'Budget', description: 'Plan how money is allocated and what needs attention.', href: '/finance?view=budget' },
      { label: 'Saving', description: 'Savings goals, buffers, and future direction.', href: '/finance?view=saving' },
      { label: 'Debt', description: 'Debt, payoff context, and obligations.', href: '/finance?view=debt' },
      { label: 'Investing', description: 'Longer-term financial direction and investing context.', href: '/finance/brain' },
    ],
  },
  work: {
    title: 'Work',
    eyebrow: 'Career · Projects · Focus · Impact',
    description: 'Jobs, career decisions, projects, applications, interviews, and current work stay connected.',
    destinations: [
      { label: 'Work', description: 'Your current work and career context.', href: '/work' },
      { label: 'Projects', description: 'Active projects, milestones, and creative work.', href: '/projects' },
      { label: 'Career', description: 'Jobs, interviews, applications, and next moves.', href: '/work?view=career' },
      { label: 'Focus', description: 'Move into the upgraded Today Focus environment with context preserved.', href: '/today?room=focus' },
    ],
  },
  relationships: {
    title: 'Relationships',
    eyebrow: 'People · Connection · Boundaries',
    description: 'The people in your life, contact context, boundaries, and meaningful connection live here.',
    destinations: [
      { label: 'People', description: 'Your real connected contacts and communication actions.', href: '/today?room=people' },
      { label: 'Connections', description: 'The digital bridges that connect your people and information.', href: '/connections' },
      { label: 'Relationship notes', description: 'Private notes and context without invented relationship scoring.', href: '/notes?context=relationships' },
    ],
  },
  travel: {
    title: 'Travel',
    eyebrow: 'Places · Plans · Experiences',
    description: 'Trips, places, timing, calendar context, and memories stay connected inside one travel wing.',
    destinations: [
      { label: 'Places', description: 'Real places attached to your connected calendar and plans.', href: '/today?room=places' },
      { label: 'Calendar', description: 'Dates, timing, reservations, and travel-related schedule context.', href: '/calendar' },
      { label: 'Timeline', description: 'Trips and meaningful experiences across time.', href: '/timeline' },
    ],
  },
};

export function isLifeRoomId(value: string | undefined): value is LifeRoomId {
  return Boolean(value && value in LIFE_WINGS);
}

export function LifeWing({ room, connectedCount }: { room: LifeRoomId; connectedCount: number }) {
  const wing = LIFE_WINGS[room];

  return (
    <main className={`${styles.world} ${styles[`room_${room}`]}`} data-glow-room={`life-${room}`}>
      <div className={styles.causticA} aria-hidden="true" />
      <div className={styles.causticB} aria-hidden="true" />

      <section className={styles.frame} aria-label={`Life · ${wing.title}`}>
        <header className={styles.header}>
          <nav className={styles.primaryNav} aria-label="Glow navigation">
            <Link href="/home">Glow OS</Link>
            <span>·</span>
            <Link href="/today?room=what-now">Today</Link>
          </nav>

          <div className={styles.identity}>
            <span>LIFE · THE PERSONAL HOUSE</span>
            <h1>{wing.title}</h1>
            <p>{wing.eyebrow}</p>
          </div>

          <Link href="/ask-glow" className={styles.askGlow}>
            <Search size={13} />
            <span>Ask Glow…</span>
            <i aria-hidden="true" />
          </Link>
        </header>

        <Link href="/life" className={styles.backToHouse}>
          <ArrowLeft size={15} />
          <span>Personal House</span>
        </Link>

        <section className={styles.centerStage}>
          <div className={styles.anchorMatter} aria-hidden="true"><i /><b /><em /></div>
          <div className={styles.centerCopy}>
            <span>{wing.eyebrow}</span>
            <h2>{wing.title}</h2>
            <p>{wing.description}</p>
            <small>{connectedCount ? `${connectedCount} connected item${connectedCount === 1 ? '' : 's'} nearby` : 'No connected items are being invented.'}</small>
          </div>

          <div className={styles.destinationField}>
            {wing.destinations.map((destination, index) => (
              <Link key={destination.label} href={destination.href} className={`${styles.destination} ${styles[`destination_${index + 1}`]}`}>
                <span className={styles.destinationMatter} aria-hidden="true"><i /><b /></span>
                <strong>{destination.label}</strong>
                <p>{destination.description}</p>
                <span className={styles.openLabel}>Open</span>
              </Link>
            ))}
          </div>
        </section>

        <aside className={styles.intelligence}>
          <span className={styles.eyebrow}>Life context</span>
          <strong>{wing.title}</strong>
          <p>Only connected or user-created information belongs in this wing.</p>
          <div><Sparkles size={12} /><span>{connectedCount ? `${connectedCount} connected` : 'Ready for real data'}</span></div>
          <Link href="/life">Return to You at the center</Link>
        </aside>
      </section>
    </main>
  );
}
