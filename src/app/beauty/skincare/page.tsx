import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getBeautyProducts } from '@/lib/data/completion-v1';
import {
  INVENTORY_STATUS_LABEL,
  MASTER_BEAUTY_INVENTORY,
  SKINCARE_PAGE_SPECS,
  normalizeBeautyName,
  type BeautyInventoryItem,
} from '@/lib/beauty/skincare-master';
import {
  ArrowLeft,
  ArrowRight,
  CircleHelp,
  Moon,
  Search,
  ShieldCheck,
  SunMedium,
} from 'lucide-react';
import styles from './skincare-treatment-lab.module.css';

export const dynamic = 'force-dynamic';

type BeautyProduct = Awaited<ReturnType<typeof getBeautyProducts>>[number];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

const GROUP_ORDER = [
  'Current Skin + Daily Decisions',
  'Morning System',
  'Evening System',
  'Retinoid + Active System',
  'Barrier + Sensitivity',
  'Acne System',
  'Prescription + Provider Care',
  'Product System',
  'Product Testing',
  'Devices',
  'Procedures',
  'Progress',
  'Travel + Special Modes',
  'Body Skincare',
];

const REFERENCE_RAIL = [
  ['Life', '/life', '◉'],
  ['Journal', '/notes', '▤'],
  ['Calendar', '/calendar', '▦'],
  ['People', '/connections', '♙'],
  ['Explore', '/search', '⌖'],
  ['Settings', '/settings', '⚙'],
] as const;

function hrefFor(title: string) {
  const page = SKINCARE_PAGE_SPECS.find((entry) => entry.title === title);
  return page ? `/beauty/skincare?view=${page.slug}` : '/beauty/skincare';
}

function unitCount(records: BeautyInventoryItem[] = MASTER_BEAUTY_INVENTORY) {
  return records.reduce((sum, record) => sum + (record.quantity ?? 1), 0);
}

function countStatus(status: BeautyInventoryItem['status']) {
  return unitCount(MASTER_BEAUTY_INVENTORY.filter((record) => record.status === status));
}

function inventoryMatch(words: string[]) {
  return MASTER_BEAUTY_INVENTORY.filter((record) => {
    const haystack = `${record.name} ${record.category} ${(record.systems ?? []).join(' ')}`.toLowerCase();
    return words.some((word) => haystack.includes(word.toLowerCase()));
  });
}

function firstOwned(words: string[]) {
  const matches = inventoryMatch(words);
  return matches.find((record) => record.status === 'confirmed') ?? matches[0];
}

function isAssignedTo(product: BeautyProduct, time: 'morning' | 'evening') {
  const value = `${product.routinePosition ?? ''} ${product.usageFrequency ?? ''}`.toLowerCase();
  return time === 'morning' ? /\bam\b|morning/.test(value) : /\bpm\b|evening|night/.test(value);
}

function dayAssignment(products: BeautyProduct[], day: typeof DAYS[number]) {
  const aliases: Record<typeof DAYS[number], RegExp> = {
    Mon: /\bmon(day)?\b/i,
    Tue: /\btue(s|sday)?\b/i,
    Wed: /\bwed(nesday)?\b/i,
    Thu: /\bthu(r|rs|rsday)?\b/i,
    Fri: /\bfri(day)?\b/i,
    Sat: /\bsat(urday)?\b/i,
    Sun: /\bsun(day)?\b/i,
  };
  return products.find((product) => aliases[day].test(`${product.usageFrequency ?? ''} ${product.routinePosition ?? ''}`));
}

function shortName(value: string, maxWords = 4) {
  const words = value.split(/\s+/).filter(Boolean);
  return words.length > maxWords ? `${words.slice(0, maxWords).join(' ')}…` : words.join(' ');
}

