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
} from '@/lib/beauty/skincare-master';
import {
  ArrowLeft,
  ArrowRight,
  Beaker,
  Boxes,
  CircleHelp,
  FlaskConical,
  Moon,
  PackageCheck,
  Search,
  ShieldCheck,
  Sparkles,
  SunMedium,
} from 'lucide-react';
import styles from './skincare-treatment-lab.module.css';

export const dynamic = 'force-dynamic';

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

const groupLabel: Record<string,string> = {
  'Current Skin + Daily Decisions':'Today',
  'Morning System':'Morning',
  'Evening System':'Evening',
  'Retinoid + Active System':'Actives',
  'Barrier + Sensitivity':'Barrier',
  'Acne System':'Acne',
  'Prescription + Provider Care':'Provider',
  'Product System':'Inventory',
  'Product Testing':'Testing',
  'Devices':'Devices',
  'Procedures':'Procedures',
  'Progress':'Progress',
  'Travel + Special Modes':'Travel',
  'Body Skincare':'Body',
};

function countStatus(status:'confirmed'|'backup'|'needs-confirmation'|'needs-identification'){
  return MASTER_BEAUTY_INVENTORY.filter((record)=>record.status===status).reduce((sum,record)=>sum+(record.quantity ?? 1),0);
}

function categoryCount(match:string){
  return MASTER_BEAUTY_INVENTORY.filter((record)=>record.category.toLowerCase().includes(match.toLowerCase())).reduce((sum,record)=>sum+(record.quantity ?? 1),0);
}

function isAssignedTo(product:{routinePosition:string|null;usageFrequency:string|null}, time:'morning'|'evening'){
  const value = `${product.routinePosition ?? ''} ${product.usageFrequency ?? ''}`.toLowerCase();
  if(time==='morning') return /am|morning/.test(value);
  return /pm|evening|night/.test(value);
}

function MiniBottle({name,detail}:{name:string;detail:string}){
  return <div className={styles.productBottle}><b>{name}</b><span>{detail}</span></div>;
}

function Character(){
  return (
    <div className={styles.person} aria-label="Stylized illustration of a Black woman with warm brown skin and dark wavy hair">
      <div className={styles.hairBack}/><div className={styles.waveLeft}/><div className={styles.waveRight}/>
      <div className={`${styles.curl} ${styles.curl1}`}/><div className={`${styles.curl} ${styles.curl2}`}/><div className={`${styles.curl} ${styles.curl3}`}/><div className={`${styles.curl} ${styles.curl4}`}/>
      <div className={styles.shoulders}/><div className={styles.neck}/><div className={styles.face}/><div className={styles.nose}/><div className={styles.lips}/>
    </div>
  );
}

function Navigation({view}:{view:string}){
  return (
    <aside className={styles.nav} aria-label="Skincare Treatment Lab navigation">
      <div className={styles.navGroup}>
        <p className={styles.navGroupTitle}>Treatment Lab</p>
        <Link className={`${styles.navLink} ${view==='home'?styles.navActive:''}`} href="/beauty/skincare"><span>Home</span><span className={styles.navCount}>01</span></Link>
      </div>
      {GROUP_ORDER.map((group)=>{
        const pages=SKINCARE_PAGE_SPECS.filter((page)=>page.group===group);
        if(!pages.length) return null;
        return <div className={styles.navGroup} key={group}>
          <p className={styles.navGroupTitle}>{groupLabel[group] ?? group}</p>
          {pages.map((page)=><Link key={page.slug} className={`${styles.navLink} ${view===page.slug?styles.navActive:''}`} href={`/beauty/skincare?view=${page.slug}`}><span>{page.title}</span><span className={styles.navCount}>{String(SKINCARE_PAGE_SPECS.indexOf(page)+1).padStart(2,'0')}</span></Link>)}
        </div>;
      })}
    </aside>
  );
}

