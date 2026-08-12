export type NavigationGroup = { label: string; paths: readonly string[] };

export const navigationGroups: readonly NavigationGroup[] = [
  { label: 'PLAN', paths: ['/tasks', '/calendar', '/planning', '/routines', '/habits', '/reminders', '/today', '/tomorrow'] },
  { label: 'HEALTH & CARE', paths: ['/fitness', '/wellness', '/food', '/beauty', '/beauty/lab', '/hair', '/maintenance'] },
  { label: 'MONEY & GROWTH', paths: ['/finance', '/finance/brain', '/goals'] },
  { label: 'GLOW', paths: ['/brain', '/concierge', '/briefings', '/observations', '/inbox', '/memory', '/timeline', '/intake', '/rules'] },
  { label: 'LIBRARY & SYSTEM', paths: ['/notes', '/closet', '/gmail', '/resources', '/connections', '/import', '/settings', '/home'] },
] as const;

export function navigationPathIsActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function groupContainsPath(group: NavigationGroup, pathname: string) {
  return group.paths.some(path => navigationPathIsActive(pathname, path));
}

export function expandedNavigationGroups(pathname: string) {
  return Object.fromEntries(navigationGroups.map(group => [group.label, groupContainsPath(group, pathname)])) as Record<string, boolean>;
}
