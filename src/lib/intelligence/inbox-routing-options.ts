export const INBOX_ROUTE_DESTINATIONS = ['task', 'calendar', 'goal', 'project', 'finance', 'note'] as const;

export type InboxRouteDestination = (typeof INBOX_ROUTE_DESTINATIONS)[number];

const ROUTE_LABELS: Record<InboxRouteDestination, string> = {
  task: 'Task',
  calendar: 'Calendar',
  goal: 'Goal',
  project: 'Project',
  finance: 'Finance',
  note: 'Note',
};

export function isInboxRouteDestination(value: unknown): value is InboxRouteDestination {
  return typeof value === 'string' && INBOX_ROUTE_DESTINATIONS.includes(value as InboxRouteDestination);
}

export function getSuggestedInboxDestination(suggestedType?: string | null): InboxRouteDestination {
  if (['task', 'shopping', 'reminder'].includes(suggestedType ?? '')) return 'task';
  if (['appointment', 'calendar', 'schedule'].includes(suggestedType ?? '')) return 'calendar';
  if (suggestedType === 'goal') return 'goal';
  if (['project', 'career'].includes(suggestedType ?? '')) return 'project';
  if (suggestedType === 'receipt' || suggestedType === 'finance') return 'finance';
  return 'note';
}

export function getInboxRoutingOptions(suggestedType?: string | null) {
  const suggested = getSuggestedInboxDestination(suggestedType);
  return [suggested, ...INBOX_ROUTE_DESTINATIONS.filter((destination) => destination !== suggested)].map((destination) => ({
    destination,
    label: ROUTE_LABELS[destination],
    recommended: destination === suggested,
  }));
}
