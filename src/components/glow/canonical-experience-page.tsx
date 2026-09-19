import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';
import type { CanonicalExperienceSpec } from '@/lib/glow-world/canonical-experiences';
import styles from './canonical-experience-page.module.css';

export function CanonicalExperiencePage({ spec }: { spec: CanonicalExperienceSpec }) {
  return (
    <main className={styles.page} data-canonical-experience={spec.path} data-domain-climate={spec.climate} data-enclosure={spec.enclosure}>
      <div className={styles.atmosphere} aria-hidden="true"><i/><i/><i/></div>
      <header className={styles.header}>
        <Link href={spec.parentHref} className={styles.return}><ArrowLeft size={15}/><span>{spec.parentLabel}</span></Link>
        <div className={styles.identity}>
          <small>{spec.eyebrow}</small>
          <h1>{spec.title}</h1>
          <p>{spec.question}</p>
        </div>
        <Link href="/ask-glow" className={styles.ask}><Sparkles size={14}/><span>Ask Glow</span></Link>
      </header>

      <section className={styles.sequence} aria-label={`${spec.title} structure`}>
        {spec.sections.map((section,index)=>(
          <article key={section} className={styles.stage} data-stage={index+1}>
            <span className={styles.index}>{String(index+1).padStart(2,'0')}</span>
            <div>
              <h2>{section}</h2>
              <p>No personal data is invented here. Real connected Glow objects appear in this stage when they exist.</p>
            </div>
            <span className={styles.state}><CheckCircle2 size={14}/>Ready</span>
          </article>
        ))}
      </section>

      <footer className={styles.footer}>
        <span>This canonical experience is registered inside the shared Glow shell.</span>
        <Link href={spec.parentHref}>Return to {spec.parentLabel}</Link>
      </footer>
    </main>
  );
}
