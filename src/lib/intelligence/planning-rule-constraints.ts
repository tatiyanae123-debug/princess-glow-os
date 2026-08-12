export type PlanningRuleLike = {
  enabled: boolean;
  ruleType: string;
  priority: number;
  title: string;
  condition?: unknown;
  effect?: unknown;
};

function description(value: unknown) {
  if (!value || typeof value !== 'object' || !('description' in value)) return '';
  const text = (value as { description?: unknown }).description;
  return typeof text === 'string' ? text : '';
}

function parseHour(text: string) {
  const match = text.match(/(?:after|past|later than)\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (!match) return null;
  let hour = Number(match[1]);
  const minute = Number(match[2] ?? 0);
  const meridiem = match[3]?.toLowerCase();
  if (!Number.isFinite(hour) || hour > 23 || minute > 59) return null;
  if (meridiem === 'pm' && hour < 12) hour += 12;
  if (meridiem === 'am' && hour === 12) hour = 0;
  return { hour, minute };
}

export function getPlanningRuleDayEnd(rules: PlanningRuleLike[], now: Date) {
  const cutoffs = rules
    .filter((rule) => rule.enabled && ['scheduling', 'time', 'general'].includes(rule.ruleType) && rule.priority >= 50)
    .map((rule) => `${rule.title} ${description(rule.condition)} ${description(rule.effect)}`)
    .filter((text) => /(?:never|do not|don't|avoid|no)\b/i.test(text))
    .map(parseHour)
    .filter((value): value is { hour: number; minute: number } => value !== null)
    .map(({ hour, minute }) => {
      const cutoff = new Date(now);
      cutoff.setHours(hour, minute, 0, 0);
      return cutoff;
    });

  if (!cutoffs.length) return null;
  return cutoffs.sort((a, b) => a.getTime() - b.getTime())[0];
}