function LabHome({dbProducts}:{dbProducts:Awaited<ReturnType<typeof getBeautyProducts>>}){
  const morningProducts=dbProducts.filter((product)=>isAssignedTo(product,'morning')).slice(0,4);
  const eveningProducts=dbProducts.filter((product)=>isAssignedTo(product,'evening')).slice(0,4);
  const confirmed=countStatus('confirmed');
  const backups=countStatus('backup');
  const unresolved=countStatus('needs-confirmation')+countStatus('needs-identification');
  const dbNames=new Set(dbProducts.map((product)=>normalizeBeautyName(product.name)));
  const sourceMatches=MASTER_BEAUTY_INVENTORY.filter((record)=>dbNames.has(normalizeBeautyName(record.name))).length;
  const vitaminC=MASTER_BEAUTY_INVENTORY.filter((record)=>record.category.includes('Vitamin C')).length;
  const retinoids=MASTER_BEAUTY_INVENTORY.filter((record)=>record.category.includes('Retinoids')).length;
  const sunscreens=categoryCount('Sunscreen');
  const body=MASTER_BEAUTY_INVENTORY.filter((record)=>record.systems?.includes('body')).length;
  const sampleProducts=MASTER_BEAUTY_INVENTORY.filter((record)=>record.status==='confirmed').slice(0,5);

  return <>
    <div className={styles.heroGrid}>
      <section className={`${styles.glass} ${styles.skinState}`}>
        <p className={styles.panelKicker}>Your skin state</p><h1 className={styles.panelTitle}>Today, without invented scores</h1>
        <div className={styles.stateOrb}><div><strong>Check in</strong><span>20 seconds</span></div></div>
        <p className={styles.muted}>Glow only shows observations you actually logged. No fabricated “74,” attractiveness score, or fake treatment readiness.</p>
      </section>

      <div className={styles.stack}>
        <section className={`${styles.glass} ${styles.routinePanel}`}>
          <p className={styles.panelKicker}><SunMedium size={12}/> Morning routine</p><h2 className={styles.panelTitle}>Protect + prepare</h2>
          {morningProducts.length ? morningProducts.map((product)=><div className={styles.routineRow} key={product.id}><b>{product.name}</b><span>{product.routinePosition || product.usageFrequency || 'Assigned'}</span></div>) : <div className={styles.routineRow}><b>No active AM products assigned yet</b><span>Inventory ≠ routine</span></div>}
        </section>
        <section className={`${styles.glass} ${styles.routinePanel}`}>
          <p className={styles.panelKicker}><Moon size={12}/> Evening routine</p><h2 className={styles.panelTitle}>Treat only when appropriate</h2>
          {eveningProducts.length ? eveningProducts.map((product)=><div className={styles.routineRow} key={product.id}><b>{product.name}</b><span>{product.routinePosition || product.usageFrequency || 'Assigned'}</span></div>) : <div className={styles.routineRow}><b>No active PM products assigned yet</b><span>Nothing invented</span></div>}
        </section>
      </div>

      <section className={`${styles.glass} ${styles.inventorySummary}`}>
        <p className={styles.panelKicker}><PackageCheck size={12}/> Master Beauty Care Inventory</p><h2 className={styles.panelTitle}>Ownership is the source of truth</h2>
        <div className={styles.summaryGrid}>
          <div className={styles.metric}><strong>184+</strong><span>recoverable source records preserved</span></div>
          <div className={styles.metric}><strong>{MASTER_BEAUTY_INVENTORY.length}</strong><span>canonical identities in this build</span></div>
          <div className={styles.metric}><strong>{confirmed}</strong><span>confirmed/readable units</span></div>
          <div className={styles.metric}><strong>{unresolved}</strong><span>need confirmation/identification</span></div>
          <div className={styles.metric}><strong>{backups}</strong><span>duplicate/backstock units</span></div>
          <div className={styles.metric}><strong>{dbProducts.length}</strong><span>editable database records</span></div>
        </div>
        <p className={styles.muted} style={{marginTop:12}}>Repeated photos do not create new products. Exact strength, variant, and packaging stay unresolved until readable. {sourceMatches} canonical source identities currently match editable database names.</p>
      </section>
    </div>

    <div className={styles.personStage}>
      <section className={`${styles.glass} ${styles.personCard}`}>
        <div className={styles.personGlow}/><Character/>
        <div className={styles.personCaption}><div><span>Reference character</span><strong>Black woman · warm brown skin · dark wavy hair</strong></div><span>No stock white beauty model</span></div>
      </section>

      <section className={`${styles.glass} ${styles.decisionSurface}`}>
        <p className={styles.panelKicker}><Sparkles size={12}/> What should I use now?</p><h2 className={styles.panelTitle}>Inventory becomes a decision system</h2>
        <p className={styles.muted}>Products only move into the active path when the current routine, skin state, testing status, instructions, compatibility, and provider rules support them.</p>
        <div className={styles.decisionRail}>
          <div className={styles.decisionChip}><strong>{vitaminC}</strong>Vitamin C identities</div>
          <div className={styles.decisionChip}><strong>{retinoids}</strong>Retinoid/retinal identities</div>
          <div className={styles.decisionChip}><strong>{sunscreens}</strong>Face + body sunscreen units</div>
          <div className={styles.decisionChip}><strong>{body}</strong>Body-connected items</div>
        </div>
        <div className={styles.productRail}>
          {sampleProducts.map((record)=><MiniBottle key={record.name} name={record.name.split(' ').slice(0,3).join(' ')} detail={record.category}/>) }
        </div>
        <div className={styles.receipt}><span>Inventory = memory · Treatment Lab = decision system · Routines = execution</span><span>Glow checks before recommending</span></div>
      </section>
    </div>

    <section className={styles.section}>
      <div className={styles.sectionHead}><div><h2>Inventory intelligence</h2><p>Same object, many contexts, one underlying record.</p></div><Link className={styles.back} href="/beauty/lab">Open editable Beauty Lab</Link></div>
      <div className={styles.inventoryTrack}>
        {[
          ['Cleansers',categoryCount('Cleansers'),'Morning · evening · removal'],
          ['Vitamin C',vitaminC,'Overlap visible; one routine choice'],
          ['Retinoids',retinoids,'Never all scheduled at once'],
          ['SPF',sunscreens,'Context + makeup behavior'],
          ['Devices',categoryCount('Beauty Devices'),'Instructions remain device-specific'],
        ].map(([label,count,note])=><article className={`${styles.glass} ${styles.inventoryCard}`} key={String(label)}><strong>{label}</strong><span>{count} source units/identities</span><span>{note}</span><span className={`${styles.status} ${label==='Vitamin C'||label==='Retinoids'?styles.overlap:styles.confirmed}`}>{label==='Vitamin C'||label==='Retinoids'?'Functional overlap tracked':'Connected inventory'}</span></article>)}
      </div>
    </section>

    <section className={styles.section}>
      <div className={styles.sectionHead}><div><h2>48 inventory-driven skincare environments</h2><p>Each page has its own physical logic instead of cloning the Treatment Lab dashboard.</p></div><span className={styles.back}>{SKINCARE_PAGE_SPECS.length} subpages</span></div>
      <div className={styles.systemMap}>
        {GROUP_ORDER.map((group)=>{
          const pages=SKINCARE_PAGE_SPECS.filter((page)=>page.group===group);
          if(!pages.length)return null;
          return <article className={`${styles.glass} ${styles.systemCluster}`} key={group}><h3 className={styles.clusterTitle}>{group}</h3>{pages.map((page)=><Link key={page.slug} className={styles.pageLink} href={`/beauty/skincare?view=${page.slug}`}><span>{page.title}</span><span>→</span></Link>)}</article>;
        })}
      </div>
    </section>
  </>;
}

