export type GmailCategory = 'appointments' | 'work' | 'school' | 'purchases' | 'travel' | 'bills' | 'packages' | 'personal' | 'other';

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

export function classifyGmailMetadata(input: { subject?: string | null; snippet?: string | null; from?: string | null }) {
  const combined = `${input.subject ?? ''} ${input.snippet ?? ''} ${input.from ?? ''}`;
  return rules.find(([, pattern]) => pattern.test(combined))?.[0] ?? 'other';
}

export function safeGmailSummary(input: { subject?: string | null; snippet?: string | null }) {
  const text = [input.subject?.trim(), input.snippet?.trim()].filter(Boolean).join(' — ').replace(/\s+/g, ' ');
  return text.slice(0, 240);
}
