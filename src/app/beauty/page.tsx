import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  Brain,
  CalendarDays,
  ChevronRight,
  Heart,
  Home,
  Palette,
  PenTool,
  Search,
  Sparkles,
} from 'lucide-react';
import { auth } from '@/auth';
import { getBeautyRoutinesByUser } from '@/lib/data/beauty-routines';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import { getBeautyProducts, getHairLogs, getObservations } from '@/lib/data/completion-v1';
import { getWellnessEntriesByUser } from '@/lib/data/wellness-entries';
import { WORLD_TARGETS } from '@/lib/glow-world/navigation-shell';
import { BeautyAtelierBehavior } from './beauty-atelier-behavior';
import styles from './beauty-personal-atelier.module.css';

export const dynamic = 'force-dynamic';

type BeautyProduct = Awaited<ReturnType<typeof getBeautyProducts>>[number];
type BeautyRoutine = Awaited<ReturnType<typeof getBeautyRoutinesByUser>>[number];
type CalendarEvent = Awaited<ReturnType<typeof getCalendarEventsByUser>>[number];

type IntelItem = { icon: 'sun' | 'moon' | 'calendar' | 'spark' | 'leaf' | 'wave' | 'box'; title: string; detail: string };

const beautyKeywords = [
  'beauty','facial','skin','skincare','brow','brows','lash','lashes','nail','nails','manicure','pedicure','wax','laser','derm','dermatology','esthetic','spa','makeup','hair','scalp','fragrance','perfume','gua sha','massage','body care','sunscreen','spf','shampoo','conditioner',
];

const railIcons = {
  Today: Home,
  Plan: CalendarDays,
  Life: Heart,
  Beauty: Sparkles,
  Brain,
  Create: PenTool,
} as const;

function textOf(product: BeautyProduct) {
  return `${product.name} ${product.category} ${product.ingredients ?? ''} ${product.routinePosition ?? ''} ${product.usageFrequency ?? ''} ${product.reaction ?? ''}`.toLowerCase();
}

function matchesProduct(product: BeautyProduct, terms: string[]) {
  const text = textOf(product);
  return terms.some((term) => text.includes(term));
}

function matchesRoutine(routine: BeautyRoutine, terms: string[]) {
  const text = `${routine.name} ${routine.notes ?? ''} ${(routine.products ?? []).join(' ')}`.toLowerCase();
  return terms.some((term) => text.includes(term));
}

function isBeautyEvent(event: CalendarEvent) {
  const text = `${event.title} ${event.description ?? ''} ${event.location ?? ''}`.toLowerCase();
  return beautyKeywords.some((keyword) => text.includes(keyword));
}

function isTravelEvent(event: CalendarEvent) {
  return /\b(travel|trip|flight|airport|hotel|vacation|depart|arrival|airbnb|train)\b/i.test(`${event.title} ${event.description ?? ''} ${event.location ?? ''}`);
}