function Subpage({slug}:{slug:string}){
  const spec=SKINCARE_PAGE_SPECS.find((page)=>page.slug===slug);
  if(!spec)return <LabHome dbProducts={[]}/>;
  const related=MASTER_BEAUTY_INVENTORY.filter((record)=>record.systems?.includes(slug) || record.category.toLowerCase().includes(slug.split('-')[0])).slice(0,7);
  return <>
    <div className={styles.subHeader}><div><p className={styles.eyebrow}>{spec.group}</p><h1>{spec.title}</h1><p>{spec.description}</p></div><Link className={styles.back} href="/beauty/skincare"><ArrowLeft size={11}/> Treatment Lab home</Link></div>
    <section className={`${styles.glass} ${styles.subStage}`}>
      <div className={styles.subContent}>
        <div className={`${styles.glass} ${styles.questionPanel}`}>
          <p className={styles.panelKicker}>Primary human question</p><h2>{spec.question}</h2><p>This page uses the same master ownership records without copying them. Products, provider rules, testing status, and personal results remain separate sources of truth.</p>
          <div className={styles.fieldCloud}>{spec.fields.map((field)=><span className={styles.field} key={field}>{field}</span>)}</div>
          <div className={styles.receipt}><span><ShieldCheck size={10}/> No invented medical certainty</span><span>Exact variant rules preserved</span></div>
        </div>
        <div className={`${styles.glass} ${styles.geometryPanel}`}>
          <span className={styles.geometryName}>{spec.geometry}</span><h2 className={styles.geometryTitle}>{spec.title}</h2><p className={styles.geometryNote}>{spec.description}</p>
          <div className={styles.opticalObject}/>
          {related.length ? <div className={styles.productRail}>{related.slice(0,5).map((record)=><MiniBottle key={record.name} name={record.name.split(' ').slice(0,3).join(' ')} detail={INVENTORY_STATUS_LABEL[record.status]}/>)}</div> : <p className={styles.muted} style={{textAlign:'center',marginTop:14}}>No product is forced into this page. Relevant owned items appear only when functionally appropriate.</p>}
        </div>
      </div>
    </section>
    <div className={styles.receipt}><span>All changes remain connected to one master inventory record.</span><Link href={`/beauty/skincare?view=${SKINCARE_PAGE_SPECS[(SKINCARE_PAGE_SPECS.indexOf(spec)+1)%SKINCARE_PAGE_SPECS.length].slug}`}>Next environment <ArrowRight size={10}/></Link></div>
  </>;
}

