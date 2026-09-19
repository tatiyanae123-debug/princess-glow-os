import Link from 'next/link';
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
  | 'global';

export type CanonicalDomainDestination = {
  label: string;
  href: string;
  cue: string;
};

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
  return (
    <div className={styles.room} data-domain-climate={climate}>
      <div className={styles.atmosphere} aria-hidden="true">
        <i className={styles.lightA} />
        <i className={styles.lightB} />
        <i className={styles.pearlA} />
        <i className={styles.pearlB} />
      </div>

      <header className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>{eyebrow}</span>
          <h1>{title}</h1>
          <p>{question}</p>
        </div>
        <Link className={styles.ask} href="/ask-glow">Ask Glow</Link>
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
  );
}
