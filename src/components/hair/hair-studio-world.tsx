import Link from 'next/link';
import {
  ArrowRight,
  CalendarDays,
  Camera,
  ChevronRight,
  CircleDot,
  Droplets,
  History,
  Home,
  Image as ImageIcon,
  Layers3,
  Leaf,
  PackageOpen,
  RefreshCcw,
  Scissors,
  Search,
  Sparkles,
  Waves,
  Wind,
} from 'lucide-react';
import type { HairStudioModel } from '@/lib/hair/hair-studio-data';
import styles from './hair-studio-world.module.css';

type Mode = 'studio' | 'today';

function fmt(date?: Date | null) {
  return date ? date.toLocaleDateString('en-US', { month:'short', day:'numeric' }) : '—';
}

function PhotoSurface({ url, label, className = '' }: { url?: string | null; label:string; className?:string }) {
  if (url) return <div className={`${styles.photoSurface} ${className}`} style={{ backgroundImage:`url(${url})` }} role="img" aria-label={label}/>;
  return <div className={`${styles.photoSurface} ${styles.photoEmpty} ${className}`} role="img" aria-label={`${label}. No Hair photo is connected yet.`}><span className={styles.abstractCurl}/><Camera size={20}/><small>Add Hair photo</small></div>;
}

function GlowOrb({ small = false }: { small?: boolean }) {
  return <span className={small ? styles.orbSmall : styles.orb} aria-hidden="true"><i/></span>;
}

function StatusDot({ value }: { value:string }) {
  const known = value !== 'Not logged' && value !== 'Not set' && value !== 'Unknown';
  return <span className={`${styles.statusDot} ${known ? styles.statusKnown : ''}`} aria-hidden="true"/>;
}

function HairRail({ model, mode }: { model:HairStudioModel; mode:Mode }) {
  return <aside className={styles.rail}>
    <Link href="/home" className={styles.brand}><strong>Glow OS</strong><small>Hair</small></Link>
    <nav className={styles.railNav} aria-label="Hair Studio navigation">
      <Link href="/home"><span><Home size={17}/></span>Home</Link>
      <Link href="/beauty"><span><Sparkles size={17}/></span>Beauty</Link>
      <Link href="/hair" className={mode === 'studio' ? styles.railActive : ''}><span><GlowOrb small/></span>Hair Studio</Link>
      <Link href="/hair/today" className={mode === 'today' ? styles.railActive : ''}><span><CircleDot size={17}/></span>Hair Today</Link>
      <Link href="/hair/manage"><span><Waves size={17}/></span>Log Care</Link>
      <Link href="/timeline"><span><History size={17}/></span>History</Link>
      <Link href="/calendar"><span><CalendarDays size={17}/></span>Calendar</Link>
      <Link href="/beauty/inventory"><span><PackageOpen size={17}/></span>Inventory</Link>
    </nav>
    <div className={styles.identity}>
      {model.identity.image ? <div className={styles.identityPhoto} style={{ backgroundImage:`url(${model.identity.image})` }}/> : <div className={styles.identityFallback}>{model.identity.firstName.slice(0,1).toUpperCase()}</div>}
      <small>Welcome,</small><strong>{model.identity.firstName}</strong>
      <div><span>Hair logs</span><b>{model.counts.logs}</b></div>
      <div><span>Energy</span><b>{model.identity.energy}</b></div>
    </div>
    <button type="button" className={styles.askMini} data-open-glow><GlowOrb small/><span><strong>Ask Glow</strong>Listening</span></button>
  </aside>;
}

function Header({ mode }: { mode:Mode }) {
  return <header className={styles.header}>
    <div className={styles.titleBlock}>
      {mode === 'today' ? <small>Hair Studio › Hair Today</small> : null}
      <h1>{mode === 'today' ? 'Hair Today · Live Hair State' : 'Hair Studio · Private Salon'}</h1>
      <p>{mode === 'today' ? 'See what is true today. Assessment first. Care only if needed.' : 'Your hair, your ritual. Designed with care.'}</p>
    </div>
    <div className={styles.askWrap}>
      <button type="button" data-open-glow className={styles.ask}><Search size={14}/><span>Ask Glow...</span></button>
      <button type="button" data-open-glow className={styles.askOrb} aria-label="Open Ask Glow"><GlowOrb small/></button>
    </div>
  </header>;
}

