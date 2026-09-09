import 'server-only';

import { getBeautyProducts, getHairLogs, getObservations, getTimelineEvents } from '@/lib/data/completion-v1';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import { getWellnessEntriesByUser } from '@/lib/data/wellness-entries';

const DAY = 86_400_000;
const HAIR_WORDS = /hair|scalp|shampoo|conditioner|leave[- ]?in|curl|edge|wig|extension|heat protect|mask|oil|serum|mousse|gel/i;
const WASH_WORDS = /wash|shampoo|clarif|cleanse/i;
const TREATMENT_WORDS = /deep condition|treat|mask|bond|protein|scalp|repair/i;

function daysBetween(a?: Date | null, b = new Date()) {
  if (!a) return null;
  return Math.max(0, Math.floor((b.getTime() - a.getTime()) / DAY));
}

function averageInterval(dates: Date[]) {
  if (dates.length < 2) return null;
  const intervals = dates.slice(0, 6).map((date, index) => {
    const next = dates[index + 1];
    return next ? Math.max(1, Math.round((date.getTime() - next.getTime()) / DAY)) : null;
  }).filter((value): value is number => value != null);
  return intervals.length ? Math.round(intervals.reduce((sum, value) => sum + value, 0) / intervals.length) : null;
}

function addDays(date: Date, days: number) {
  const value = new Date(date);
  value.setDate(value.getDate() + days);
  return value;
}

function shortDate(date?: Date | null) {
  return date ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null;
}

function longDate(date?: Date | null) {
  return date ? date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) : null;
}

function inferLoggedState(notes: string | null | undefined, kind: 'dryness'|'frizz'|'greasiness'|'buildup'|'scalp'|'ends'|'leaveout') {
  if (!notes?.trim()) return 'Not logged';
  const text = notes.toLowerCase();
  const rules: Record<typeof kind, RegExp[]> = {
    dryness: [/dryness\s*[:=-]?\s*(low|mild|medium|high)/i, /\b(dry|very dry|not dry)\b/i],
    frizz: [/frizz\s*[:=-]?\s*(low|mild|medium|high)/i, /\b(frizzy|not frizzy)\b/i],
    greasiness: [/greas(?:e|iness)\s*[:=-]?\s*(no|low|mild|medium|high)/i, /\b(greasy|oily|not greasy)\b/i],
    buildup: [/build\s*up\s*[:=-]?\s*(no|low|mild|medium|high)/i, /\b(buildup|build-up|no buildup)\b/i],
    scalp: [/scalp\s*[:=-]?\s*([^,.]+)/i],
    ends: [/ends?\s*[:=-]?\s*([^,.]+)/i],
    leaveout: [/leave[- ]?out\s*[:=-]?\s*([^,.]+)/i],
  };
  for (const pattern of rules[kind]) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1].replace(/^./, (letter) => letter.toUpperCase()).slice(0, 22);
    if (match?.[0]) return match[0].replace(/^./, (letter) => letter.toUpperCase()).slice(0, 22);
  }
  return 'Not logged';
}