function ProductGlyph({ label, tone = 'pearl' }: { label: string; tone?: 'pearl' | 'amber' | 'blue' | 'violet' | 'gold' }) {
  return (
    <span className={`${styles.productGlyph} ${styles[`productTone${tone[0].toUpperCase()}${tone.slice(1)}`]}`} aria-hidden="true">
      <span className={styles.productCap} />
      <span className={styles.productLabel}>{label.slice(0, 1).toUpperCase()}</span>
    </span>
  );
}

function RoutineRow({
  step,
  product,
  detail,
  pending,
  tone,
}: {
  step: string;
  product: string;
  detail: string;
  pending: boolean;
  tone: 'pearl' | 'amber' | 'blue' | 'violet' | 'gold';
}) {
  return (
    <div className={styles.routineRow}>
      <ProductGlyph label={product} tone={tone} />
      <div className={styles.routineText}>
        <span className={styles.routineStep}>{step}</span>
        <strong>{shortName(product)}</strong>
        <small>{detail}</small>
      </div>
      <span className={`${styles.rowState} ${pending ? styles.rowPending : styles.rowReady}`} aria-label={pending ? 'Owned but not assigned' : 'Assigned'}>
        {pending ? '·' : '✓'}
      </span>
    </div>
  );
}

function ReferenceRail({ name }: { name: string }) {
  const unresolved = countStatus('needs-confirmation') + countStatus('needs-identification');
  return (
    <aside className={styles.localRail} aria-label="Glow OS Skincare navigation">
      <nav className={styles.railTools}>
        {REFERENCE_RAIL.map(([label, href, glyph]) => (
          <Link key={label} href={href} className={styles.railTool}>
            <span className={styles.railIcon}>{glyph}</span>
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      <div className={styles.railBottom}>
        <div className={styles.userTile}>
          <div className={styles.userPearl}>{name.slice(0, 1).toUpperCase()}</div>
          <div className={styles.userIntro}>
            <span>Your treatment lab,</span>
            <strong>{name}</strong>
          </div>
          <div className={styles.userMeta}>
            <span>Today</span>
            <strong>Skin check-in open</strong>
          </div>
          <div className={styles.userMeta}>
            <span>Identity review</span>
            <strong>{unresolved} items</strong>
          </div>
        </div>
        <Link href="/ask-glow?context=skincare" className={styles.shaktiTile}>
          <span className={styles.auraMini} />
          <div><strong>Shakti</strong><span>Listening</span></div>
        </Link>
      </div>
    </aside>
  );
}

function SkinStatePanel() {
  const signals = [
    ['Hydration', 'Log', '◒', styles.signalHydration],
    ['Barrier', 'Log', '≋', styles.signalBarrier],
    ['Oil', 'Log', '◌', styles.signalOil],
    ['Calm', 'Log', '◔', styles.signalCalm],
  ] as const;
  return (
    <section className={`${styles.glass} ${styles.skinState}`}>
      <div className={styles.panelHead}>
        <div><h2>Your Skin State</h2><p>Updated when you check in</p></div>
      </div>
      <Link href={hrefFor('Skin Today')} className={styles.stateOrb} aria-label="Open Skin Today check-in">
        <span className={styles.orbHalo} />
        <span className={`${styles.orbDroplet} ${styles.orbDropletOne}`} />
        <span className={`${styles.orbDroplet} ${styles.orbDropletTwo}`} />
        <span className={`${styles.orbDroplet} ${styles.orbDropletThree}`} />
        <div>
          <span className={styles.orbKicker}>CURRENT</span>
          <strong>—</strong>
          <span className={styles.orbAction}>CHECK IN TO ASSESS</span>
          <small>No score until you log your current state</small>
        </div>
      </Link>
      <div className={styles.skinSignals}>
        {signals.map(([label, value, glyph, tone]) => (
          <div className={styles.signal} key={label}>
            <span className={`${styles.signalGlyph} ${tone}`}>{glyph}</span>
            <small>{label}</small>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function RoutinePanel({ time, products }: { time: 'morning' | 'evening'; products: BeautyProduct[] }) {
  const assigned = products.filter((product) => isAssignedTo(product, time)).slice(0, 4);
  const morningFallback = [
    ['Cleanser', firstOwned(['cleanser'])],
    ['Treatment', firstOwned(['vitamin c'])],
    ['Hydrate', firstOwned(['hyaluronic', 'hydration + support'])],
    ['Protect', firstOwned(['face sunscreen', 'spf'])],
  ] as const;
  const eveningFallback = [
    ['Cleanse', firstOwned(['cleansing balm', 'cleanser'])],
    ['Treatment', firstOwned(['retinoids / retinal', 'azelaic acid'])],
    ['Hydrate', firstOwned(['moisturizers + barrier', 'hydration + support'])],
    ['Optional', firstOwned(['oil', 'lip care'])],
  ] as const;
  const fallback = time === 'morning' ? morningFallback : eveningFallback;
  const tones = time === 'morning'
    ? (['pearl', 'amber', 'blue', 'gold'] as const)
    : (['pearl', 'violet', 'blue', 'gold'] as const);
  const title = time === 'morning' ? 'Morning Routine' : 'Evening Routine';
  const subtitle = time === 'morning' ? 'Protect & Hydrate' : 'Repair & Renew';
  const destination = time === 'morning' ? 'Morning Skincare' : 'Evening Skincare';

  return (
    <section className={`${styles.glass} ${styles.routinePanel}`}>
      <div className={styles.routineHeading}>
        <span className={`${styles.routineMoon} ${time === 'morning' ? styles.sunGlyph : styles.moonGlyph}`}>
          {time === 'morning' ? <SunMedium size={21} /> : <Moon size={20} />}
        </span>
        <div><h2>{title}</h2><p>{subtitle}</p></div>
      </div>
      <div className={styles.routineRows}>
        {fallback.map(([step, record], index) => {
          const actual = assigned[index];
          const product = actual?.name ?? record?.name ?? `${step} slot`;
          return (
            <RoutineRow
              key={`${time}-${step}`}
              step={actual?.routinePosition || step}
              product={product}
              detail={actual?.usageFrequency || (record ? 'Owned · not assigned to this routine' : 'No owned product identified')}
              pending={!actual}
              tone={tones[index]}
            />
          );
        })}
      </div>
      <Link href={hrefFor(destination)} className={styles.adjustButton}>
        <span>Adjust to skin state</span><span>⌘</span>
      </Link>
    </section>
  );
}

function ProductsCard({ dbProducts }: { dbProducts: BeautyProduct[] }) {
  const sample = MASTER_BEAUTY_INVENTORY.filter((record) => record.status === 'confirmed').slice(0, 5);
  const dbNames = new Set(dbProducts.map((product) => normalizeBeautyName(product.name)));
  const matched = MASTER_BEAUTY_INVENTORY.filter((record) => dbNames.has(normalizeBeautyName(record.name))).length;
  return (
    <section className={`${styles.glass} ${styles.smallCard}`}>
      <div className={styles.smallCardTitle}><h3>Products</h3><span>{dbProducts.length || unitCount()} active/editable</span></div>
      <div className={styles.productSummary}>
        <ProductGlyph label={sample[0]?.name ?? 'P'} tone="amber" />
        <div>{sample.map((record) => <span key={record.name}>{shortName(record.name, 4)}</span>)}</div>
      </div>
      <div className={styles.cardMeta}>{unitCount()} physical units · {matched} database identity matches</div>
      <Link href={hrefFor('Product Library')} className={styles.inlineArrow}>View all <span>→</span></Link>
    </section>
  );
}

function PrescriptionsCard({ dbProducts }: { dbProducts: BeautyProduct[] }) {
  const prescriptions = dbProducts.filter((product) => /prescription|\brx\b/i.test(product.category)).slice(0, 3);
  return (
    <section className={`${styles.glass} ${styles.smallCard}`}>
      <div className={styles.smallCardTitle}><h3>Prescriptions</h3><span>Rx</span></div>
      <div className={styles.infoList}>
        {prescriptions.length ? prescriptions.map((product) => (
          <div key={product.id}><strong>{shortName(product.name, 4)}</strong><span>{product.usageFrequency || product.routinePosition || 'Directions not entered'}</span></div>
        )) : (
          <>
            <div><strong>No verified Rx connected</strong><span>Add exact prescription name + strength</span></div>
            <div><strong>Frequency</strong><span>Provider directions required</span></div>
            <div><strong>Application area</strong><span>Not entered</span></div>
          </>
        )}
      </div>
      <Link href={hrefFor('Prescriptions')} className={styles.inlineArrow}>View plan <span>→</span></Link>
    </section>
  );
}

function ConflictCard() {
  const retinoids = unitCount(inventoryMatch(['retinoid', 'retinal', 'retinol']));
  const exfoliation = unitCount(inventoryMatch(['exfoliating', 'exfoliant', 'aha', 'bha', 'salicylic']));
  return (
    <section className={`${styles.glass} ${styles.smallCard}`}>
      <div className={styles.smallCardTitle}><h3>Ingredient Conflicts</h3><span className={styles.reviewText}>Review</span></div>
      <div className={styles.conflictList}>
        <div><span className={styles.conflictDot}>×</span><div><strong>{retinoids} retinoid/retinal units</strong><span>Ownership overlap needs schedule review.</span></div></div>
        <div><span className={styles.conflictDot}>×</span><div><strong>{exfoliation} exfoliating/acid-linked units</strong><span>Do not infer same-night compatibility.</span></div></div>
      </div>
      <Link href={hrefFor('Ingredient Conflicts')} className={styles.inlineArrow}>Review conflicts <span>→</span></Link>
    </section>
  );
}

function SensitivityCard({ dbProducts }: { dbProducts: BeautyProduct[] }) {
  const reactions = dbProducts.filter((product) => Boolean(product.reaction?.trim())).slice(0, 3);
  const fallback = ['Fragrance', 'Essential Oils', 'Alcohol'];
  return (
    <section className={`${styles.glass} ${styles.smallCard}`}>
      <div className={styles.smallCardTitle}><h3>Sensitivity</h3><span className={styles.goodText}>{reactions.length ? `${reactions.length} logged` : 'Unscored'}</span></div>
      <div className={styles.sensitivityList}>
        {(reactions.length ? reactions : fallback).map((entry, index) => {
          const label = typeof entry === 'string' ? entry : shortName(entry.name, 3);
          const note = typeof entry === 'string' ? 'No personal reaction logged' : shortName(entry.reaction || '', 7);
          return <div key={`${label}-${index}`}><span>♢</span><div><strong>{label}</strong><span>{note}</span></div></div>;
        })}
      </div>
      <Link href={hrefFor('Sensitivity')} className={styles.inlineArrow}>Full report <span>→</span></Link>
    </section>
  );
}

function RotationSchedule({ dbProducts }: { dbProducts: BeautyProduct[] }) {
  const scheduled = DAYS.map((day) => dayAssignment(dbProducts, day));
  const hasSchedule = scheduled.some(Boolean);
  return (
    <section className={`${styles.glass} ${styles.rotationCard}`}>
      <div className={styles.rotationHead}>
        <div><h3>Rotation Schedule</h3><p>Balanced active turnover and barrier support</p></div>
        <Link href={hrefFor('Active Rotation')} className={styles.textLink}>Open week</Link>
      </div>
      <div className={styles.weekGrid}>
        {DAYS.map((day, index) => {
          const product = scheduled[index];
          return <div className={styles.dayCell} key={day}><span>{day}</span><strong>{product ? shortName(product.name, 2) : 'Not set'}</strong><small>{product ? shortName(product.usageFrequency || product.routinePosition || 'Assigned', 3) : '—'}</small></div>;
        })}
      </div>
      <div className={styles.nextTreatment}>
        <span>☾ &nbsp; Next up: <strong>{hasSchedule ? 'Use saved schedule' : 'Not scheduled'}</strong></span>
        <Link href={hrefFor('Active Rotation')}>Adapt schedule <span>⌘</span></Link>
      </div>
    </section>
  );
}

function ProviderPanel() {
  return (
    <section className={`${styles.glass} ${styles.providerPanel}`}>
      <div className={styles.providerTop}>
        <div><h2>Dermatologist</h2><strong>Provider not connected</strong><span>Add your real clinician to activate provider care.</span><Link href={hrefFor('Dermatology')} className={styles.messagePill}>Add provider</Link></div>
        <div className={styles.providerPortrait}>＋</div>
      </div>
      <div className={styles.instructionBox}>
        <strong>Instructions</strong>
        <p>Provider and prescription directions appear here exactly as entered.</p>
        <p>No clinician, credentials, portrait, or treatment rules are invented.</p>
        <Link href={hrefFor('Provider Instructions')} className={styles.inlineArrow}>View full plan <span>→</span></Link>
      </div>
    </section>
  );
}

function ProgressPanel() {
  return (
    <section className={`${styles.glass} ${styles.progressPanel}`}>
      <div><h2>Progress Photos</h2><p>See changes over time</p></div>
      <div className={styles.photoStrip}>
        {['Baseline', 'Next', 'Compare'].map((label) => (
          <div className={styles.photoPlaceholder} key={label}><span className={styles.photoFace}/><small>{label}</small></div>
        ))}
      </div>
      <Link href={hrefFor('Progress Photos')} className={styles.inlineArrow}>View timeline <span>→</span></Link>
    </section>
  );
}

function PatchPanel() {
  return (
    <section className={`${styles.glass} ${styles.patchPanel}`}>
      <div className={styles.panelHead}><div><h2>Patch Test</h2><p>No active controlled test</p></div><span className={styles.neutralPill}>Ready</span></div>
      <p>Product-specific directions determine the test area and timing.</p>
      <Link href={hrefFor('Patch Test')} className={styles.inlineArrow}>View details <span>→</span></Link>
    </section>
  );
}

function ShaktiMonitor() {
  const unresolved = countStatus('needs-confirmation') + countStatus('needs-identification');
  return (
    <section className={`${styles.glass} ${styles.monitorPanel}`}>
      <span className={styles.auraMini}/>
      <div><strong>Shakti is monitoring</strong><span>{unresolved} product identities remain intentionally unresolved.</span></div>
      <span className={styles.monitorCheck}>✓</span>
    </section>
  );
}

function LabHome({ dbProducts, name }: { dbProducts: BeautyProduct[]; name: string }) {
  return (
    <div className={styles.referenceShell}>
      <div className={styles.fitOuter}>
        <div className={styles.referenceCanvas}>
          <div className={styles.referenceFrame}>
            <header className={styles.labHeader}>
              <div className={styles.headerBrand}><strong>Glow OS⌄</strong><span>Batch 1</span></div>
              <div className={styles.titleLockup}><h1>SKINCARE <span>·</span> TREATMENT LAB</h1><p>Intelligent care. Safe. Compatible. Effective.</p></div>
              <div className={styles.headerActions}>
                <Link href="/ask-glow?context=skincare" className={styles.askGlow}><Search size={12}/><span>Ask Glow…</span></Link>
                <span className={styles.aura}/>
              </div>
            </header>

            <div className={styles.labBody}>
              <ReferenceRail name={name}/>
              <main className={styles.dashboardMain}>
                <div className={styles.primaryGrid}>
                  <SkinStatePanel/>
                  <RoutinePanel time="morning" products={dbProducts}/>
                  <RoutinePanel time="evening" products={dbProducts}/>
                </div>
                <div className={styles.lowerGrid}>
                  <ProductsCard dbProducts={dbProducts}/>
                  <PrescriptionsCard dbProducts={dbProducts}/>
                  <ConflictCard/>
                  <SensitivityCard dbProducts={dbProducts}/>
                </div>
                <RotationSchedule dbProducts={dbProducts}/>
              </main>
              <aside className={styles.rightRail} aria-label="Skincare context rail">
                <ProviderPanel/>
                <ProgressPanel/>
                <PatchPanel/>
                <ShaktiMonitor/>
              </aside>
            </div>
          </div>

          <div className={styles.bottomDock}>
            <button type="button" disabled className={styles.dockSide}>← &nbsp; Undo</button>
            <Link href="/beauty/lab" className={styles.dockAdd} aria-label="Open Beauty Lab">＋</Link>
            <button type="button" disabled className={styles.dockSide}>Redo &nbsp; →</button>
          </div>
          <div className={styles.savedReceipt}><span>✓</span> All changes saved</div>
        </div>
      </div>
    </div>
  );
}

function RoomVisual({ group }: { group: string }) {
  if (group === 'Current Skin + Daily Decisions') return <div className={`${styles.roomVisual} ${styles.faceMap}`}><div className={styles.faceOutline}><i/><i/><i/><i/></div></div>;
  if (group === 'Morning System') return <div className={`${styles.roomVisual} ${styles.risingPath}`}>{['Cleanse','Treat','Hydrate','Protect'].map((label)=><span key={label}>{label}</span>)}</div>;
  if (group === 'Evening System') return <div className={`${styles.roomVisual} ${styles.descendingPath}`}>{['Remove','Cleanse','Treat','Recover'].map((label)=><span key={label}>{label}</span>)}</div>;
  if (group === 'Retinoid + Active System') return <div className={`${styles.roomVisual} ${styles.activeOrbit}`}><span/><span/><span/><strong>ACTIVE</strong></div>;
  if (group === 'Barrier + Sensitivity') return <div className={`${styles.roomVisual} ${styles.barrierLayers}`}><span/><span/><span/><span/></div>;
  if (group === 'Acne System') return <div className={`${styles.roomVisual} ${styles.acneMap}`}><div><i/><i/><i/><i/><i/></div></div>;
  if (group === 'Prescription + Provider Care') return <div className={`${styles.roomVisual} ${styles.providerSlab}`}><span>Provider directions</span><span>Exact strength</span><span>Frequency</span><span>Follow-up</span></div>;
  if (group === 'Product System') return <div className={`${styles.roomVisual} ${styles.productShelf}`}>{[1,2,3,4,5].map((value)=><span key={value}/>)}</div>;
  if (group === 'Product Testing') return <div className={`${styles.roomVisual} ${styles.testTimeline}`}><span/><span/><span/><span/></div>;
  if (group === 'Devices') return <div className={`${styles.roomVisual} ${styles.devicePlinth}`}><span/><strong>DEVICE</strong></div>;
  if (group === 'Procedures') return <div className={`${styles.roomVisual} ${styles.procedureLine}`}><span/><span/><span/><span/></div>;
  if (group === 'Progress') return <div className={`${styles.roomVisual} ${styles.progressFrames}`}>{[1,2,3].map((value)=><span key={value}/>)}</div>;
  if (group === 'Travel + Special Modes') return <div className={`${styles.roomVisual} ${styles.travelTray}`}>{[1,2,3,4].map((value)=><span key={value}/>)}</div>;
  return <div className={`${styles.roomVisual} ${styles.bodyMap}`}><span/><i/><i/><i/><i/></div>;
}

function Subpage({ slug }: { slug: string }) {
  const spec = SKINCARE_PAGE_SPECS.find((page) => page.slug === slug);
  if (!spec) return null;
  const related = MASTER_BEAUTY_INVENTORY.filter((record) => {
    const haystack = `${record.name} ${record.category} ${(record.systems ?? []).join(' ')}`.toLowerCase();
    return (record.systems ?? []).includes(slug) || spec.fields.some((field) => haystack.includes(field.toLowerCase().split(' ')[0]));
  }).slice(0, 7);
  const index = SKINCARE_PAGE_SPECS.indexOf(spec);
  const next = SKINCARE_PAGE_SPECS[(index + 1) % SKINCARE_PAGE_SPECS.length];

  return (
    <div className={styles.subShell}>
      <div className={styles.subTop}>
        <Link href="/beauty/skincare" className={styles.subBack}><ArrowLeft size={13}/> Treatment Lab</Link>
        <div className={styles.subTopTitle}><span>{spec.group}</span><strong>{spec.title}</strong></div>
        <Link href="/ask-glow?context=skincare" className={styles.subAsk}><Search size={12}/> Ask Glow</Link>
      </div>
      <section className={`${styles.glass} ${styles.subRoom}`}>
        <div className={styles.subCopy}>
          <p className={styles.eyebrow}>PRIMARY HUMAN QUESTION</p>
          <h1>{spec.question}</h1>
          <p>{spec.description}</p>
          <div className={styles.fieldCloud}>{spec.fields.map((field)=><span key={field}>{field}</span>)}</div>
          <div className={styles.safetyReceipt}><ShieldCheck size={13}/><span>Exact product identity, provider directions, testing status, and personal response remain separate sources of truth.</span></div>
        </div>
        <div className={styles.subObject}>
          <span className={styles.geometryLabel}>{spec.geometry}</span>
          <RoomVisual group={spec.group}/>
          <div className={styles.relatedShelf}>
            {related.length ? related.slice(0,5).map((record)=>(
              <div key={record.name}><ProductGlyph label={record.name}/><strong>{shortName(record.name,3)}</strong><span>{INVENTORY_STATUS_LABEL[record.status]}</span></div>
            )) : <div className={styles.noForcedProduct}><CircleHelp size={16}/><span>No product is forced into this room until it is functionally relevant.</span></div>}
          </div>
        </div>
      </section>
      <div className={styles.subReceipt}><span>{String(index + 1).padStart(2,'0')} / {SKINCARE_PAGE_SPECS.length} · one master inventory, no duplicated product truth</span><Link href={`/beauty/skincare?view=${next.slug}`}>{next.title}<ArrowRight size={12}/></Link></div>
      <section className={styles.roomIndex}>
        <div className={styles.roomIndexHead}><div><span>LAB INDEX</span><strong>All {SKINCARE_PAGE_SPECS.length} skincare environments</strong></div><span>Different questions · different spatial logic</span></div>
        <div className={styles.roomIndexGrid}>{GROUP_ORDER.map((group)=>{
          const pages=SKINCARE_PAGE_SPECS.filter((page)=>page.group===group);
          if(!pages.length)return null;
          return <div className={styles.roomIndexGroup} key={group}><strong>{group}</strong>{pages.map((page)=><Link className={page.slug===slug?styles.roomIndexActive:''} key={page.slug} href={`/beauty/skincare?view=${page.slug}`}>{page.title}</Link>)}</div>;
        })}</div>
      </section>
    </div>
  );
}

export default async function SkincareTreatmentLabPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const params = await searchParams;
  const requested = params.view ?? 'home';
  const view = requested === 'home' || SKINCARE_PAGE_SPECS.some((page) => page.slug === requested) ? requested : 'home';
  const dbProducts = await getBeautyProducts(session.user.id);
  const firstName = session.user.name?.trim().split(/\s+/)[0] || 'You';
  return view === 'home' ? <LabHome dbProducts={dbProducts} name={firstName}/> : <Subpage slug={view}/>;
}
