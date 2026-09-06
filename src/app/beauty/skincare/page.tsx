import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
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
  PackageCheck,
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

const LOCAL_RAIL = [
  ['Today', 'Skin Today', '◉'],
  ['Routine', 'Morning Skincare', '☼'],
  ['Inventory', 'Product Library', '▤'],
  ['Acne', 'Acne Today', '◌'],
  ['Devices', 'Device Library', '◇'],
  ['Progress', 'Progress Photos', '▣'],
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
  return inventoryMatch(words).find((record) => record.status === 'confirmed') ?? inventoryMatch(words)[0];
}

function isAssignedTo(product: BeautyProduct, time: 'morning' | 'evening') {
  const value = `${product.routinePosition ?? ''} ${product.usageFrequency ?? ''}`.toLowerCase();
  if (time === 'morning') return /\bam\b|morning/.test(value);
  return /\bpm\b|evening|night/.test(value);
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

function ProductGlyph({ label }: { label: string }) {
  return (
    <span className={styles.productGlyph} aria-hidden="true">
      <span className={styles.productCap} />
      <span className={styles.productLabel}>{label.slice(0, 1).toUpperCase()}</span>
    </span>
  );
}

function RoutineRow({
  step,
  product,
  detail,
  pending = false,
}: {
  step: string;
  product: string;
  detail: string;
  pending?: boolean;
}) {
  return (
    <div className={styles.routineRow}>
      <ProductGlyph label={product} />
      <div className={styles.routineText}>
        <span className={styles.routineStep}>{step}</span>
        <strong>{shortName(product)}</strong>
        <small>{detail}</small>
      </div>
      <span className={`${styles.rowState} ${pending ? styles.rowPending : styles.rowReady}`} aria-label={pending ? 'Needs assignment' : 'Assigned'}>
        {pending ? '·' : '✓'}
      </span>
    </div>
  );
}

function LocalRail({ name }: { name: string }) {
  return (
    <aside className={styles.localRail} aria-label="Treatment Lab local instruments">
      <div>
        <div className={styles.railBrand}>
          <strong>Glow OS</strong>
          <span>Skin · Treatment Lab</span>
        </div>
        <div className={styles.railTools}>
          {LOCAL_RAIL.map(([label, page, glyph]) => (
            <Link key={label} href={hrefFor(page)} className={styles.railTool}>
              <span className={styles.railIcon}>{glyph}</span>
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className={styles.railBottom}>
        <div className={styles.userTile}>
          <div className={styles.userPearl}>{name.slice(0, 1).toUpperCase()}</div>
          <div>
            <span>Your skincare lab</span>
            <strong>{name}</strong>
          </div>
          <div className={styles.userMeta}>
            <span>Inventory</span>
            <strong>{unitCount()} units</strong>
          </div>
          <div className={styles.userMeta}>
            <span>Identity review</span>
            <strong>{countStatus('needs-confirmation') + countStatus('needs-identification')} open</strong>
          </div>
        </div>

        <Link href="/ask-glow?context=skincare" className={styles.shaktiTile}>
          <span className={styles.auraMini} />
          <div>
            <strong>Shakti</strong>
            <span>Listening</span>
          </div>
        </Link>
      </div>
    </aside>
  );
}

function SkinStatePanel() {
  return (
    <section className={`${styles.glass} ${styles.skinState}`}>
      <div className={styles.panelHead}>
        <div>
          <h2>Your Skin State</h2>
          <p>Updated when you check in</p>
        </div>
        <Link href={hrefFor('Skin Today')} className={styles.textLink}>Open</Link>
      </div>

      <Link href={hrefFor('Skin Today')} className={styles.stateOrb} aria-label="Open Skin Today check-in">
        <span className={styles.orbHalo} />
        <div>
          <span className={styles.orbKicker}>CURRENT</span>
          <strong>CHECK IN</strong>
          <span>Log before Glow treats</span>
          <small>No invented score</small>
        </div>
      </Link>

      <div className={styles.skinSignals}>
        {[
          ['Hydration', 'Log', '◒'],
          ['Barrier', 'Log', '≋'],
          ['Oil', 'Log', '◌'],
          ['Calm', 'Log', '◔'],
        ].map(([label, value, glyph]) => (
          <div className={styles.signal} key={label}>
            <span className={styles.signalGlyph}>{glyph}</span>
            <small>{label}</small>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function RoutinePanel({
  time,
  products,
}: {
  time: 'morning' | 'evening';
  products: BeautyProduct[];
}) {
  const assigned = products.filter((product) => isAssignedTo(product, time)).slice(0, 4);
  const morningFallback = [
    ['Cleanse', firstOwned(['cleansers + makeup removers', 'cleanser'])],
    ['Hydrate', firstOwned(['hydration + support', 'hyaluronic'])],
    ['Moisturize', firstOwned(['moisturizers + barrier', 'moisturizer'])],
    ['Protect', firstOwned(['face sunscreen', 'spf'])],
  ] as const;
  const eveningFallback = [
    ['Remove', firstOwned(['makeup remover', 'cleansing balm', 'micellar cleansing'])],
    ['Cleanse', firstOwned(['cleansers + makeup removers', 'cleanser'])],
    ['Treatment', firstOwned(['retinoids / retinal', 'azelaic acid'])],
    ['Moisturize', firstOwned(['moisturizers + barrier', 'moisturizer'])],
  ] as const;
  const fallback = time === 'morning' ? morningFallback : eveningFallback;
  const title = time === 'morning' ? 'Morning Routine' : 'Evening Routine';
  const subtitle = time === 'morning' ? 'Protect + prepare' : 'Repair + review';
  const destination = time === 'morning' ? 'Morning Skincare' : 'Evening Skincare';

  return (
    <section className={`${styles.glass} ${styles.routinePanel}`}>
      <div className={styles.routineHeading}>
        <span className={`${styles.routineMoon} ${time === 'morning' ? styles.sunGlyph : styles.moonGlyph}`}>
          {time === 'morning' ? <SunMedium size={21} /> : <Moon size={20} />}
        </span>
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </div>

      <div className={styles.routineRows}>
        {assigned.length
          ? assigned.map((product, index) => (
              <RoutineRow
                key={product.id}
                step={product.routinePosition || `Step ${index + 1}`}
                product={product.name}
                detail={product.usageFrequency || 'Assigned in Beauty Lab'}
              />
            ))
          : fallback.map(([step, record]) => (
              <RoutineRow
                key={step}
                step={step}
                product={record?.name ?? `${step} slot`}
                detail={record ? 'Owned · not yet assigned to this routine' : 'No owned item identified for this slot'}
                pending
              />
            ))}
      </div>

      <Link href={hrefFor(destination)} className={styles.adjustButton}>
        <span>{assigned.length ? 'Adjust to skin state' : 'Build this routine'}</span>
        <span>⌘</span>
      </Link>
    </section>
  );
}

function ProviderPanel() {
  return (
    <section className={`${styles.glass} ${styles.providerPanel}`}>
      <div className={styles.providerTop}>
        <div>
          <h2>Dermatology</h2>
          <strong>Provider not connected</strong>
          <span>No clinician, photo, or instructions are invented.</span>
        </div>
        <div className={styles.providerPortrait}>＋</div>
      </div>
      <div className={styles.instructionBox}>
        <strong>Provider rules</strong>
        <p>Prescription and procedure directions override Glow routines.</p>
        <p>Store exact strength, frequency, application area, pause/resume rules, and follow-up instructions.</p>
        <Link href={hrefFor('Dermatology')} className={styles.inlineArrow}>Open provider care <span>→</span></Link>
      </div>
    </section>
  );
}

function ProgressPanel() {
  return (
    <section className={`${styles.glass} ${styles.progressPanel}`}>
      <div className={styles.panelHead}>
        <div>
          <h2>Progress Photos</h2>
          <p>Consistent, optional, evidence-first</p>
        </div>
      </div>
      <div className={styles.photoStrip}>
        {['Baseline', 'Next', 'Compare'].map((label) => (
          <div className={styles.photoPlaceholder} key={label}>
            <span className={styles.photoFace} />
            <small>{label}</small>
          </div>
        ))}
      </div>
      <Link href={hrefFor('Progress Photos')} className={styles.inlineArrow}>Open standardized camera <span>→</span></Link>
    </section>
  );
}

function PatchPanel() {
  return (
    <section className={`${styles.glass} ${styles.patchPanel}`}>
      <div className={styles.panelHead}>
        <div>
          <h2>Patch Test</h2>
          <p>One controlled variable</p>
        </div>
        <span className={styles.neutralPill}>No active test</span>
      </div>
      <p>Timing follows the product’s actual directions. Reactions stay linked to the exact item and area tested.</p>
      <Link href={hrefFor('Patch Test')} className={styles.inlineArrow}>Start or review a test <span>→</span></Link>
    </section>
  );
}

function ProductsCard({ dbProducts }: { dbProducts: BeautyProduct[] }) {
  const sample = MASTER_BEAUTY_INVENTORY.filter((record) => record.status === 'confirmed').slice(0, 5);
  const canonicalMatches = new Set(dbProducts.map((product) => normalizeBeautyName(product.name)));
  const matched = MASTER_BEAUTY_INVENTORY.filter((record) => canonicalMatches.has(normalizeBeautyName(record.name))).length;

  return (
    <section className={`${styles.glass} ${styles.smallCard}`}>
      <div className={styles.smallCardTitle}>
        <h3>Products</h3>
        <span>{unitCount()} units</span>
      </div>
      <div className={styles.productSummary}>
        <ProductGlyph label={sample[0]?.name ?? 'P'} />
        <div>
          {sample.map((record) => <span key={record.name}>{shortName(record.name, 5)}</span>)}
        </div>
      </div>
      <div className={styles.cardMeta}>{dbProducts.length} editable records · {matched} canonical name matches</div>
      <Link href={hrefFor('Product Library')} className={styles.inlineArrow}>View all <span>→</span></Link>
    </section>
  );
}

function PrescriptionsCard({ dbProducts }: { dbProducts: BeautyProduct[] }) {
  const prescriptions = dbProducts.filter((product) => /prescription|\brx\b/i.test(product.category)).slice(0, 3);
  return (
    <section className={`${styles.glass} ${styles.smallCard}`}>
      <div className={styles.smallCardTitle}>
        <h3>Prescriptions</h3>
        <span>Rx</span>
      </div>
      {prescriptions.length ? (
        <div className={styles.infoList}>
          {prescriptions.map((product) => (
            <div key={product.id}>
              <strong>{shortName(product.name, 4)}</strong>
              <span>{product.usageFrequency || product.routinePosition || 'Directions not entered'}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyCompact}>
          <strong>No verified Rx connected</strong>
          <span>Add only exact prescription name, strength, and clinician directions.</span>
        </div>
      )}
      <Link href={hrefFor('Prescriptions')} className={styles.inlineArrow}>Open treatment cabinet <span>→</span></Link>
    </section>
  );
}

function ConflictCard() {
  const retinoids = unitCount(inventoryMatch(['retinoids / retinal', 'retinol', 'retinaldehyde']));
  const exfoliation = unitCount(inventoryMatch(['exfoliating', 'exfoliant', 'aha', 'bha', 'salicylic']));
  return (
    <section className={`${styles.glass} ${styles.smallCard}`}>
      <div className={styles.smallCardTitle}>
        <h3>Ingredient Conflicts</h3>
        <span className={styles.reviewText}>Review</span>
      </div>
      <div className={styles.conflictList}>
        <div><span className={styles.conflictDot}>!</span><div><strong>{retinoids} retinoid/retinal units</strong><span>Overlap in ownership is not a schedule.</span></div></div>
        <div><span className={styles.conflictDot}>!</span><div><strong>{exfoliation} exfoliating/acid-linked units</strong><span>Compatibility is checked at routine time.</span></div></div>
      </div>
      <Link href={hrefFor('Ingredient Conflicts')} className={styles.inlineArrow}>Review compatibility <span>→</span></Link>
    </section>
  );
}

function SensitivityCard({ dbProducts }: { dbProducts: BeautyProduct[] }) {
  const reactions = dbProducts.filter((product) => Boolean(product.reaction?.trim())).slice(0, 3);
  return (
    <section className={`${styles.glass} ${styles.smallCard}`}>
      <div className={styles.smallCardTitle}>
        <h3>Sensitivity</h3>
        <span className={styles.goodText}>{reactions.length ? `${reactions.length} logged` : 'Unscored'}</span>
      </div>
      {reactions.length ? (
        <div className={styles.sensitivityList}>
          {reactions.map((product) => (
            <div key={product.id}><span>◇</span><div><strong>{shortName(product.name, 3)}</strong><span>{shortName(product.reaction || '', 7)}</span></div></div>
          ))}
        </div>
      ) : (
        <div className={styles.sensitivityList}>
          {['Fragrance', 'Essential oils', 'Alcohol'].map((label) => (
            <div key={label}><span>◇</span><div><strong>{label}</strong><span>No personal reaction logged</span></div></div>
          ))}
        </div>
      )}
      <Link href={hrefFor('Sensitivity')} className={styles.inlineArrow}>Open trigger log <span>→</span></Link>
    </section>
  );
}

function RotationSchedule({ dbProducts }: { dbProducts: BeautyProduct[] }) {
  const hasDayAssignments = DAYS.some((day) => Boolean(dayAssignment(dbProducts, day)));
  return (
    <section className={`${styles.glass} ${styles.rotationCard}`}>
      <div className={styles.rotationHead}>
        <div>
          <h3>Rotation Schedule</h3>
          <p>Every active keeps its own exact frequency. Provider rules first.</p>
        </div>
        <Link href={hrefFor('Active Rotation')} className={styles.textLink}>Open week</Link>
      </div>
      <div className={styles.weekGrid}>
        {DAYS.map((day) => {
          const product = dayAssignment(dbProducts, day);
          return (
            <div className={styles.dayCell} key={day}>
              <span>{day}</span>
              <strong>{product ? shortName(product.name, 2) : 'Not set'}</strong>
              <small>{product ? shortName(product.usageFrequency || product.routinePosition || 'Assigned', 3) : '—'}</small>
            </div>
          );
        })}
      </div>
      <div className={styles.nextTreatment}>
        <span>{hasDayAssignments ? 'Schedule uses your saved routine fields.' : 'No day-specific treatment schedule is saved yet.'}</span>
        <Link href={hrefFor('Active Rotation')}>Adapt schedule <span>⌘</span></Link>
      </div>
    </section>
  );
}

function ShaktiMonitor() {
  const unresolved = countStatus('needs-confirmation') + countStatus('needs-identification');
  const backups = countStatus('backup');
  return (
    <section className={`${styles.glass} ${styles.monitorPanel}`}>
      <span className={styles.auraMini} />
      <div>
        <strong>Shakti is monitoring</strong>
        <span>{unresolved} identities need review · {backups} backup/duplicate units preserved.</span>
      </div>
      <span className={styles.monitorCheck}>✓</span>
    </section>
  );
}

function LabHome({ dbProducts, name }: { dbProducts: BeautyProduct[]; name: string }) {
  return (
    <div className={styles.referenceShell}>
      <div className={styles.referenceFrame}>
        <header className={styles.labHeader}>
          <div className={styles.headerSpacer} />
          <div className={styles.titleLockup}>
            <h1>SKINCARE <span>·</span> TREATMENT LAB</h1>
            <p>Intelligent care. Safe. Compatible. Effective.</p>
          </div>
          <Link href="/ask-glow?context=skincare" className={styles.askGlow}>
            <Search size={13} />
            <span>Ask Glow…</span>
            <span className={styles.aura} />
          </Link>
        </header>

        <div className={styles.labBody}>
          <LocalRail name={name} />
          <main className={styles.dashboardMain}>
            <div className={styles.primaryGrid}>
              <SkinStatePanel />
              <RoutinePanel time="morning" products={dbProducts} />
              <RoutinePanel time="evening" products={dbProducts} />
            </div>

            <div className={styles.lowerGrid}>
              <ProductsCard dbProducts={dbProducts} />
              <PrescriptionsCard dbProducts={dbProducts} />
              <ConflictCard />
              <SensitivityCard dbProducts={dbProducts} />
            </div>

            <RotationSchedule dbProducts={dbProducts} />
          </main>

          <aside className={styles.rightRail} aria-label="Skincare context rail">
            <ProviderPanel />
            <ProgressPanel />
            <PatchPanel />
            <ShaktiMonitor />
          </aside>
        </div>
      </div>

      <div className={styles.bottomDock}>
        <Link href="/beauty" className={styles.dockSide}>← Beauty</Link>
        <Link href="/beauty/lab" className={styles.dockAdd} aria-label="Open Beauty Lab">＋</Link>
        <Link href={hrefFor('Product Library')} className={styles.dockSide}>Inventory →</Link>
      </div>
      <div className={styles.savedReceipt}><span>✓</span> All changes saved</div>

      <section className={styles.inventoryReceipt} aria-label="Master beauty inventory status">
        <div>
          <PackageCheck size={15} />
          <strong>Master Beauty + Skin + Body Inventory</strong>
          <span>{unitCount()} physical units/accessories represented across {MASTER_BEAUTY_INVENTORY.length} canonical records.</span>
        </div>
        <div className={styles.inventoryBadges}>
          <span>{countStatus('confirmed')} confirmed</span>
          <span>{countStatus('backup')} backup/duplicate units</span>
          <span>{countStatus('needs-confirmation') + countStatus('needs-identification')} identification items open</span>
          <span>{SKINCARE_PAGE_SPECS.length} skincare environments</span>
        </div>
      </section>
    </div>
  );
}

function RoomVisual({ group }: { group: string }) {
  if (group === 'Current Skin + Daily Decisions') {
    return <div className={`${styles.roomVisual} ${styles.faceMap}`}><div className={styles.faceOutline}><i/><i/><i/><i/></div></div>;
  }
  if (group === 'Morning System') {
    return <div className={`${styles.roomVisual} ${styles.risingPath}`}>{['Cleanse', 'Treat', 'Hydrate', 'Protect'].map((label) => <span key={label}>{label}</span>)}</div>;
  }
  if (group === 'Evening System') {
    return <div className={`${styles.roomVisual} ${styles.descendingPath}`}>{['Remove', 'Cleanse', 'Treat', 'Recover'].map((label) => <span key={label}>{label}</span>)}</div>;
  }
  if (group === 'Retinoid + Active System') {
    return <div className={`${styles.roomVisual} ${styles.activeOrbit}`}><span/><span/><span/><strong>ACTIVE</strong></div>;
  }
  if (group === 'Barrier + Sensitivity') {
    return <div className={`${styles.roomVisual} ${styles.barrierLayers}`}><span/><span/><span/><span/></div>;
  }
  if (group === 'Acne System') {
    return <div className={`${styles.roomVisual} ${styles.acneMap}`}><div><i/><i/><i/><i/><i/></div></div>;
  }
  if (group === 'Prescription + Provider Care') {
    return <div className={`${styles.roomVisual} ${styles.providerSlab}`}><span>Provider directions</span><span>Exact strength</span><span>Frequency</span><span>Follow-up</span></div>;
  }
  if (group === 'Product System') {
    return <div className={`${styles.roomVisual} ${styles.productShelf}`}>{[1,2,3,4,5].map((value) => <span key={value}/>)}</div>;
  }
  if (group === 'Product Testing') {
    return <div className={`${styles.roomVisual} ${styles.testTimeline}`}><span/><span/><span/><span/></div>;
  }
  if (group === 'Devices') {
    return <div className={`${styles.roomVisual} ${styles.devicePlinth}`}><span/><strong>DEVICE</strong></div>;
  }
  if (group === 'Procedures') {
    return <div className={`${styles.roomVisual} ${styles.procedureLine}`}><span/><span/><span/><span/></div>;
  }
  if (group === 'Progress') {
    return <div className={`${styles.roomVisual} ${styles.progressFrames}`}>{[1,2,3].map((value) => <span key={value}/>)}</div>;
  }
  if (group === 'Travel + Special Modes') {
    return <div className={`${styles.roomVisual} ${styles.travelTray}`}>{[1,2,3,4].map((value) => <span key={value}/>)}</div>;
  }
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
        <div className={styles.subTopTitle}>
          <span>{spec.group}</span>
          <strong>{spec.title}</strong>
        </div>
        <Link href="/ask-glow?context=skincare" className={styles.subAsk}><Search size={12}/> Ask Glow</Link>
      </div>

      <section className={`${styles.glass} ${styles.subRoom}`}>
        <div className={styles.subCopy}>
          <p className={styles.eyebrow}>PRIMARY HUMAN QUESTION</p>
          <h1>{spec.question}</h1>
          <p>{spec.description}</p>
          <div className={styles.fieldCloud}>
            {spec.fields.map((field) => <span key={field}>{field}</span>)}
          </div>
          <div className={styles.safetyReceipt}>
            <ShieldCheck size={13}/>
            <span>Exact product identity, provider directions, testing status, and personal response remain separate sources of truth.</span>
          </div>
        </div>

        <div className={styles.subObject}>
          <span className={styles.geometryLabel}>{spec.geometry}</span>
          <RoomVisual group={spec.group} />
          <div className={styles.relatedShelf}>
            {related.length ? related.slice(0, 5).map((record) => (
              <div key={record.name}>
                <ProductGlyph label={record.name}/>
                <strong>{shortName(record.name, 3)}</strong>
                <span>{INVENTORY_STATUS_LABEL[record.status]}</span>
              </div>
            )) : (
              <div className={styles.noForcedProduct}>
                <CircleHelp size={16}/>
                <span>No product is forced into this room until it is functionally relevant.</span>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className={styles.subReceipt}>
        <span>{String(index + 1).padStart(2, '0')} / {SKINCARE_PAGE_SPECS.length} · one master inventory, no duplicated product truth</span>
        <Link href={`/beauty/skincare?view=${next.slug}`}>{next.title} <ArrowRight size={12}/></Link>
      </div>

      <section className={styles.roomIndex}>
        <div className={styles.roomIndexHead}>
          <div>
            <span>LAB INDEX</span>
            <strong>All 48 skincare environments</strong>
          </div>
          <span>Different questions · different spatial logic</span>
        </div>
        <div className={styles.roomIndexGrid}>
          {GROUP_ORDER.map((group) => {
            const pages = SKINCARE_PAGE_SPECS.filter((page) => page.group === group);
            if (!pages.length) return null;
            return (
              <div className={styles.roomIndexGroup} key={group}>
                <strong>{group}</strong>
                {pages.map((page) => (
                  <Link className={page.slug === slug ? styles.roomIndexActive : ''} key={page.slug} href={`/beauty/skincare?view=${page.slug}`}>
                    {page.title}
                  </Link>
                ))}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default async function SkincareTreatmentLabPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const params = await searchParams;
  const requested = params.view ?? 'home';
  const view = requested === 'home' || SKINCARE_PAGE_SPECS.some((page) => page.slug === requested) ? requested : 'home';
  const dbProducts = await getBeautyProducts(session.user.id);
  const firstName = session.user.name?.trim().split(/\s+/)[0] || 'You';

  return (
    <AppShell>
      {view === 'home' ? <LabHome dbProducts={dbProducts} name={firstName} /> : <Subpage slug={view} />}
    </AppShell>
  );
}
