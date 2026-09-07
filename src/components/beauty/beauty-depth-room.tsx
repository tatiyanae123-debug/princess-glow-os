import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, ChevronRight, PackageOpen } from 'lucide-react';
import { auth } from '@/auth';
import { getBeautyRoutinesByUser } from '@/lib/data/beauty-routines';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import { getBeautyProducts, getHairLogs } from '@/lib/data/completion-v1';
import { WORLD_TARGETS } from '@/lib/glow-world/navigation-shell';
import { BeautyAskGlowButton } from './beauty-ask-glow-button';
import styles from './beauty-depth-room.module.css';

type System = 'makeup' | 'fragrance' | 'devices' | 'inventory' | 'maintenance' | 'progress' | 'body' | 'today';

type Config = {
  title: string;
  kicker: string;
  subtitle: string;
  question: string;
  terms: string[];
  material: string;
};

const CONFIG: Record<System, Config> = {
  makeup: { title:'Makeup Studio', kicker:'MAKEUP', subtitle:'Looks, placement, products and event preparation.', question:'What look fits this moment?', terms:['makeup','foundation','concealer','mascara','lip','blush','eyeshadow','brow','primer','powder'], material:'pigment' },
  fragrance: { title:'Fragrance Wardrobe', kicker:'FRAGRANCE', subtitle:'Scent, layering, occasions, wear and inventory.', question:'What scent fits this moment?', terms:['fragrance','perfume','scent','eau de'], material:'vapor' },
  devices: { title:'Devices + Tools', kicker:'EQUIPMENT', subtitle:'Use, clean, maintain and keep attachments together.', question:'What tool needs use or care?', terms:['device','led','solawave','yeamon','roller','gua sha','nood','flawless','electrode','wand'], material:'silver' },
  inventory: { title:'Beauty Inventory', kicker:'OWNERSHIP', subtitle:'What you own, what is active, what is backup and what needs identification.', question:'What do I actually own and need?', terms:[], material:'shelf' },
  maintenance: { title:'Beauty Maintenance', kicker:'RHYTHM', subtitle:'Brows, nails, hair removal, whitening, devices and repeating care.', question:'What maintenance is approaching?', terms:['brow','lash','nail','wax','laser','whitening','hair removal','device','wash','clean'], material:'pearl' },
  progress: { title:'Progress + History', kicker:'HISTORY', subtitle:'Skin, hair, treatment, product response and maintenance over time.', question:'What has changed over time?', terms:[], material:'history' },
  body: { title:'Body Treatment Lab', kicker:'BODY', subtitle:'Body skin, shower care, hydration, hair removal, hands and feet.', question:'What does my body care need?', terms:['body','lotion','deodorant','shower','bath','hand','foot','feet','leg','scrub'], material:'amber' },
  today: { title:'Beauty Today', kicker:'NOW', subtitle:'Only the Beauty care that is actually relevant today.', question:'What does my beauty care need today?', terms:[], material:'pearl' },
};

function textOf(value: { name:string; category:string; ingredients:string|null; routinePosition:string|null; usageFrequency:string|null }) {
  return `${value.name} ${value.category} ${value.ingredients ?? ''} ${value.routinePosition ?? ''} ${value.usageFrequency ?? ''}`.toLowerCase();
}

function matches(text: string, terms: string[]) {
  return !terms.length || terms.some((term) => text.includes(term));
}

