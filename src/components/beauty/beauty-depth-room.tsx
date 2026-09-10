import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getBeautyRoutinesByUser } from '@/lib/data/beauty-routines';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import { getBeautyProducts, getHairLogs } from '@/lib/data/completion-v1';
import styles from './beauty-domain-rooms.module.css';

type System = 'makeup' | 'fragrance' | 'devices' | 'inventory' | 'maintenance' | 'progress' | 'body' | 'today';

type Config = {
  title: string;
  kicker: string;
  subtitle: string;
  question: string;
  terms: string[];
  orbit: Array<{ label: string; href: string }>;
};

const CONFIG: Record<System, Config> = {
  makeup: {
    title: 'Makeup Studio', kicker: 'LOOK FIRST',
    subtitle: 'Occasion, face, placement and result come first. Products support the look instead of becoming the room.',
    question: 'What look fits this moment?',
    terms: ['makeup','foundation','concealer','mascara','lip','blush','eyeshadow','brow','primer','powder'],
    orbit: [{ label:'Beauty atelier',href:'/beauty' },{ label:'Beauty inventory',href:'/beauty/inventory' },{ label:'Routines',href:'/routines' }],
  },
  fragrance: {
    title: 'Fragrance Wardrobe', kicker: 'SCENT + OCCASION',
    subtitle: 'A quiet wardrobe of scent, layering, wear context and the bottles already in your Life Model.',
    question: 'What scent fits this moment?',
    terms: ['fragrance','perfume','scent','eau de'],
    orbit: [{ label:'Beauty atelier',href:'/beauty' },{ label:'Inventory',href:'/beauty/inventory' },{ label:'Beauty today',href:'/beauty/today' }],
  },
  devices: {
    title: 'Devices + Tools', kicker: 'CARE BENCH',
    subtitle: 'Use, clean and maintain tools as active objects with state, attachments and care rhythm.',
    question: 'What tool needs use or care?',
    terms: ['device','led','solawave','yeamon','roller','gua sha','nood','flawless','electrode','wand'],
    orbit: [{ label:'Gua Sha Studio',href:'/beauty/gua-sha' },{ label:'Maintenance',href:'/beauty/maintenance' },{ label:'Inventory',href:'/beauty/inventory' }],
  },
  inventory: {
    title: 'Beauty Inventory', kicker: 'PERSONAL ARCHIVE',
    subtitle: 'One ownership view into shared Beauty objects: active, backup, unidentified, used in routines and connected elsewhere.',
    question: 'What do I actually own and need?',
    terms: [],
    orbit: [{ label:'Beauty atelier',href:'/beauty' },{ label:'Devices + tools',href:'/beauty/devices' },{ label:'Progress + history',href:'/beauty/progress' }],
  },
  maintenance: {
    title: 'Beauty Maintenance', kicker: 'RHYTHM',
    subtitle: 'Recurring care is shown as a maintenance rhythm, not mixed into the daily routine stream.',
    question: 'What maintenance is approaching?',
    terms: ['brow','lash','nail','wax','laser','whitening','hair removal','device','wash','clean'],
    orbit: [{ label:'Beauty today',href:'/beauty/today' },{ label:'Routines',href:'/routines' },{ label:'Calendar',href:'/calendar' }],
  },
  progress: {
    title: 'Progress + History', kicker: 'CHANGE OVER TIME',
    subtitle: 'A history lens for product response, treatments, maintenance and recorded hair or beauty changes.',
    question: 'What has changed over time?',
    terms: [],
    orbit: [{ label:'Beauty atelier',href:'/beauty' },{ label:'Inventory',href:'/beauty/inventory' },{ label:'Timeline',href:'/timeline' }],
  },
  body: {
    title: 'Body Treatment Lab', kicker: 'BODY MAP',
    subtitle: 'Body care is organized by the body and its needs: hydration, treatment, grooming, hands, feet and maintenance.',
    question: 'What does my body care need?',
    terms: ['body','lotion','deodorant','shower','bath','hand','foot','feet','leg','scrub'],
    orbit: [{ label:'Beauty atelier',href:'/beauty' },{ label:'Maintenance',href:'/beauty/maintenance' },{ label:'Inventory',href:'/beauty/inventory' }],
  },
  today: {
    title: 'Beauty Today', kicker: 'NOW',
    subtitle: 'Only beauty care that is actually relevant to the current day. The rest stays quiet until it matters.',
    question: 'What does my beauty care need today?',
    terms: [],
    orbit: [{ label:'Beauty atelier',href:'/beauty' },{ label:'Routines',href:'/routines' },{ label:'Maintenance',href:'/beauty/maintenance' }],
  },
};