function ConditionRows({ model, compact = false }: { model:HairStudioModel; compact?:boolean }) {
  const rows = compact ? [
    ['Density', model.profile.density],
    ['Porosity', model.profile.porosity],
    ['Scalp', model.condition.scalp],
    ['Ends', model.condition.ends],
    ['Last wash', model.cadence.daysSinceWash == null ? 'Not logged' : `${model.cadence.daysSinceWash}d ago`],
  ] : [
    ['Dryness', model.condition.dryness],
    ['Frizz', model.condition.frizz],
    ['Greasiness', model.condition.greasiness],
    ['Buildup', model.condition.buildup],
    ['Style intact', model.condition.styleIntact],
    ['Leave-out blend', model.condition.leaveOut],
    ['Ends condition', model.condition.ends],
    ['Scalp comfort', model.condition.scalp],
  ];
  return <div className={styles.conditionRows}>{rows.map(([label,value]) => <div key={label}><span>{label}</span><b><StatusDot value={value}/>{value}</b></div>)}</div>;
}

function ProductShelf({ model, today = false }: { model:HairStudioModel; today?:boolean }) {
  const products = model.products.slice(0, today ? 5 : 6);
  return <section className={`${styles.panel} ${styles.productPanel}`}>
    <div className={styles.panelHead}><div><h2>Product Shelf{today ? ' · Today’s Picks' : ''}</h2><small>{model.counts.products ? `${model.counts.products} Hair product${model.counts.products === 1 ? '' : 's'} connected` : 'No Hair products are connected yet'}</small></div><Link href="/beauty/inventory">View all <ArrowRight size={12}/></Link></div>
    <div className={styles.productShelf}>
      {products.length ? products.map((product) => <div className={styles.product} key={product.id}>
        {product.photoUrl ? <span className={styles.productPhoto} style={{ backgroundImage:`url(${product.photoUrl})` }}/> : <span className={styles.productBottle}><i/></span>}
        <strong>{product.name}</strong><small>{product.routinePosition || product.category}</small>
      </div>) : Array.from({ length:6 }).map((_,index) => <div className={`${styles.product} ${styles.productPlaceholder}`} key={index}><span className={styles.productBottle}><i/></span><strong>Empty shelf</strong><small>Connect inventory</small></div>)}
    </div>
  </section>;
}

function HistoryPanel({ model, compact = false }: { model:HairStudioModel; compact?:boolean }) {
  const entries = model.history.slice(0, compact ? 3 : 5);
  return <section className={`${styles.panel} ${styles.historyPanel}`}>
    <div className={styles.panelHead}><h2>{compact ? 'Recent Hair History' : 'Hair History'}</h2><Link href="/timeline">View all <ArrowRight size={12}/></Link></div>
    <div className={styles.historyList}>{entries.length ? entries.map((entry) => <div key={entry.id}><i/><time>{entry.dateLabel}</time><span><strong>{entry.title}</strong><small>{entry.detail}</small></span></div>) : <div className={styles.emptyLine}>No Hair history has been logged yet.</div>}</div>
  </section>;
}

function InspirationPanel({ model, compact = false }: { model:HairStudioModel; compact?:boolean }) {
  const items = model.photos.slice(1, compact ? 5 : 4);
  return <section className={`${styles.panel} ${styles.inspirationPanel}`}>
    <div className={styles.panelHead}><h2>Inspiration <small>· Your Looks</small></h2><Link href="/timeline">See all <ArrowRight size={12}/></Link></div>
    <div className={styles.looks}>{items.length ? items.map((item) => <div key={item.id}><PhotoSurface url={item.url} label={item.title}/><strong>{item.title}</strong><small>{fmt(item.date)}</small></div>) : Array.from({ length:3 }).map((_,index) => <div key={index}><PhotoSurface label="Hair inspiration placeholder"/><strong>No saved look</strong><small>Add a Hair photo</small></div>)}</div>
  </section>;
}