function timeLabel(date: Date) {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function shortDate(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function energyLabel(value: string | null | undefined) {
  if (value === 'high') return 'High';
  if (value === 'medium') return 'Steady';
  if (value === 'low') return 'Low';
  if (value === 'exhausted') return 'Exhausted';
  return 'Not logged';
}

function cleanObservationTitle(value: string) {
  return value.replace(/^\[[^\]]+\]\s*/g, '').replace(/\s+/g, ' ').trim();
}

function iconClass(icon: IntelItem['icon']) {
  return `${styles.intelGlyph} ${styles[`intelGlyph_${icon}`]}`;
}

export default async function BeautyPage({ searchParams }: { searchParams: Promise<{ studio?: string }> }) {
  const params = await searchParams;
  if (params.studio === 'skincare') redirect('/beauty/skincare');

  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const [routines, events, products, wellness, hairLogs, observations] = await Promise.all([
    getBeautyRoutinesByUser(session.user.id),
    getCalendarEventsByUser(session.user.id),
    getBeautyProducts(session.user.id),
    getWellnessEntriesByUser(session.user.id),
    getHairLogs(session.user.id),
    getObservations(session.user.id),
  ]);

  const now = new Date();
  const next24 = now.getTime() + 24 * 60 * 60 * 1000;
  const sevenDays = now.getTime() + 7 * 86400000;
  const thirtyDays = now.getTime() + 30 * 86400000;
  const fortyFiveDays = now.getTime() + 45 * 86400000;
  const firstName = session.user.name?.trim().split(/\s+/)[0] || 'You';
  const energy = energyLabel(wellness[0]?.energy);

  const upcomingEvents = events
    .filter((event) => event.startAt.getTime() >= now.getTime())
    .sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
  const beautyEvents = upcomingEvents.filter(isBeautyEvent);
  const beautyEventsThisWeek = beautyEvents.filter((event) => event.startAt.getTime() <= sevenDays);
  const nextGeneralEvent = upcomingEvents.find((event) => event.startAt.getTime() <= now.getTime() + 36 * 3600000 && !event.allDay) ?? null;
  const travelEvent = upcomingEvents.find((event) => event.startAt.getTime() <= thirtyDays && isTravelEvent(event)) ?? null;

  const morningRoutines = routines.filter((routine) => routine.timeOfDay === 'morning');
  const eveningRoutines = routines.filter((routine) => routine.timeOfDay === 'evening' || routine.timeOfDay === 'night');
  const skinRoutines = routines.filter((routine) => matchesRoutine(routine, ['skin','skincare','acne','spf','sunscreen','treatment']));
  const hairRoutines = routines.filter((routine) => matchesRoutine(routine, ['hair','scalp','wash','protect ends','braid','wig','extension']));
  const bodyRoutines = routines.filter((routine) => matchesRoutine(routine, ['body','shower','bath','legs','foot','feet','deodorant','moisturize']));
  const facialRoutines = routines.filter((routine) => matchesRoutine(routine, ['gua sha','facial massage','jaw','neck','lymph','face massage']));
  const makeupRoutines = routines.filter((routine) => matchesRoutine(routine, ['makeup','complexion','foundation','concealer','mascara','lip','blush']));

  const skinProducts = products.filter((product) => matchesProduct(product, ['skin','skincare','cleanser','serum','retinol','retinal','tretinoin','tazarotene','spf','sunscreen','moisturizer','acne','toner','essence']));
  const hairProducts = products.filter((product) => matchesProduct(product, ['hair','scalp','shampoo','conditioner','wig','extension','edge control','leave-in']));
  const makeupProducts = products.filter((product) => matchesProduct(product, ['makeup','foundation','concealer','mascara','lip','blush','eyeshadow','brow','primer','powder']));
  const bodyProducts = products.filter((product) => matchesProduct(product, ['body','lotion','deodorant','shower','bath','hand','foot','feet','leg','scrub']));
  const fragranceProducts = products.filter((product) => matchesProduct(product, ['fragrance','perfume','scent','eau de']));
  const deviceProducts = products.filter((product) => matchesProduct(product, ['device','led','solawave','yeamon','roller','gua sha','nood','flawless','electrode','wand']));

  const activeProducts = products.filter((product) => Boolean(product.routinePosition?.trim() || product.usageFrequency?.trim()));
  const expiringProducts = products
    .filter((product) => product.expiresAt && product.expiresAt.getTime() >= now.getTime() && product.expiresAt.getTime() <= fortyFiveDays)
    .sort((a, b) => (a.expiresAt?.getTime() ?? 0) - (b.expiresAt?.getTime() ?? 0));
  const backupProducts = products.filter((product) => /\bbackup\b|back up/.test(textOf(product)));
  const testingProducts = products.filter((product) => /\btest\b|testing|patch test/.test(textOf(product)));
  const needsIdProducts = products.filter((product) => /needs identification|unidentified|unknown product/.test(textOf(product)));
  const retinoids = products.filter((product) => matchesProduct(product, ['retinol','retinal','tretinoin','tazarotene','adapalene']));
  const vitaminC = products.filter((product) => matchesProduct(product, ['vitamin c','ascorbic','ascorbyl']));
  const spfProducts = products.filter((product) => matchesProduct(product, ['spf','sunscreen','sun screen']));

  const beautyToday: IntelItem[] = [];
  if (morningRoutines[0]) beautyToday.push({ icon:'sun', title:`Morning · ${morningRoutines[0].name}`, detail:'Morning routine is connected' });
  if (eveningRoutines[0]) beautyToday.push({ icon:'moon', title:`Evening · ${eveningRoutines[0].name}`, detail:'Evening routine is connected' });
  const todayBeautyEvent = beautyEvents.find((event) => event.startAt.getTime() <= next24);
  if (todayBeautyEvent) beautyToday.push({ icon:'calendar', title:todayBeautyEvent.title, detail:todayBeautyEvent.allDay ? 'Within the next 24 hours' : `${shortDate(todayBeautyEvent.startAt)} · ${timeLabel(todayBeautyEvent.startAt)}` });

  const comingUp: IntelItem[] = [];
  beautyEventsThisWeek.slice(0, 4).forEach((event) => comingUp.push({ icon:'calendar', title:event.title, detail:event.allDay ? shortDate(event.startAt) : `${shortDate(event.startAt)} · ${timeLabel(event.startAt)}` }));
  expiringProducts.slice(0, 3).forEach((product) => comingUp.push({ icon:'box', title:`Use first · ${product.name}`, detail:product.expiresAt ? `Expiration watch · ${shortDate(product.expiresAt)}` : 'Expiration watch' }));

  const beautyObservations = observations
    .filter((item) => item.status === 'active' && item.confidence >= 0.6)
    .filter((item) => beautyKeywords.some((keyword) => `${item.category} ${item.title} ${item.evidence}`.toLowerCase().includes(keyword)))
    .slice(0, 3)
    .map<IntelItem>((item) => ({ icon:'spark', title:cleanObservationTitle(item.title), detail:item.evidence }));

  const derivedObservations: IntelItem[] = [];
  if (retinoids.length) derivedObservations.push({ icon:'box', title:`${retinoids.length} retinoid/retinal option${retinoids.length === 1 ? '' : 's'} owned`, detail:`${retinoids.filter((product) => activeProducts.includes(product)).length || 'No'} current-use link${retinoids.filter((product) => activeProducts.includes(product)).length === 1 ? '' : 's'} recorded` });
  if (vitaminC.length) derivedObservations.push({ icon:'sun', title:`${vitaminC.length} Vitamin C option${vitaminC.length === 1 ? '' : 's'} already owned`, detail:'Inventory exists; a shopping gap is not assumed' });
  if (spfProducts.length) derivedObservations.push({ icon:'spark', title:`${spfProducts.length} SPF option${spfProducts.length === 1 ? '' : 's'} already owned`, detail:'Under-makeup testing is only shown when it is actually logged' });
  const noticed = beautyObservations.length ? beautyObservations : derivedObservations.slice(0, 3);

  const maintenanceItems = [
    ...beautyEventsThisWeek.map((event) => ({ label:event.title, date:event.startAt })),
    ...expiringProducts.map((product) => ({ label:`Use first · ${product.name}`, date:product.expiresAt ?? new Date(fortyFiveDays) })),
  ].sort((a,b) => a.date.getTime() - b.date.getTime()).slice(0, 6);

  const urgentComing = comingUp.filter((item) => /today|tomorrow|use first/i.test(`${item.title} ${item.detail}`)).length;
  const attentionCount = Math.min(beautyToday.length + urgentComing, 9);
  const activePhotos = [...activeProducts, ...products]
    .filter((product, index, array) => Boolean(product.photoUrl) && array.findIndex((item) => item.id === product.id) === index)
    .slice(0, 5);

  const activeSpf = activeProducts.find((product) => matchesProduct(product, ['spf','sunscreen'])) ?? spfProducts.find((product) => Boolean(product.photoUrl));
  const activeBody = activeProducts.find((product) => matchesProduct(product, ['body','lotion','moisturizer'])) ?? bodyProducts.find((product) => Boolean(product.photoUrl));
  const activeFragrance = activeProducts.find((product) => fragranceProducts.includes(product)) ?? null;
  const lastHair = hairLogs[0] ?? null;
  const nextHairEvent = beautyEvents.find((event) => /hair|wash|braid|wig|brow/i.test(event.title));

  const eveningSkin = eveningRoutines.find((routine) => matchesRoutine(routine, ['skin','skincare','treatment'])) ?? skinRoutines[0] ?? null;
  const skinStatus = eveningSkin ? eveningSkin.name : 'Review routine';
  const skinResponse = skinProducts.some((product) => Boolean(product.reaction?.trim())) ? 'Response notes are logged' : 'Current response is not logged';
  const hairPrimary = lastHair?.nextAction?.trim() || hairRoutines[0]?.name || 'Nothing scheduled';
  const hairStyle = lastHair?.style?.trim() || 'Style not logged';
  const makeupPrimary = makeupRoutines[0]?.name || (nextGeneralEvent ? 'Event prep available' : 'No look planned');
  const bodyPrimary = bodyRoutines[0]?.name || 'Nothing scheduled';
  const fragrancePrimary = activeFragrance?.name || (fragranceProducts.length ? 'Not chosen' : 'Build fragrance wardrobe');
  const facialPrimary = facialRoutines[0]?.name || 'No session planned';

  const worldTargets = WORLD_TARGETS;
  const nextEventModel = nextGeneralEvent ? {
    title: nextGeneralEvent.title,
    iso: nextGeneralEvent.startAt.toISOString(),
    timeLabel: timeLabel(nextGeneralEvent.startAt),
    location: nextGeneralEvent.location,
  } : null;

  return (
    <main className={styles.viewport}>
      <section className={styles.atelier} aria-label="Beauty Personal Atelier" data-beauty-atelier data-beauty-mode="normal">
        <header className={styles.topbar}>
          <Link href="/home" className={styles.brand}><strong>Glow OS</strong><small>Beauty</small></Link>
          <nav className={styles.worldNav} aria-label="Glow regions">
            {worldTargets.map((target) => <Link key={target.world} href={target.path} className={target.world === 'beauty' ? styles.active : undefined}>{target.label}</Link>)}
          </nav>
          <div className={styles.askWrap}>
            <button type="button" className={styles.ask} data-open-glow><Search size={14}/><span>Ask Glow...</span></button>
            <button type="button" className={styles.glowOrb} data-open-glow aria-label="Open Ask Glow" />
          </div>
        </header>

        <div className={styles.title}><h1>Beauty · Personal Atelier</h1><p>Your beauty care, connected and in view.</p></div>
        <div className={styles.careLine}>Care today. A brighter you tomorrow.</div>

        <aside className={styles.leftRail}>
          <nav className={styles.railLinks} aria-label="Glow regions">
            {worldTargets.map((target) => {
              const Icon = railIcons[target.label as keyof typeof railIcons] ?? Sparkles;
              return <Link key={target.world} href={target.path} className={target.world === 'beauty' ? styles.railActive : undefined}><span className={styles.railIcon}>{target.world === 'beauty' ? <span className={styles.navOrb}/> : <Icon size={17} strokeWidth={1.45}/>}</span><span>{target.label}</span></Link>;
            })}
          </nav>
          <div className={styles.identity}>
            {session.user.image ? <div className={styles.portrait} style={{ backgroundImage:`url(${session.user.image})` }} /> : <div className={styles.portraitFallback}>{firstName.slice(0,1).toUpperCase()}</div>}
            <small data-local-greeting>Welcome,</small><strong>{firstName}</strong>
            <div className={styles.identityMeta}>Today<b>{beautyToday.length ? `${beautyToday.length} beauty item${beautyToday.length === 1 ? '' : 's'}` : 'Nothing assigned'}</b></div>
            <div className={styles.identityMeta}>Energy<b>{energy}</b></div>
          </div>
          <button type="button" className={styles.assistantState} data-open-glow><span className={styles.miniOrb}/><span><strong>Ask Glow</strong>Listening</span></button>
        </aside>

        <section className={styles.field} aria-label="Beauty systems">
          <Link href="/beauty/skincare" data-beauty-system="skin" className={`${styles.chamber} ${styles.skin}`}>
            <span className={styles.surfaceSheen}/><span className={styles.edgeRefraction}/>
            <span className={`${styles.skinBead} ${styles.b1}`}/><span className={`${styles.skinBead} ${styles.b2}`}/><span className={`${styles.skinBead} ${styles.b3}`}/><span className={`${styles.skinBead} ${styles.b4}`}/>
            {activeSpf?.photoUrl ? <span className={styles.roleProduct} style={{ backgroundImage:`url(${activeSpf.photoUrl})` }} aria-hidden="true"/> : null}
            <span className={styles.chamberCopy}><strong>Skin</strong><span>Tonight · {skinStatus}</span><em>{skinResponse}</em><em>{skinProducts.length ? 'Inventory is available deeper in Skin' : 'No Skin inventory found'}</em></span><span className={styles.enter}><ChevronRight size={15}/></span>
          </Link>

          <Link href="/hair" data-beauty-system="hair" className={`${styles.chamber} ${styles.hair}`}>
            <span className={styles.surfaceSheen}/><span className={styles.edgeRefraction}/>
            <span className={styles.hairMass}><i/><i/><i/><i/><i/><i/><i/></span>
            <span className={styles.chamberCopy}><strong>Hair</strong><span>{hairPrimary}</span><em>{nextHairEvent ? `Next · ${shortDate(nextHairEvent.startAt)}` : 'No dated hair event ahead'}</em><em>Current style · {hairStyle}</em></span><span className={styles.enter}><ChevronRight size={15}/></span>
          </Link>

          <Link href="/beauty/makeup" data-beauty-system="makeup" className={`${styles.chamber} ${styles.makeup}`}>
            <span className={styles.surfaceSheen}/><span className={`${styles.pigment} ${styles.p1}`}/><span className={`${styles.pigment} ${styles.p2}`}/><span className={`${styles.pigment} ${styles.p3}`}/><span className={`${styles.pigment} ${styles.p4}`}/><span className={`${styles.pigment} ${styles.p5}`}/>
            <span className={styles.chamberCopy}><strong>Makeup</strong><span>{makeupPrimary}</span><em>{nextGeneralEvent ? `Prep can link to Skin · ${nextGeneralEvent.title}` : 'Prep can link to Skin when an event is present'}</em></span><span className={styles.enter}><ChevronRight size={15}/></span>
          </Link>

          <div className={styles.centerLens}>
            <span className={styles.centerCaustic}/><span className={styles.centerShell}/>
            <div className={styles.centerText}><small>YOU · BEAUTY STATE</small><span className={styles.lotus} aria-hidden="true"><i/><i/><i/><i/><i/></span><strong>Beauty</strong><span>{attentionCount ? `${attentionCount} thing${attentionCount === 1 ? '' : 's'} need attention` : 'Nothing urgent'}</span></div>
          </div>

          <Link href="/beauty/body" data-beauty-system="body" className={`${styles.chamber} ${styles.body}`}>
            <span className={styles.surfaceSheen}/><span className={styles.bodyContour}/><span className={styles.bodyContourTwo}/>
            {activeBody?.photoUrl ? <span className={styles.roleProduct} style={{ backgroundImage:`url(${activeBody.photoUrl})` }} aria-hidden="true"/> : null}
            <span className={styles.chamberCopy}><strong>Body</strong><span>{bodyPrimary}</span><em>{bodyProducts.length ? 'Body-care inventory is available deeper in Body' : 'No body-care inventory found'}</em></span><span className={styles.enter}><ChevronRight size={15}/></span>
          </Link>

          <Link href="/beauty/facial-massage" data-beauty-system="facial-movement" className={`${styles.chamber} ${styles.facial}`}>
            <span className={styles.surfaceSheen}/><span className={styles.guaEdge}/><span className={styles.chamberCopy}><strong>Facial Movement</strong><span>{facialPrimary}</span><em>Gua sha · massage · jaw · neck</em></span><span className={styles.enter}><ChevronRight size={15}/></span>
          </Link>

          <Link href="/beauty/fragrance" data-beauty-system="fragrance" className={`${styles.chamber} ${styles.fragrance}`}>
            <span className={styles.fragranceVapor}/><span className={styles.bottleShoulder}/><span className={styles.bottleCap}/>
            {activeFragrance?.photoUrl ? <span className={styles.roleProduct} style={{ backgroundImage:`url(${activeFragrance.photoUrl})` }} aria-hidden="true"/> : null}
            <span className={styles.chamberCopy}><strong>Fragrance</strong><span>{fragrancePrimary}</span><em>Weather · occasion · outfit can shape selection</em></span><span className={styles.enter}><ChevronRight size={15}/></span>
          </Link>

          <Link href="/beauty/maintenance" data-beauty-system="maintenance" className={styles.maintenance}>
            <span className={styles.maintTitle}><strong>Maintenance</strong><span>{maintenanceItems.length ? 'Keep the essentials in rhythm' : 'Nothing dated is due right now'}</span></span>
            <span className={styles.maintenanceArc}/>
            <span className={styles.pearlRail}>{maintenanceItems.map((item, index) => <span className={styles.maintenanceItem} style={{ '--pearl-index':index } as React.CSSProperties} key={`${item.label}-${item.date.toISOString()}`}><i/><b>{item.label.length > 16 ? `${item.label.slice(0,15)}…` : item.label}</b></span>)}</span>
            <span className={styles.enter}><ChevronRight size={15}/></span>
          </Link>

          <Link href="/beauty/devices" data-beauty-system="devices" className={styles.devices}>
            <h3>Devices + Tools</h3><p>{deviceProducts.length ? `${deviceProducts.length} owned · track · clean · maintain` : 'No device inventory found'}</p>
            <span className={styles.deviceShapes}><span className={styles.deviceWand}/><span className={styles.deviceHead}/><span className={styles.deviceCap}/><span className={styles.deviceMetal}/></span><span className={styles.enter}><ChevronRight size={15}/></span>
          </Link>

          <Link href="/beauty/inventory" data-beauty-system="inventory" className={styles.inventory}>
            <h3>Beauty Inventory</h3><p>{products.length} owned record{products.length === 1 ? '' : 's'}</p>
            <span className={styles.productShelf}>{activePhotos.length ? activePhotos.map((product) => <span key={product.id} className={styles.productPhoto} style={{ backgroundImage:`url(${product.photoUrl})` }}/>) : <><span className={styles.bottleSilhouette}/><span className={styles.jarSilhouette}/><span className={styles.tubeSilhouette}/><span className={styles.pumpSilhouette}/></>}</span>
            <span className={styles.inventoryStats}><span>Owned<b>{products.length}</b></span><span>Backups<b>{backupProducts.length || '—'}</b></span><span>Testing<b>{testingProducts.length || '—'}</b></span><span>Needs ID<b>{needsIdProducts.length || '—'}</b></span></span><span className={styles.enter}><ChevronRight size={15}/></span>
          </Link>

          <Link href="/beauty/progress" data-beauty-system="progress" className={styles.progressPortal}><span><strong>Progress + History</strong><small>Photos · treatment timelines · skin + hair history</small></span><ChevronRight size={14}/></Link>
        </section>

        <aside className={styles.rightRail}>
          <section className={styles.well}><div className={styles.wellHeader}><h2>Beauty Today</h2><span>•••</span></div>{beautyToday.length ? beautyToday.slice(0,4).map((item) => <div className={styles.intelRow} key={`${item.title}-${item.detail}`}><span className={iconClass(item.icon)} aria-hidden="true"/><span className={styles.intelCopy}><strong>{item.title}</strong><small>{item.detail}</small></span><span className={styles.intelState}>○</span></div>) : <div className={styles.intelQuiet}><Sparkles size={15}/><span><strong>Beauty is quiet today.</strong><small>No dated Beauty item is asking for attention.</small></span></div>}</section>

          <section className={`${styles.well} ${styles.coming}`}><div className={styles.wellHeader}><h2>Coming Up</h2><span>•••</span></div>{comingUp.length ? comingUp.slice(0,5).map((item) => <div className={styles.intelRow} key={`${item.title}-${item.detail}`}><span className={iconClass(item.icon)} aria-hidden="true"/><span className={styles.intelCopy}><strong>{item.title}</strong><small>{item.detail}</small></span><span className={styles.intelState}><ChevronRight size={13}/></span></div>) : <div className={styles.intelQuiet}><CalendarDays size={15}/><span><strong>Nothing dated is coming up.</strong><small>Glow will surface Beauty maintenance when a real date exists.</small></span></div>}</section>

          <section className={`${styles.well} ${styles.noticed}`}><div className={styles.wellHeader}><h2>Glow noticed</h2><span>•••</span></div>{noticed.length ? noticed.map((item) => <div className={styles.intelRow} key={`${item.title}-${item.detail}`}><span className={iconClass(item.icon)} aria-hidden="true"/><span className={styles.intelCopy}><strong>{item.title}</strong><small>{item.detail}</small></span><span className={styles.intelState}><ChevronRight size={13}/></span></div>) : <div className={styles.intelQuiet}><Sparkles size={15}/><span><strong>Nothing meaningful to add.</strong><small>The intelligence well can stay quiet.</small></span></div>}</section>

          <Link href="/closet" className={styles.closetBridge}><span className={styles.bridgeIcon}><Palette size={15}/></span><span><strong>Closet Bridge</strong><small>Match beauty with your look</small></span><ChevronRight size={14}/></Link>
        </aside>

        <div className={styles.bottomCurrent}>
          <button type="button" className={styles.currentSegment} data-beauty-mode="normal"><span className={styles.currentBeautyObjects}/><span><strong>Beauty Today · {beautyToday.length} item{beautyToday.length === 1 ? '' : 's'}</strong><small>{beautyToday.slice(0,3).map((item) => item.title.split(' · ')[0]).join(' · ') || 'Nothing scheduled'}</small></span><ChevronRight size={15}/></button>
          <button type="button" className={styles.currentSegment} data-beauty-mode="get-ready"><span className={styles.currentClosetObjects}/><span><strong>{nextGeneralEvent ? `Get ready · ${timeLabel(nextGeneralEvent.startAt)}` : 'Get ready'}</strong><small>{nextGeneralEvent ? nextGeneralEvent.title : 'No timed event in the next 36 hours'}</small></span><ChevronRight size={15}/></button>
          <button type="button" className={styles.currentSegment} data-beauty-mode={travelEvent ? 'travel' : (energy === 'Low' || energy === 'Exhausted') ? 'essentials' : 'inventory'}><span className={styles.currentSpark}/><span><strong>{travelEvent ? 'Beauty travel kit' : (energy === 'Low' || energy === 'Exhausted') ? 'Essentials only' : 'Check inventory before buying'}</strong><small>{travelEvent ? shortDate(travelEvent.startAt) : (energy === 'Low' || energy === 'Exhausted') ? `Energy · ${energy}` : `${products.length} owned · ${backupProducts.length} backup-tagged`}</small></span><ChevronRight size={15}/></button>
        </div>

        <BeautyAtelierBehavior
          nextEvent={nextEventModel}
          energy={energy}
          travelContext={Boolean(travelEvent)}
          inventory={{ owned:products.length, backups:backupProducts.length, testing:testingProducts.length, needsId:needsIdProducts.length, useFirst:expiringProducts.length }}
        />
      </section>
    </main>
  );
}