type Product = Awaited<ReturnType<typeof getBeautyProducts>>[number];
type Routine = Awaited<ReturnType<typeof getBeautyRoutinesByUser>>[number];
type Event = Awaited<ReturnType<typeof getCalendarEventsByUser>>[number];
type HairLog = Awaited<ReturnType<typeof getHairLogs>>[number];

function productText(value: Product) {
  return `${value.name} ${value.category} ${value.ingredients ?? ''} ${value.routinePosition ?? ''} ${value.usageFrequency ?? ''}`.toLowerCase();
}
function matches(text: string, terms: string[]) { return !terms.length || terms.some((term) => text.includes(term)); }
function routineText(value: Routine) { return `${value.name} ${value.notes ?? ''} ${(value.products ?? []).join(' ')}`.toLowerCase(); }
function eventText(value: Event) { return `${value.title} ${value.description ?? ''}`.toLowerCase(); }

function SignalColumn({ nextEvent, routines, owned, active }: { nextEvent: Event | null; routines: Routine[]; owned: number; active: number }) {
  return <aside className={styles.signal} aria-label="Current room signals">
    <div className={styles.signalBlock}><small>NOW</small><strong>{nextEvent?.title ?? 'Nothing dated is required'}</strong><p>{nextEvent ? nextEvent.startAt.toLocaleString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}) : 'Glow keeps the room quiet when there is no real time-based signal.'}</p></div>
    <div className={styles.signalBlock}><small>CONNECTED ROUTINES</small><strong>{routines.length ? `${routines.length} connected` : 'None connected yet'}</strong><p>{routines.slice(0,2).map((routine) => routine.name).join(' · ') || 'No page-local routine copy is created.'}</p></div>
    <div className={styles.signalBlock}><small>OBJECT STATE</small><strong>{owned} owned · {active} active</strong><p>These counts are projections of the same Beauty records used elsewhere in Glow.</p></div>
  </aside>;
}

function TodayScene({ routines, nextEvent }: { routines: Routine[]; nextEvent: Event | null }) {
  const phases = [
    ['AM', routines.find((r) => /am|morning/i.test(r.name))?.name ?? 'Morning care'],
    ['MIDDAY', 'Only if something needs attention'],
    ['PM', routines.find((r) => /pm|night|evening/i.test(r.name))?.name ?? 'Evening care'],
    ['NEXT', nextEvent?.title ?? 'No dated treatment'],
  ];
  return <div className={styles.todayFlow}><div className={styles.todayNow}><span className={styles.eyebrow}>CURRENT BEAUTY STATE</span><h2>Care for what matters now.</h2><p className={styles.questionMeta}>Today is a temporal lens. Products, routines and treatments appear because they are relevant now, not because this page owns copies of them.</p></div><div className={styles.temporalLine}>{phases.map(([label,value]) => <div className={styles.temporalCell} key={label}><small>{label}</small><strong>{value}</strong></div>)}</div></div>;
}

function MakeupScene({ products }: { products: Product[] }) {
  return <div className={styles.makeupStage}><div className={styles.faceMap} aria-label="Face placement map"/><div className={styles.lookBreakdown}><span className={styles.eyebrow}>ME → OCCASION → LOOK → FACE</span><h2>Build the look on the face, not in a product grid.</h2><p className={styles.questionMeta}>{products.length ? `${products.length} owned makeup objects can support this studio.` : 'No owned makeup products are being invented.'}</p><div className={styles.placement}><span>Complexion<br/><small>{products.filter(p=>/foundation|concealer|primer|powder/i.test(productText(p))).length} owned</small></span><span>Eyes + brows<br/><small>{products.filter(p=>/mascara|eye|brow/i.test(productText(p))).length} owned</small></span><span>Cheeks + lips<br/><small>{products.filter(p=>/blush|lip/i.test(productText(p))).length} owned</small></span></div></div></div>;
}