function SectionMaps({ model }: { model:HairStudioModel }) {
  const first = model.photos[0]?.url;
  const second = model.photos[1]?.url;
  return <section className={`${styles.panel} ${styles.mapsPanel}`}>
    <div className={styles.panelHead}><h2>Section Maps</h2><Link href="/hair/manage">Update <ArrowRight size={12}/></Link></div>
    <div className={styles.mapBody}>
      <div className={styles.mapViews}>
        <div className={styles.mapView}><PhotoSurface url={first} label="Hair section map front or side view"/><span className={styles.mapArcA}/><span className={styles.mapArcB}/><span className={styles.mapArcC}/></div>
        <div className={styles.mapView}><PhotoSurface url={second} label="Hair section map back or crown view"/><span className={styles.mapArcA}/><span className={styles.mapArcB}/><span className={styles.mapArcD}/></div>
      </div>
      <div className={styles.legend}>{[['Top / Crown','mint'],['Front / Hairline','gold'],['Sides / Blend','violet'],['Back / Length','rose'],['Nape / Taper','peach']].map(([label,tone]) => <div key={label}><i data-tone={tone}/><span>{label}</span></div>)}</div>
    </div>
  </section>;
}

function RoutinePath({ today = false }: { today?:boolean }) {
  const steps = today ? ['Assess','Refresh','Define','Protect','Style'] : ['Cleanse','Treat','Condition','Protect','Style'];
  const notes = today ? ['Check needs','Mist if needed','Light product','Seal ends','Finish'] : ['Purify','Nourish','Hydrate','Shield','Finish'];
  return <section className={`${styles.panel} ${styles.routinePanel}`}>
    <div className={styles.panelHead}><h2>Routine Pathway</h2><Link href="/hair/manage">Manage <ChevronRight size={12}/></Link></div>
    <div className={styles.routineTabs}>{(today ? ['Today','Quick','Low Energy','Event','Travel'] : ['Today','Morning','Night','Wash Day','Repair','Event','Travel']).map((tab,index) => <span key={tab} className={index === 0 ? styles.tabActive : ''}>{tab}</span>)}</div>
    <div className={styles.routineSteps}>{steps.map((step,index) => <div key={step} className={index === 0 ? styles.stepActive : ''}><span className={styles.stepPearl}>{index + 1}</span><strong>{step}</strong><small>{notes[index]}</small>{index < steps.length - 1 ? <ChevronRight className={styles.stepArrow} size={12}/> : null}</div>)}</div>
  </section>;
}

function WashPanel({ model }: { model:HairStudioModel }) {
  return <section className={`${styles.panel} ${styles.washPanel}`}>
    <div className={styles.panelHead}><h2>Wash Schedule</h2></div>
    <div className={styles.week}>{['M','T','W','T','F','S','S'].map((day,index) => <span key={`${day}-${index}`} className={index === new Date().getDay() - 1 ? styles.weekActive : ''}>{day}</span>)}</div>
    <div className={styles.washLens}><GlowOrb small/><span><small>{model.cadence.nextWashKind === 'scheduled' ? 'Next wash day' : model.cadence.nextWashKind === 'estimate' ? 'Next wash estimate' : 'Wash rhythm'}</small><strong>{model.cadence.nextWashLabel}</strong></span></div>
    <div className={styles.washMeta}><div><small>Rhythm</small><strong>{model.cadence.washInterval ? `~${model.cadence.washInterval} days` : 'Learning'}</strong></div><div><small>Last wash</small><strong>{model.cadence.daysSinceWash == null ? 'Not logged' : `${model.cadence.daysSinceWash} days ago`}</strong></div><div><small>Focus</small><strong>Scalp + Ends</strong></div></div>
  </section>;
}

