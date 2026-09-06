import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getBeautyRoutinesByUser } from '@/lib/data/beauty-routines';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import { getBeautyProducts } from '@/lib/data/completion-v1';
import styles from './beauty-personal-atelier.module.css';

export const dynamic = 'force-dynamic';

type BeautyProduct = Awaited<ReturnType<typeof getBeautyProducts>>[number];
type BeautyRoutine = Awaited<ReturnType<typeof getBeautyRoutinesByUser>>[number];
type CalendarEvent = Awaited<ReturnType<typeof getCalendarEventsByUser>>[number];

const beautyKeywords = [
  'beauty','facial','skin','skincare','brow','brows','lash','lashes','nail','nails','manicure','pedicure','wax','laser','derm','dermatology','esthetic','spa','makeup','hair','scalp','fragrance','perfume','gua sha','massage','body care','sunscreen','spf',
];

const worlds = [
  ['Today','/today?room=what-now'],
  ['Plan','/planning'],
  ['Life','/life'],
  ['Beauty','/beauty'],
  ['Brain','/brain'],
  ['Create','/create'],
] as const;

const railWorlds = [
  ['Today','⌂','/today?room=what-now'],
  ['Plan','▣','/planning'],
  ['Life','♡','/life'],
  ['Beauty','✦','/beauty'],
  ['Brain','⌘','/brain'],
  ['Create','✧','/create'],
] as const;

function textOf(product: BeautyProduct) {
  return `${product.name} ${product.category} ${product.ingredients ?? ''} ${product.routinePosition ?? ''} ${product.usageFrequency ?? ''}`.toLowerCase();
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
  const text = `${event.title} ${event.description ?? ''}`.toLowerCase();
  return beautyKeywords.some((keyword) => text.includes(keyword));
}

