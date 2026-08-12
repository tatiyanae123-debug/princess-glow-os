export type GmailCategory = 'appointments' | 'work' | 'school' | 'purchases' | 'travel' | 'bills' | 'packages' | 'personal' | 'other';
export type GmailRoute = 'tasks' | 'calendar' | 'projects';
export type GmailPriority = 'high' | 'medium' | 'low';

const rules: [GmailCategory, RegExp][] = [
  ['packages', /(shipped|shipment|delivery|tracking|package)/i],
  ['travel', /(flight|hotel|boarding|itinerary|reservation)/i],
  ['appointments', /(appointment|doctor|dentist|visit|confirmation)/i],
  ['bills', /(payment due|invoice|statement|bill|past due)/i],
  ['purchases', /(order|receipt|purchase|refund)/i],
  ['school', /(class|assignment|professor|course|university|school)/i],
  ['work', /(interview|manager|shift|schedule|work|job|application)/i],
  ['personal', /(birthday|family|friend|personal)/i],
];

const urgentPattern = /(urgent|action required|past due|payment due|deadline|today|tomorrow|interview|appointment|reservation|confirmation needed|respond|reply requested)/i;
const lowSignalPattern = /(newsletter|digest|sale|offer|promotion|weekly update|receipt|shipped|delivery update)/i;

export function classifyGmailMetadata(input: { subject?: string | null; snippet?: string | null; from?: string | null }) {
  const combined = `${input.subject ?? ''} ${input.snippet ?? ''} ${input.from ?? ''}`;
  return rules.find(([, pattern]) => pattern.test(combined))?.[0] ?? 'other';
}

export function gmailActionInsight(input: { subject?: string | null; snippet?: string | null; from?: string | null; unread?: boolean }) {
  const category = classifyGmailMetadata(input);
  const combined = `${input.subject ?? ''} ${input.snippet ?? ''}`;
  const route: GmailRoute =
    category === 'appointments' || category === 'travel'
      ? 'calendar'
      : category === 'work' || category === 'school'
        ? 'projects'
        : 'tasks';

  const priority: GmailPriority = urgentPattern.test(combined)
    ? 'high'
    : lowSignalPattern.test(combined) && !input.unread
      ? 'low'
      : input.unread || category === 'bills'
        ? 'medium'
        : 'low';

  const rationale =
    route === 'calendar'
      ? 'This looks time-bound, so Calendar is the strongest next workspace.'
      : route === 'projects'
        ? 'This looks connected to ongoing work, school, or an application, so Projects is the strongest next workspace.'
        : 'This is best captured as an actionable task unless you choose another destination.';

  return { category, route, priority, rationale };
}

export function safeGmailSummary(input: { subject?: string | null; snippet?: string | null }) {
  const text = [input.subject?.trim(), input.snippet?.trim()].filter(Boolean).join(' — ').replace(/\s+/g, ' ');
  return text.slice(0, 240);
}