export async function BeautyDepthRoom({ system }: { system: System }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const config = CONFIG[system];
  const [products, routines, events, hairLogs] = await Promise.all([
    getBeautyProducts(session.user.id),
    getBeautyRoutinesByUser(session.user.id),
    getCalendarEventsByUser(session.user.id),
    getHairLogs(session.user.id),
  ]);

  const selectedProducts = products.filter((product) => matches(textOf(product), config.terms));
  const selectedRoutines = routines.filter((routine) => matches(`${routine.name} ${routine.notes ?? ''} ${(routine.products ?? []).join(' ')}`.toLowerCase(), config.terms));
  const now = new Date();
  const upcoming = events.filter((event) => event.startAt.getTime() >= now.getTime()).sort((a,b) => a.startAt.getTime() - b.startAt.getTime());
  const photos = selectedProducts.filter((product) => Boolean(product.photoUrl)).slice(0,8);
  const firstName = session.user.name?.trim().split(/\s+/)[0] || 'You';
  const active = selectedProducts.filter((product) => Boolean(product.routinePosition || product.usageFrequency));
  const responses = selectedProducts.filter((product) => Boolean(product.reaction?.trim()));
  const backups = selectedProducts.filter((product) => /\bbackup\b|back up/i.test(textOf(product)));
  const nextEvent = upcoming.find((event) => config.terms.some((term) => `${event.title} ${event.description ?? ''}`.toLowerCase().includes(term))) ?? null;

  return (
    <main className={styles.viewport}>
      <section className={styles.room} data-material={config.material} data-beauty-depth-room>
        <header className={styles.header}>
          <Link href="/home" className={styles.brand}>Glow OS</Link>
          <nav className={styles.worlds}>{WORLD_TARGETS.map((target) => <Link key={target.world} href={target.path} className={target.world === 'beauty' ? styles.active : undefined}>{target.label}</Link>)}</nav>
          <BeautyAskGlowButton className={styles.ask}/>
        </header>
        <Link href="/beauty" className={styles.back}><ArrowLeft size={14}/> Beauty</Link>
        <div className={styles.heading}><small>{config.kicker}</small><h1>{config.title}</h1><p>{config.subtitle}</p></div>

        <section className={styles.stage}>
          <div className={styles.orbitOne}/><div className={styles.orbitTwo}/><div className={styles.orbitThree}/>
          <div className={styles.central}><small>{firstName.toUpperCase()} · {config.kicker}</small><strong>{config.question}</strong><span>{selectedProducts.length ? `${selectedProducts.length} owned item${selectedProducts.length === 1 ? '' : 's'} in view` : 'No owned item is being invented here'}</span></div>
          <div className={styles.objects}>
            {photos.length ? photos.map((product,index) => <span key={product.id} className={styles.productObject} style={{ '--i':index, backgroundImage:`url(${product.photoUrl})` } as React.CSSProperties}/>) : [0,1,2,3,4].map((index) => <span key={index} className={styles.materialObject} style={{ '--i':index } as React.CSSProperties}/>) }
          </div>
        </section>

        <aside className={styles.intelligence}>
          <section><small>NOW</small><h2>{nextEvent ? nextEvent.title : 'Nothing dated is required'}</h2><p>{nextEvent ? nextEvent.startAt.toLocaleString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}) : 'This system stays quiet when there is no real time-based signal.'}</p></section>
          <section><small>ROUTINES</small><h2>{selectedRoutines.length ? `${selectedRoutines.length} connected` : 'None connected'}</h2>{selectedRoutines.slice(0,3).map((routine) => <p key={routine.id}>{routine.name}</p>)}</section>
          <section><small>STATE</small><div className={styles.stats}><span><b>{selectedProducts.length}</b>Owned</span><span><b>{active.length}</b>Active</span><span><b>{backups.length || '—'}</b>Backups</span><span><b>{responses.length || '—'}</b>Responses</span></div></section>
          {system === 'progress' && hairLogs[0] ? <section><small>HAIR HISTORY</small><h2>{hairLogs[0].style || hairLogs[0].eventType}</h2><p>{hairLogs[0].nextAction || 'No next action recorded.'}</p></section> : null}
        </aside>

        <footer className={styles.footer}>
          <Link href="/beauty" className={styles.footerAction}><span><PackageOpen size={15}/><b>Return to Personal Atelier</b></span><ChevronRight size={14}/></Link>
          <span className={styles.saved}>Real data only · no sample Beauty state</span>
        </footer>
      </section>
    </main>
  );
}