export async function getHairStudioModel(userId: string, profile?: { name?: string | null; image?: string | null }) {
  const [logs, products, timeline, events, wellness, observations] = await Promise.all([
    getHairLogs(userId),
    getBeautyProducts(userId),
    getTimelineEvents(userId),
    getCalendarEventsByUser(userId),
    getWellnessEntriesByUser(userId),
    getObservations(userId),
  ]);

  const now = new Date();
  const last = logs[0] ?? null;
  const washLogs = logs.filter((log) => WASH_WORDS.test(log.eventType));
  const treatmentLogs = logs.filter((log) => TREATMENT_WORDS.test(log.eventType));
  const washInterval = averageInterval(washLogs.map((log) => log.occurredAt));
  const treatmentInterval = averageInterval(treatmentLogs.map((log) => log.occurredAt));
  const upcomingHairEvents = events
    .filter((event) => event.startAt.getTime() >= now.getTime())
    .filter((event) => HAIR_WORDS.test(`${event.title} ${event.description ?? ''}`))
    .sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
  const scheduledWash = upcomingHairEvents.find((event) => WASH_WORDS.test(`${event.title} ${event.description ?? ''}`)) ?? null;
  const nextWashEstimate = !scheduledWash && washInterval && washLogs[0] ? addDays(washLogs[0].occurredAt, washInterval) : null;
  const scheduledTreatment = upcomingHairEvents.find((event) => TREATMENT_WORDS.test(`${event.title} ${event.description ?? ''}`)) ?? null;
  const nextTreatmentEstimate = !scheduledTreatment && treatmentInterval && treatmentLogs[0] ? addDays(treatmentLogs[0].occurredAt, treatmentInterval) : null;

  const hairProducts = products.filter((product) => HAIR_WORDS.test(`${product.name} ${product.category} ${product.routinePosition ?? ''} ${product.usageFrequency ?? ''}`));
  const photos = timeline
    .filter((event) => Boolean(event.imageUrl) && (event.relatedEntityType === 'hair' || /hair|wig|curl|braid|blowout|wash|trim|scalp/i.test(`${event.category} ${event.title}`)))
    .map((event) => ({ id:event.id, url:event.imageUrl as string, title:event.title, date:event.occurredAt, summary:event.summary }))
    .slice(0, 12);

  const hairObservations = observations
    .filter((item) => item.status === 'active' && item.confidence >= 0.6)
    .filter((item) => /hair|scalp|wash|curl|frizz|moisture|breakage|ends/i.test(`${item.category} ${item.title} ${item.evidence}`))
    .slice(0, 3)
    .map((item) => ({ title:item.title.replace(/^\[[^\]]+\]\s*/, ''), evidence:item.evidence, confidence:item.confidence }));

  const condition = {
    dryness: inferLoggedState(last?.notes, 'dryness'),
    frizz: inferLoggedState(last?.notes, 'frizz'),
    greasiness: inferLoggedState(last?.notes, 'greasiness'),
    buildup: inferLoggedState(last?.notes, 'buildup'),
    scalp: inferLoggedState(last?.notes, 'scalp'),
    ends: inferLoggedState(last?.notes, 'ends'),
    leaveOut: inferLoggedState(last?.notes, 'leaveout'),
    styleIntact: last?.style?.trim() ? 'Logged' : 'Not logged',
  };

  const explicitNeed = last?.nextAction?.trim() || null;
  const currentStyle = last?.style?.trim() || null;
  const firstName = profile?.name?.trim().split(/\s+/)[0] || 'You';
  const energyRaw = wellness[0]?.energy ?? null;
  const energy = energyRaw === 'high' ? 'High' : energyRaw === 'medium' ? 'Steady' : energyRaw === 'low' ? 'Low' : energyRaw === 'exhausted' ? 'Exhausted' : 'Not logged';

  return {
    generatedAt: now,
    identity: { firstName, image: profile?.image ?? null, energy },
    current: {
      style: currentStyle,
      lastEvent: last?.eventType ?? null,
      lastEventDate: last?.occurredAt ?? null,
      lastNotes: last?.notes ?? null,
      nextAction: explicitNeed,
      products: last?.products ?? null,
      heatUsed: last?.heatUsed ?? null,
    },
    profile: {
      density: 'Not logged',
      porosity: 'Not logged',
    },
    condition,
    cadence: {
      daysSinceWash: daysBetween(washLogs[0]?.occurredAt, now),
      daysSinceTreatment: daysBetween(treatmentLogs[0]?.occurredAt, now),
      washInterval,
      treatmentInterval,
      nextWashDate: scheduledWash?.startAt ?? nextWashEstimate,
      nextWashKind: scheduledWash ? 'scheduled' : nextWashEstimate ? 'estimate' : 'unknown',
      nextTreatmentDate: scheduledTreatment?.startAt ?? nextTreatmentEstimate,
      nextTreatmentKind: scheduledTreatment ? 'scheduled' : nextTreatmentEstimate ? 'estimate' : 'unknown',
      nextHairEvent: upcomingHairEvents[0] ? { title:upcomingHairEvents[0].title, date:upcomingHairEvents[0].startAt } : null,
      nextWashLabel: scheduledWash ? longDate(scheduledWash.startAt) : nextWashEstimate ? `${longDate(nextWashEstimate)} · estimate` : 'Not enough history',
      nextTreatmentLabel: scheduledTreatment ? longDate(scheduledTreatment.startAt) : nextTreatmentEstimate ? `${longDate(nextTreatmentEstimate)} · estimate` : 'Not enough history',
    },
    products: hairProducts.slice(0, 12).map((product) => ({
      id:product.id,
      name:product.name,
      category:product.category,
      photoUrl:product.photoUrl,
      routinePosition:product.routinePosition,
      usageFrequency:product.usageFrequency,
    })),
    photos,
    observations: hairObservations,
    history: logs.slice(0, 8).map((log) => ({
      id:log.id,
      title:log.eventType,
      date:log.occurredAt,
      dateLabel:shortDate(log.occurredAt) ?? '',
      detail:log.style || log.nextAction || log.products || log.notes || 'Hair care logged',
      heatUsed:log.heatUsed,
    })),
    counts: {
      logs:logs.length,
      products:hairProducts.length,
      photos:photos.length,
      heat30:logs.filter((log) => log.heatUsed && now.getTime() - log.occurredAt.getTime() <= 30 * DAY).length,
    },
  };
}

export type HairStudioModel = Awaited<ReturnType<typeof getHairStudioModel>>;