export function HairStudioWorld({ model }: { model:HairStudioModel }) {
  const mainPhoto = model.photos[0]?.url;
  return <main className={styles.viewport}><section className={styles.slab} data-hair-world>
    <HairRail model={model} mode="studio"/><Header mode="studio"/>
    <div className={styles.studioGrid}>
      <section className={`${styles.panel} ${styles.statePanel}`}>
        <div className={styles.panelHead}><div><h2>Today’s Hair State</h2><small>{model.current.style || 'Current style not logged'}</small></div><Link href="/hair/today"><Camera size={14}/></Link></div>
        <div className={styles.stateContent}><PhotoSurface url={mainPhoto} label="Current Hair state" className={styles.heroPhoto}/><div className={styles.profileFacts}><ConditionRows model={model} compact/><Link href="/hair/today" className={styles.softAction}>Open Hair Today <ChevronRight size={12}/></Link></div></div>
      </section>
      <section className={`${styles.panel} ${styles.stylePanel}`}>
        <div className={styles.panelHead}><h2>Style Plan</h2><GlowOrb small/></div>
        <div className={styles.styleHero}><span className={styles.curlLens}><i/></span><div><small>Current style</small><strong>{model.current.style || 'Not logged'}</strong><p>{model.current.nextAction || 'No next style action is recorded.'}</p></div></div>
        <div className={styles.tagRow}><span>Natural texture</span><span>Low tension</span><span>Protective care</span></div>
        <div className={styles.nextService}><span><small>Next Hair event</small><strong>{model.cadence.nextHairEvent ? `${fmt(model.cadence.nextHairEvent.date)} · ${model.cadence.nextHairEvent.title}` : 'Nothing scheduled'}</strong></span><ChevronRight size={14}/></div>
      </section>
      <WashPanel model={model}/>
      <RoutinePath/>
      <ProductShelf model={model}/>
      <HistoryPanel model={model}/>
      <InspirationPanel model={model}/>
      <SectionMaps model={model}/>
      <section className={`${styles.panel} ${styles.maintenancePanel}`}>
        <div className={styles.panelHead}><h2>Maintenance Schedule</h2><Link href="/calendar">View calendar <ArrowRight size={12}/></Link></div>
        <div className={styles.maintenanceTrack}>
          <div className={styles.maintenanceNow}><small>Now</small><strong>{model.current.nextAction || 'No urgent care'}</strong><span>{model.current.lastEvent ? `Last · ${model.current.lastEvent}` : 'Hair history is quiet'}</span></div>
          <div><small>Wash</small><strong>{model.cadence.nextWashLabel}</strong></div>
          <div><small>Treatment</small><strong>{model.cadence.nextTreatmentLabel}</strong></div>
          <div><small>Heat / 30d</small><strong>{model.counts.heat30}</strong></div>
          <Link href="/hair/manage" className={styles.trackArrow}><ChevronRight size={17}/></Link>
        </div>
      </section>
      <section className={`${styles.panel} ${styles.quickPanel}`}>
        <div className={styles.panelHead}><h2>Quick Care</h2><Link href="/hair/today">See today <ArrowRight size={12}/></Link></div>
        <div className={styles.quickRows}>{['Refresh ends','Scalp reset','Protect front pieces','Low-tension style','Travel kit'].map((item) => <Link href="/hair/manage" key={item}><span>{item}</span><b>+</b></Link>)}</div>
      </section>
      <div className={styles.editorialPearl}><GlowOrb/><p>Healthy hair.<br/>A calmer you.</p></div>
    </div>
  </section></main>;
}

