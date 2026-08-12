export const editorialRoutes = [
  '/dashboard',
  '/tasks',
  '/calendar',
  '/planning',
  '/routines',
  '/habits',
  '/fitness',
  '/hair',
  '/wellness',
  '/beauty',
  '/beauty-lab',
  '/finance',
] as const;

export function isEditorialRoute(pathname: string) {
  return editorialRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}