function FragranceScene({ products }: { products: Product[] }) {
  return <div className={styles.scentScene}><div className={styles.scentHalo} aria-hidden><span/><span/><span/></div><div className={styles.scentCopy}><span className={styles.eyebrow}>SCENT FIELD</span><h2>A wardrobe organized by mood, wear and occasion.</h2><p className={styles.questionMeta}>{products.length ? `${products.length} fragrance object${products.length===1?'':'s'} currently live in this lens.` : 'Your fragrance field is quiet until a real owned scent is present.'}</p></div></div>;
}

function DevicesScene({ products }: { products: Product[] }) {
  return <div className={styles.bench}><div className={styles.deviceObjects} aria-hidden><span/><span/><span/></div><div className={styles.benchCopy}><span className={styles.eyebrow}>TOOL BENCH</span><h2>Use state and care state belong together.</h2><p className={styles.questionMeta}>{products.length ? `${products.length} device or tool object${products.length===1?'':'s'} found.` : 'No devices are being fabricated for the scene.'} Cleaning, attachments and maintenance stay attached to the same canonical object.</p></div></div>;
}

function InventoryScene({ products, active, backups }: { products: Product[]; active: Product[]; backups: Product[] }) {
  return <div className={styles.archive}><div className={styles.shelf} aria-hidden><span/><span/><span/><span/></div><div className={styles.archiveCopy}><span className={styles.eyebrow}>OWNERSHIP ARCHIVE</span><h2>{products.length} owned objects, one source of truth.</h2><p className={styles.questionMeta}>{active.length} are connected to active usage or routine position. {backups.length ? `${backups.length} read as backups from recorded product text.` : 'No backup state is being guessed.'}</p></div></div>;
}

function MaintenanceScene({ routines, nextEvent }: { routines: Routine[]; nextEvent: Event | null }) {
  const moments = [
    ['NOW', routines[0]?.name ?? 'No maintenance due'],
    ['NEXT', routines[1]?.name ?? nextEvent?.title ?? 'Nothing scheduled'],
    ['LATER', routines[2]?.name ?? 'Keep quiet until due'],
    ['HISTORY', 'Completion remains traceable'],
  ];
  return <div className={styles.maintenanceTimeline}>{moments.map(([label,value]) => <div className={styles.maintenanceMoment} key={label}><small>{label}</small><strong>{value}</strong></div>)}</div>;
}

function ProgressScene({ products, hairLog }: { products: Product[]; hairLog: HairLog | null }) {
  const reaction = products.find((p) => p.reaction?.trim());
  const entries = [
    hairLog ? { date:'LATEST HAIR', title:hairLog.style || hairLog.eventType, body:hairLog.nextAction || 'No next action recorded.' } : null,
    reaction ? { date:'PRODUCT RESPONSE', title:reaction.name, body:reaction.reaction || 'Response recorded.' } : null,
    { date:'CURRENT', title:`${products.length} Beauty objects in history scope`, body:'History remains attached to real objects instead of becoming a separate copy of state.' },
  ].filter(Boolean) as Array<{date:string;title:string;body:string}>;
  return <div className={styles.historyFlow}>{entries.map((entry,index)=><div className={styles.historyEntry} key={`${entry.date}-${index}`}><time>{entry.date}</time><div><strong>{entry.title}</strong><p>{entry.body}</p></div></div>)}</div>;
}

function BodyScene({ products }: { products: Product[] }) {
  return <div className={styles.bodyMap}><div className={styles.silhouette} aria-label="Body care map"/><div className={styles.bodyCopy}><span className={styles.eyebrow}>BODY AS NAVIGATION</span><h2>Care follows the body instead of a category grid.</h2><p className={styles.questionMeta}>{products.length ? `${products.length} owned body-care object${products.length===1?'':'s'} are connected here.` : 'No body-care object is being invented.'} Hydration, treatment, grooming, hands and feet remain related but distinct needs.</p></div></div>;
}

