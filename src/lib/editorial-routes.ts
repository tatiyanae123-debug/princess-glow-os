export const editorialRoutes = [
  '/dashboard',
  '/today',
  '/tasks',
  '/calendar',
  '/planning',
  '/tomorrow',
  '/routines',
  '/ritual',
  '/habits',
  '/fitness',
  '/wellness',
  '/maintenance',
  '/food',
  '/beauty',
  '/beauty-lab',
  '/hair',
  '/finance',
  '/goals',
  '/projects',
  '/brain',
  '/concierge',
  '/notes',
  '/settings',
  '/world',
  '/life-world',
  '/briefings',
  '/search',
] as const;

export function isEditorialRoute(pathname: string) {
  return editorialRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}