export default async function SkincareTreatmentLabPage({searchParams}:{searchParams:Promise<{view?:string}>}){
  const session=await auth();
  if(!session?.user?.id)redirect('/sign-in');
  const params=await searchParams;
  const requested=params.view ?? 'home';
  const view=requested==='home'||SKINCARE_PAGE_SPECS.some((page)=>page.slug===requested)?requested:'home';
  const dbProducts=await getBeautyProducts(session.user.id);

  return <AppShell>
    <div className={styles.shell}>
      <div className={styles.frame}>
        <header className={styles.top}>
          <div><div className={styles.brand}>Glow OS</div><div className={styles.crumb}>Life · Beauty · Skincare</div></div>
          <div className={styles.titleWrap}><div className={styles.eyebrow}>Skincare</div><div className={styles.title}>Treatment Lab</div><div className={styles.subtitle}>Intelligent care. Safe. Compatible. Inventory-driven.</div></div>
          <Link href="/ask-glow?context=skincare" className={styles.ask}><Search size={13}/><span>Ask Glow…</span><div className={styles.aura}/></Link>
        </header>
        <div className={styles.layout}>
          <Navigation view={view}/>
          <main className={styles.main}>{view==='home'?<LabHome dbProducts={dbProducts}/>:<Subpage slug={view}/>}</main>
        </div>
        <footer className={styles.footer}><span>Beauty Inventory is ownership memory. Routines never equal ownership automatically.</span><span>Confirmed · Backups · Needs confirmation · Needs identification</span></footer>
      </div>
    </div>
  </AppShell>;
}