function DomainScene(props: { system:System; products:Product[]; routines:Routine[]; nextEvent:Event|null; active:Product[]; backups:Product[]; hairLog:HairLog|null }) {
  const {system,products,routines,nextEvent,active,backups,hairLog}=props;
  if(system==='today') return <TodayScene routines={routines} nextEvent={nextEvent}/>;
  if(system==='makeup') return <MakeupScene products={products}/>;
  if(system==='fragrance') return <FragranceScene products={products}/>;
  if(system==='devices') return <DevicesScene products={products}/>;
  if(system==='inventory') return <InventoryScene products={products} active={active} backups={backups}/>;
  if(system==='maintenance') return <MaintenanceScene routines={routines} nextEvent={nextEvent}/>;
  if(system==='progress') return <ProgressScene products={products} hairLog={hairLog}/>;
  return <BodyScene products={products}/>;
}

function ProductStrip({ products }: { products: Product[] }) {
  const visible = products.slice(0,4);
  if(!visible.length) return <div className={styles.empty}>This room is connected to real data only. Nothing is shown here just to make the layout look full.</div>;
  return <section className={styles.objectStrip} aria-label="Connected Glow Objects">{visible.map((product)=><article className={styles.object} key={product.id}>{product.photoUrl ? <div className={styles.objectImage} style={{backgroundImage:`url(${product.photoUrl})`}}/> : null}<strong>{product.name}</strong><small>{product.category}{product.usageFrequency ? ` · ${product.usageFrequency}` : ''}</small></article>)}</section>;
}

export async function BeautyDepthRoom({ system }: { system: System }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const config = CONFIG[system];
  const [allProducts, allRoutines, events, hairLogs] = await Promise.all([
    getBeautyProducts(session.user.id),
    getBeautyRoutinesByUser(session.user.id),
    getCalendarEventsByUser(session.user.id),
    getHairLogs(session.user.id),
  ]);

  const products = allProducts.filter((product) => matches(productText(product), config.terms));
  const routines = allRoutines.filter((routine) => matches(routineText(routine), config.terms));
  const now = new Date();
  const upcoming = events.filter((event) => event.startAt.getTime() >= now.getTime()).sort((a,b)=>a.startAt.getTime()-b.startAt.getTime());
  const nextEvent = upcoming.find((event)=>!config.terms.length || config.terms.some((term)=>eventText(event).includes(term))) ?? null;
  const active = products.filter((product) => Boolean(product.routinePosition || product.usageFrequency));
  const backups = products.filter((product) => /\bbackup\b|back up/i.test(productText(product)));
  const firstName = session.user.name?.trim().split(/\s+/)[0] || 'You';

  return <main className={styles.viewport}>
    <article className={styles.room} data-system={system} data-glow-room={system}>
      <header className={styles.heading}>
        <div><small>{config.kicker}</small><h1>{config.title}</h1></div>
        <p>{config.subtitle}</p>
      </header>

      <section className={styles.question}>
        <div><span className={styles.eyebrow}>{firstName.toUpperCase()} · CURRENT LENS</span><h2 className={styles.questionTitle}>{config.question}</h2><p className={styles.questionMeta}>This is a projection into the shared Life Model. Object identity, state, history and relationships stay connected when you move elsewhere in Glow.</p></div>
        <SignalColumn nextEvent={nextEvent} routines={routines} owned={products.length} active={active.length}/>
      </section>

      <section className={styles.scene} aria-label={`${config.title} spatial room`}><div className={styles.heroMaterial}/><div className={styles.sceneContent}><DomainScene system={system} products={products} routines={routines} nextEvent={nextEvent} active={active} backups={backups} hairLog={hairLogs[0] ?? null}/></div></section>

      <ProductStrip products={products}/>

      <section className={styles.orbit} aria-label="Connected spaces">
        <div><h3>Connected through the Glow Graph</h3><p>Move laterally through related rooms without rebuilding a second navigation system. Glow Current remains the global movement layer.</p></div>
        <div className={styles.orbitLinks}>{config.orbit.map((item)=><Link href={item.href} key={item.href}>{item.label}</Link>)}</div>
      </section>
    </article>
  </main>;
}
