import Link from 'next/link';
import { ChevronRight, Home, Search, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import styles from './canonical-domain-room.module.css';

export type CanonicalDomainClimate =
  | 'food'
  | 'work'
  | 'money'
  | 'brain'
  | 'settings'
  | 'wellness'
  | 'home'
  | 'travel'
  | 'relationships'
  | 'saint'
  | 'create'
  | 'beauty'
  | 'closet'
  | 'fitness'
  | 'body'
  | 'plan'
  | 'today'
  | 'global';

export type CanonicalDomainDestination = {
  label: string;
  href: string;
  cue: string;
};

function crumbHref(label: string) {
  const key = label.trim().toLowerCase();
  const map: Record<string, string> = {
    'glow os': '/home',
    plan: '/planning',
    life: '/life',
    brain: '/brain',
    create: '/create',
    beauty: '/beauty',
    fitness: '/fitness',
    wellness: '/wellness',
    work: '/work',
    finance: '/finance',
    money: '/finance',
    closet: '/closet',
    home: '/life/home',
    settings: '/settings',
    global: '/home',
  };
  return map[key] ?? '/home';
}

export function CanonicalDomainRoom({
  eyebrow,
  title,
  question,
  climate,
  destinations,
  children,
  aside,
}: {
  eyebrow: string;
  title: string;
  question: string;
  climate: CanonicalDomainClimate;
  destinations?: CanonicalDomainDestination[];
  children: ReactNode;
  aside?: ReactNode;
}) {
  const crumbs = eyebrow
    .split(/[·›→/]/)
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <div className={styles.room} data-domain-climate={climate} data-glow-deep-room="true">
      <div className={styles.atmosphere} aria-hidden="true">
        <i className={styles.lightA} />
        <i className={styles.lightB} />
        <i className={styles.pearlA} />
        <i className={styles.pearlB} />
      </div>

      <div className={styles.innerChrome}>
        <div className={styles.brand}>
          <Link href="/home" className={styles.brandHome} aria-label="Glow OS Home">
            <span className={styles.crown}>♔</span>
            <span>
              <strong>Princess Glow OS</strong>
              <small>A more aligned you. A brighter tomorrow.</small>
            </span>
          </Link>
          <div className={styles.chromeActions}>
            <Link href="/search" className={styles.iconAction} aria-label="Search"><Search size={14} /></Link>
            <Link href="/ask-glow" className={styles.shaktiAction}><span className={styles.shaktiPearl} aria-hidden="true" /><span>Shakti</span></Link>
          </div>
        </div>

        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          <Link href="/home"><Home size={10} /><span>Dashboard</span></Link>
          {crumbs.map((crumb) => (
            <span className={styles.crumbWrap} key={crumb}>
              <ChevronRight size={9} />
              <Link href={crumbHref(crumb)}>{crumb}</Link>
            </span>
          ))}
          <span className={styles.crumbWrap}>
            <ChevronRight size={9} />
            <span className={styles.currentCrumb}>{title}</span>
          </span>
        </nav>

        <header className={styles.hero}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>{eyebrow}</span>
            <h1>{title}</h1>
            <p>{question}</p>
          </div>
          <Link className={styles.ask} href="/ask-glow">
            <Sparkles size={13} />
            Ask Shakti
          </Link>
        </header>

        {destinations?.length ? (
          <nav className={styles.thresholds} aria-label={`${title} rooms`}>
            {destinations.map((destination) => (
              <Link key={destination.href} href={destination.href} className={styles.threshold}>
                <span>{destination.label}</span>
                <small>{destination.cue}</small>
              </Link>
            ))}
          </nav>
        ) : null}

        <div className={styles.body}>
          <main className={styles.workingSurface}>{children}</main>
          {aside ? <aside className={styles.context}>{aside}</aside> : null}
        </div>
      </div>
    </div>
  );
}
