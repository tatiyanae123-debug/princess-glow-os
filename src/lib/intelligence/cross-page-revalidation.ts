import type { InboxRouteDestination } from './inbox-routing-options';

const commonPaths = [
  '/inbox',
  '/today',
  '/dashboard',
  '/search',
  '/graph',
  '/brain',
  '/world',
  '/briefings',
  '/planning',
] as const;

const destinationPaths: Record<InboxRouteDestination, readonly string[]> = {
  task: ['/tasks', '/focus'],
  calendar: ['/calendar', '/tasks'],
  goal: ['/goals', '/projects'],
  project: ['/projects', '/goals'],
  finance: ['/finance', '/finance/brain'],
  note: ['/notes', '/memory'],
};

export function getInboxRoutingRevalidationPaths(destination: InboxRouteDestination) {
  return Array.from(new Set([...commonPaths, ...destinationPaths[destination]]));
}