export function HairTodayWorld({ model }: { model:HairStudioModel }) {
  const mainPhoto = model.photos[0]?.url;
  const need = model.current.nextAction || (model.observations[0]?.title ?? null);
  const conditionKnown = Object.values(model.condition).filter((value) => value !== 'Not logged').length;
  return <main className={styles.viewport}><section className={`${styles.slab} ${styles.todaySlab}`} data-hair-world>
    <HairRail model={model} mode="today"/><Header mode="today"/>
    <div className={styles.todayGrid}>
      <section className={`${styles.panel} ${styles.liveStatePanel}`}>
        <div className={styles.angleRail}>{['Front','Left','Back','Right','Top'].map((label,index) => <div key={label}><PhotoSurface url={model.photos[index]?.url || mainPhoto} label={`${label} Hair view`}/><span>{label}</span></div>)}</div>
        <PhotoSurface url={mainPhoto} label="Live Hair state" className={styles.liveHero}/>
        <div className={styles.liveStyle}><GlowOrb small/><span><small>Current Style</small><strong>{model.current.style || 'Not logged'}</strong></span><Link href="/hair/manage">Change</Link></div>
      </section>
      <section className={`${styles.panel} ${styles.todayCondition}`}><div className={styles.panelHead}><h2>Today’s Hair Condition</h2><span>{conditionKnown ? `${conditionKnown} signals logged` : 'Needs input'}</span></div><ConditionRows model={model}/></section>
      <section className={`${styles.panel} ${styles.needsPanel}`}><div className={styles.panelHead}><h2>What Your Hair Needs Today</h2><GlowOrb small/></div><div className={styles.needStatement}><strong>{need ? 'One thing is in view.' : 'Nothing urgent is confirmed.'}</strong><p>{need || 'Glow will stay quiet until a real Hair state, observation, or next action is logged.'}</p></div><div className={styles.needActions}>{[model.current.nextAction, model.observations[0]?.title, model.observations[1]?.title].filter(Boolean).slice(0,3).map((item) => <Link key={item as string} href="/hair/manage"><span>{item}</span><ChevronRight size={12}/></Link>)}</div></section>
      <section className={`${styles.panel} ${styles.detailsPanel}`}><div className={styles.panelHead}><h2>Hair Details</h2><Link href="/hair/manage">Edit</Link></div><div className={styles.detailsGrid}>
        <div><span>Days since wash</span><b>{model.cadence.daysSinceWash == null ? 'Not logged' : `${model.cadence.daysSinceWash} days`}</b></div>
        <div><span>Current products</span><b>{model.current.products || 'Not logged'}</b></div>
        <div><span>Last deep treatment</span><b>{model.cadence.daysSinceTreatment == null ? 'Not logged' : `${model.cadence.daysSinceTreatment} days ago`}</b></div>
        <div><span>Scalp status</span><b>{model.condition.scalp}</b></div>
        <div><span>Next wash</span><b>{model.cadence.nextWashLabel}</b></div>
        <div><span>Last heat use</span><b>{model.current.heatUsed == null ? 'Not logged' : model.current.heatUsed ? 'Latest log used heat' : 'Latest log · no heat'}</b></div>
      </div></section>
      <section className={`${styles.panel} ${styles.environmentPanel}`}><div className={styles.panelHead}><h2>Today’s Environment</h2><Wind size={15}/></div><div className={styles.environmentEmpty}><GlowOrb small/><div><strong>Environment not connected</strong><p>Humidity, UV, wind, and temperature will only appear when a real weather source is available.</p></div></div></section>
      <section className={`${styles.panel} ${styles.glowNotes}`}><div className={styles.panelHead}><h2>Notes from Glow</h2><Sparkles size={14}/></div>{model.observations.length ? model.observations.slice(0,2).map((item) => <div key={item.title}><strong>{item.title}</strong><p>{item.evidence}</p></div>) : <div><strong>No new Hair observation.</strong><p>Glow can stay quiet when there is not enough evidence to add something useful.</p></div>}</section>
      <section className={`${styles.panel} ${styles.careModes}`}><div className={styles.panelHead}><h2>Choose Your Routine for Today</h2></div><div className={styles.careCards}>{[
        ['Quick Care','5–10 min','Minimal refresh'],['Normal Care','15–30 min','Standard care'],['Low Energy','5–15 min','Essentials only'],['Event Ready','30–60 min','Polished preparation'],
      ].map(([title,duration,note],index) => <Link href="/hair/manage" className={index === 2 && ['Low','Exhausted'].includes(model.identity.energy) ? styles.careRecommended : ''} key={title}><span className={styles.careIcon}>{index === 0 ? <RefreshCcw size={18}/> : index === 1 ? <Leaf size={18}/> : index === 2 ? <Waves size={18}/> : <Sparkles size={18}/>}</span><strong>{title}</strong><small>{duration}</small><p>{note}</p><b>Start Routine <ArrowRight size={11}/></b></Link>)}</div></section>
      <ProductShelf model={model} today/>
      <HistoryPanel model={model} compact/>
      <InspirationPanel model={model} compact/>
      <section className={`${styles.panel} ${styles.quickActionsPanel}`}><div className={styles.panelHead}><h2>Quick Actions</h2></div><div className={styles.quickActions}>{[
        ['Log Hair Care',Waves,'/hair/manage'],['Add Photo',Camera,'/timeline'],['Update Products',PackageOpen,'/beauty/inventory'],['View Calendar',CalendarDays,'/calendar'],
      ].map(([label,Icon,href]) => <Link href={href as string} key={label as string}><span><Icon size={17}/></span><b>{label as string}</b></Link>)}</div></section>
      <div className={styles.todayPearl}><GlowOrb/><p>Healthy hair creates a softer, brighter you.</p></div>
    </div>
  </section></main>;
}