function timeLabel(date: Date) {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function shortDate(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function greeting(now: Date) {
  const hour = now.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function categoryCount(products: BeautyProduct[], terms: string[]) {
  return products.filter((product) => matchesProduct(product, terms)).length;
}

export default async function BeautyPage({ searchParams }: { searchParams: Promise<{ studio?: string }> }) {
  const params = await searchParams;
  if (params.studio === 'skincare') redirect('/beauty/skincare');

  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const [routines, events, products] = await Promise.all([
    getBeautyRoutinesByUser(session.user.id),
    getCalendarEventsByUser(session.user.id),
    getBeautyProducts(session.user.id),
  ]);

  const now = new Date();
  const dayEnd = new Date(now); dayEnd.setHours(23, 59, 59, 999);
  const sevenDays = now.getTime() + 7 * 86400000;
  const fortyFiveDays = now.getTime() + 45 * 86400000;
  const firstName = session.user.name?.trim().split(/\s+/)[0] || 'You';

  const upcomingEvents = events.filter((event) => event.startAt.getTime() >= now.getTime()).sort((a,b) => a.startAt.getTime() - b.startAt.getTime());
  const beautyEvents = upcomingEvents.filter(isBeautyEvent);
  const beautyEventsThisWeek = beautyEvents.filter((event) => event.startAt.getTime() <= sevenDays);
  const nextGeneralEvent = upcomingEvents.find((event) => event.startAt.getTime() <= now.getTime() + 36 * 3600000 && !event.allDay) ?? null;

  const morningRoutines = routines.filter((routine) => routine.timeOfDay === 'morning');
  const eveningRoutines = routines.filter((routine) => routine.timeOfDay === 'evening' || routine.timeOfDay === 'night');
  const hairRoutines = routines.filter((routine) => matchesRoutine(routine, ['hair','scalp','wash','protect ends']));
  const bodyRoutines = routines.filter((routine) => matchesRoutine(routine, ['body','shower','bath','legs','foot','feet','deodorant']));
  const facialRoutines = routines.filter((routine) => matchesRoutine(routine, ['gua sha','facial massage','jaw','neck','lymph','face massage']));

  const skinProducts = products.filter((product) => matchesProduct(product, ['skin','skincare','cleanser','serum','retinol','retinal','tretinoin','tazarotene','spf','sunscreen','moisturizer','acne','toner','essence']));
  const hairProducts = products.filter((product) => matchesProduct(product, ['hair','scalp','shampoo','conditioner','wig','extension','edge control','leave-in']));
  const makeupProducts = products.filter((product) => matchesProduct(product, ['makeup','foundation','concealer','mascara','lip','blush','eyeshadow','brow','primer','powder']));
  const bodyProducts = products.filter((product) => matchesProduct(product, ['body','lotion','deodorant','shower','bath','hand','foot','feet','leg','scrub']));
  const fragranceProducts = products.filter((product) => matchesProduct(product, ['fragrance','perfume','scent','eau de']));
  const deviceProducts = products.filter((product) => matchesProduct(product, ['device','led','solawave','yeamon','roller','gua sha','nood','flawless','electrode','wand']));

  const responseProducts = products.filter((product) => Boolean(product.reaction?.trim()));
  const skinResponseProducts = skinProducts.filter((product) => Boolean(product.reaction?.trim()));
  const activeProducts = products.filter((product) => Boolean(product.routinePosition?.trim() || product.usageFrequency?.trim()));
  const expiringProducts = products.filter((product) => product.expiresAt && product.expiresAt.getTime() >= now.getTime() && product.expiresAt.getTime() <= fortyFiveDays).sort((a,b) => (a.expiresAt?.getTime() ?? 0) - (b.expiresAt?.getTime() ?? 0));
  const repurchaseProducts = products.filter((product) => product.repurchase === 'yes' || product.repurchase === 'maybe');
  const backupProducts = products.filter((product) => /\bbackup\b|back up/.test(textOf(product)));
  const testingProducts = products.filter((product) => /\btest\b|testing|patch test/.test(textOf(product)));
  const needsIdProducts = products.filter((product) => /needs identification|unidentified|unknown product/.test(textOf(product)));

  const retinoids = products.filter((product) => matchesProduct(product, ['retinol','retinal','tretinoin','tazarotene','adapalene']));
  const vitaminC = products.filter((product) => matchesProduct(product, ['vitamin c','ascorbic','ascorbyl']));
  const spfProducts = products.filter((product) => matchesProduct(product, ['spf','sunscreen','sun screen']));

  const beautyToday: Array<{ icon:string; title:string; detail:string }> = [];
  if (morningRoutines.length) beautyToday.push({ icon:'☀︎', title:`Morning · ${morningRoutines[0].name}`, detail:`${morningRoutines.length} morning step${morningRoutines.length === 1 ? '' : 's'} connected` });
  if (eveningRoutines.length) beautyToday.push({ icon:'☾', title:`Evening · ${eveningRoutines[0].name}`, detail:`${eveningRoutines.length} evening/night step${eveningRoutines.length === 1 ? '' : 's'} connected` });
  const todayBeautyEvent = beautyEvents.find((event) => event.startAt.getTime() <= dayEnd.getTime());
  if (todayBeautyEvent) beautyToday.push({ icon:'◌', title:todayBeautyEvent.title, detail:todayBeautyEvent.allDay ? 'Today · all day' : `Today · ${timeLabel(todayBeautyEvent.startAt)}` });
  if (hairRoutines.length && !beautyToday.some((item) => /hair/i.test(item.title))) beautyToday.push({ icon:'≋', title:`Hair · ${hairRoutines[0].name}`, detail:'Hair care is connected in Glow' });
  if (bodyRoutines.length && !beautyToday.some((item) => /body|shower/i.test(item.title))) beautyToday.push({ icon:'◇', title:`Body · ${bodyRoutines[0].name}`, detail:'Body care is connected in Glow' });

  const comingUp: Array<{ icon:string; title:string; detail:string }> = [];
  beautyEventsThisWeek.slice(0,3).forEach((event) => comingUp.push({ icon:'□', title:event.title, detail:event.allDay ? shortDate(event.startAt) : `${shortDate(event.startAt)} · ${timeLabel(event.startAt)}` }));
  expiringProducts.slice(0,3).forEach((product) => comingUp.push({ icon:'△', title:`Review ${product.name}`, detail:product.expiresAt ? `Expiration watch · ${shortDate(product.expiresAt)}` : 'Expiration watch' }));
  repurchaseProducts.slice(0,2).forEach((product) => { if (!comingUp.some((item) => item.title.includes(product.name))) comingUp.push({ icon:'◇', title:`Restock decision · ${product.name}`, detail:'Repurchase state is saved in Glow' }); });

  const observations: Array<{ icon:string; title:string; detail:string }> = [];
  if (retinoids.length) observations.push({ icon:'▥', title:`${retinoids.length} retinoid/retinal product${retinoids.length === 1 ? '' : 's'} connected`, detail:`${retinoids.filter((product) => activeProducts.includes(product)).length} linked to current use` });
  if (vitaminC.length) observations.push({ icon:'☀︎', title:`${vitaminC.length} Vitamin C option${vitaminC.length === 1 ? '' : 's'} in inventory`, detail:'Check what is already owned before buying' });
  if (spfProducts.length) observations.push({ icon:'✦', title:`${spfProducts.length} SPF product${spfProducts.length === 1 ? '' : 's'} connected`, detail:'Sun protection inventory is already in Glow' });
  if (!observations.length && products.length) observations.push({ icon:'✦', title:`${products.length} beauty product${products.length === 1 ? '' : 's'} connected`, detail:'Glow is using the inventory you actually own' });

  const maintenanceItems = [
    ...beautyEventsThisWeek.map((event) => event.title),
    ...expiringProducts.map((product) => `Review ${product.name}`),
    ...repurchaseProducts.map((product) => `Restock ${product.name}`),
  ].slice(0,5);

  const attentionCount = comingUp.length + responseProducts.length;
  const activePhotos = [...activeProducts, ...products].filter((product, index, array) => Boolean(product.photoUrl) && array.findIndex((item) => item.id === product.id) === index).slice(0,5);
  const getReadyTitle = nextGeneralEvent ? `Get ready · ${timeLabel(nextGeneralEvent.startAt)}` : 'Get ready';
  const getReadyDetail = nextGeneralEvent ? nextGeneralEvent.title : 'No timed event in the next 36 hours';

  const skinStatus = eveningRoutines.find((routine) => matchesRoutine(routine, ['skin','skincare','treatment']))?.name ?? `${skinProducts.length} skin product${skinProducts.length === 1 ? '' : 's'} connected`;
  const hairStatus = hairRoutines[0]?.name ?? (hairProducts.length ? `${hairProducts.length} hair item${hairProducts.length === 1 ? '' : 's'} connected` : 'No hair item scheduled');
  const makeupStatus = makeupProducts.length ? `${makeupProducts.length} makeup item${makeupProducts.length === 1 ? '' : 's'} connected` : 'No makeup item scheduled';
  const bodyStatus = bodyRoutines[0]?.name ?? (bodyProducts.length ? `${bodyProducts.length} body-care item${bodyProducts.length === 1 ? '' : 's'} connected` : 'No body-care item scheduled');
  const fragranceStatus = fragranceProducts.length ? `${fragranceProducts.length} scent${fragranceProducts.length === 1 ? '' : 's'} connected` : 'Build fragrance wardrobe';
  const facialStatus = facialRoutines[0]?.name ?? 'No facial-movement session scheduled';

  return (
    <main className={styles.viewport}>
      <section className={styles.atelier} aria-label="Beauty Personal Atelier">
        <header className={styles.topbar}>
          <Link href="/home" className={styles.brand}><strong>Glow OS⌄</strong><small>Beauty</small></Link>
          <nav className={styles.worldNav} aria-label="Glow regions">
            {worlds.map(([label, href]) => <Link key={label} href={href} className={label === 'Beauty' ? styles.active : undefined}>{label}</Link>)}
          </nav>
          <div className={styles.askWrap}><Link href="/ask-glow" className={styles.ask}><span className={styles.askIcon}>⌕</span><span>Ask Glow...</span></Link><Link href="/ask-glow" className={styles.glowOrb} aria-label="Open Ask Glow" /></div>
        </header>

        <div className={styles.title}><h1>Beauty · Personal Atelier</h1><p>Your beauty care, connected and in view.</p></div>
        <div className={styles.careLine}>Care today. A brighter you tomorrow.</div>

        <aside className={styles.leftRail}>
          <nav className={styles.railLinks} aria-label="Glow region shortcuts">
            {railWorlds.map(([label, icon, href]) => <Link key={label} href={href} className={label === 'Beauty' ? styles.railActive : undefined}><span className={styles.railIcon}>{label === 'Beauty' ? <span className={styles.navOrb}/> : icon}</span><span>{label}</span></Link>)}
          </nav>
          <div className={styles.identity}>
            {session.user.image ? <div className={styles.portrait} style={{ backgroundImage:`url(${session.user.image})`, backgroundSize:'cover', backgroundPosition:'center' }} /> : <div className={styles.portraitFallback}>{firstName.slice(0,1).toUpperCase()}</div>}
            <small>{greeting(now)},</small><strong>{firstName}</strong>
            <div className={styles.identityMeta}>Today<b>{beautyToday.length} beauty item{beautyToday.length === 1 ? '' : 's'}</b></div>
            <div className={styles.identityMeta}>Inventory<b>{products.length} owned record{products.length === 1 ? '' : 's'}</b></div>
          </div>
          <Link href="/ask-glow" className={styles.assistantState}><span className={styles.miniOrb}/><span><strong>Ask Glow</strong>Listening</span></Link>
        </aside>

        <section className={styles.field} aria-label="Beauty systems">
          <Link href="/beauty/skincare" className={`${styles.chamber} ${styles.skin}`}>
            <span className={`${styles.skinBead} ${styles.b1}`}/><span className={`${styles.skinBead} ${styles.b2}`}/><span className={`${styles.skinBead} ${styles.b3}`}/>
            <span className={styles.chamberCopy}><strong>Skin</strong><span>Tonight · {skinStatus}</span><em>{skinResponseProducts.length ? `${skinResponseProducts.length} response note${skinResponseProducts.length === 1 ? '' : 's'} logged` : 'No skin response note logged'} · {skinProducts.length} inventory</em></span><span className={styles.enter}>›</span>
          </Link>

          <Link href="/hair" className={`${styles.chamber} ${styles.hair}`}>
            <span className={styles.hairRibbon}/><span className={styles.chamberCopy}><strong>Hair</strong><span>{hairStatus}</span><em>{beautyEvents.find((event) => /hair|wash|brow/i.test(event.title)) ? `Next · ${shortDate(beautyEvents.find((event) => /hair|wash|brow/i.test(event.title))!.startAt)}` : `${hairProducts.length} inventory item${hairProducts.length === 1 ? '' : 's'}`}</em></span><span className={styles.enter}>›</span>
          </Link>

          <Link href="/beauty/lab" className={`${styles.chamber} ${styles.makeup}`}>
            <span className={`${styles.pigment} ${styles.p1}`}/><span className={`${styles.pigment} ${styles.p2}`}/><span className={`${styles.pigment} ${styles.p3}`}/><span className={`${styles.pigment} ${styles.p4}`}/>
            <span className={styles.chamberCopy}><strong>Makeup</strong><span>{makeupStatus}</span><em>{makeupProducts.some((product) => product.routinePosition) ? 'Routine placement is connected' : 'No makeup routine placement saved'}</em></span><span className={styles.enter}>›</span>
          </Link>

          <div className={styles.centerLens}><div className={styles.centerText}><small>YOU · BEAUTY STATE</small><span className={styles.lotus}>♢</span><strong>Beauty</strong><span>{attentionCount ? `${attentionCount} thing${attentionCount === 1 ? '' : 's'} in view` : 'Nothing urgent in Glow'}</span></div></div>

          <Link href="/beauty/skincare?view=body-skin" className={`${styles.chamber} ${styles.body}`}><span className={styles.bodyContour}/><span className={styles.chamberCopy}><strong>Body</strong><span>{bodyStatus}</span><em>{bodyProducts.length} body-care inventory item{bodyProducts.length === 1 ? '' : 's'}</em></span><span className={styles.enter}>›</span></Link>

          <Link href="/beauty/facial-massage" className={`${styles.chamber} ${styles.facial}`}><span className={styles.chamberCopy}><strong>Facial Movement</strong><span>{facialStatus}</span><em>{facialRoutines.length ? `${facialRoutines.length} connected routine${facialRoutines.length === 1 ? '' : 's'}` : 'Gua sha · massage · movement'}</em></span><span className={styles.enter}>›</span></Link>

          <Link href="/beauty/lab" className={`${styles.chamber} ${styles.fragrance}`}><span className={styles.bottleCap}/><span className={styles.chamberCopy}><strong>Fragrance</strong><span>{fragranceStatus}</span><em>Weather · occasion · outfit can shape selection</em></span><span className={styles.enter}>›</span></Link>

          <Link href="/beauty/lab?view=repurchase" className={styles.maintenance}>
            <span className={styles.maintTitle}><strong>Maintenance</strong><span>{maintenanceItems.length ? 'Keep real maintenance in rhythm' : 'Nothing due in Glow right now'}</span></span>
            <span className={styles.pearlRail}>{maintenanceItems.map((item) => <span className={styles.maintenanceItem} key={item}>{item.length > 18 ? `${item.slice(0,17)}…` : item}</span>)}</span>
          </Link>

          <Link href="/beauty/lab" className={styles.devices}><h3>Devices + Tools</h3><p>Track · clean · maintain · {deviceProducts.length} connected</p><span className={styles.deviceShapes}><span className={styles.d1}/><span className={styles.d2}/><span className={styles.d3}/></span><span className={styles.enter}>›</span></Link>

          <Link href="/beauty/lab" className={styles.inventory}><h3>Beauty Inventory</h3><p>{products.length} owned source record{products.length === 1 ? '' : 's'}</p><span className={styles.productShelf}>{activePhotos.length ? activePhotos.map((product) => <span key={product.id} style={{ width:26, height:42, backgroundImage:`url(${product.photoUrl})`, backgroundSize:'contain', backgroundRepeat:'no-repeat', backgroundPosition:'bottom center', display:'inline-block' }}/>) : [22,30,36,27,33].map((height,index) => <span key={index} className={styles.productPlaceholder} style={{ height }}/>)}</span><span className={styles.inventoryStats}><span>Owned<b>{products.length}</b></span><span>Active<b>{activeProducts.length}</b></span><span>Testing<b>{testingProducts.length || '—'}</b></span><span>Needs ID<b>{needsIdProducts.length || '—'}</b></span></span><span className={styles.enter}>›</span></Link>
        </section>

        <aside className={styles.rightRail}>
          <section className={styles.well}><div className={styles.wellHeader}><h2>Beauty Today</h2><span>•••</span></div>{beautyToday.length ? beautyToday.slice(0,4).map((item) => <div className={styles.intelRow} key={`${item.title}-${item.detail}`}><span className={styles.intelIcon}>{item.icon}</span><span className={styles.intelCopy}><strong>{item.title}</strong><small>{item.detail}</small></span><span className={styles.intelState}>○</span></div>) : <div className={styles.intelRow}><span className={styles.intelIcon}>✓</span><span className={styles.intelCopy}><strong>Nothing scheduled</strong><small>No beauty item is assigned for today in Glow.</small></span></div>}</section>

          <section className={`${styles.well} ${styles.coming}`}><div className={styles.wellHeader}><h2>Coming Up</h2><span>•••</span></div>{comingUp.length ? comingUp.slice(0,5).map((item) => <div className={styles.intelRow} key={`${item.title}-${item.detail}`}><span className={styles.intelIcon}>{item.icon}</span><span className={styles.intelCopy}><strong>{item.title}</strong><small>{item.detail}</small></span><span className={styles.intelState}>›</span></div>) : <div className={styles.intelRow}><span className={styles.intelIcon}>○</span><span className={styles.intelCopy}><strong>Nothing upcoming</strong><small>No beauty maintenance or appointment is currently due in Glow.</small></span></div>}</section>

          <section className={`${styles.well} ${styles.noticed}`}><div className={styles.wellHeader}><h2>Glow noticed</h2><span>•••</span></div>{observations.slice(0,3).map((item) => <div className={styles.intelRow} key={item.title}><span className={styles.intelIcon}>{item.icon}</span><span className={styles.intelCopy}><strong>{item.title}</strong><small>{item.detail}</small></span><span className={styles.intelState}>›</span></div>)}</section>

          <Link href="/closet" className={styles.closetBridge}><span className={styles.intelIcon}>⌑</span><span><strong>Closet Bridge</strong><small>Match beauty with your look</small></span><span className={styles.intelState}>›</span></Link>
        </aside>

        <div className={styles.bottomCurrent}>
          <Link href="/beauty" className={styles.currentSegment}><span className={styles.miniOrb}/><span><strong>Beauty Today · {beautyToday.length} item{beautyToday.length === 1 ? '' : 's'}</strong><small>{beautyToday.slice(0,3).map((item) => item.title.split(' · ')[0]).join(' · ') || 'Nothing scheduled'}</small></span><span className={styles.currentArrow}>›</span></Link>
          <Link href="/today?room=what-now" className={styles.currentSegment}><span className={styles.miniOrb}/><span><strong>{getReadyTitle}</strong><small>{getReadyDetail}</small></span><span className={styles.currentArrow}>›</span></Link>
          <Link href="/beauty/lab" className={styles.currentSegment}><span className={styles.miniOrb}/><span><strong>Check inventory before buying</strong><small>{backupProducts.length ? `${backupProducts.length} backup-tagged item${backupProducts.length === 1 ? '' : 's'}` : `${products.length} owned item${products.length === 1 ? '' : 's'} in Glow`}</small></span><span className={styles.currentArrow}>›</span></Link>
        </div>
      </section>
    </main>
  );
}
