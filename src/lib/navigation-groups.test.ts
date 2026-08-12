import { describe, expect, it } from 'vitest';
import { expandedNavigationGroups, groupContainsPath, navigationGroups, navigationPathIsActive } from './navigation-groups';

describe('Glow OS grouped navigation', () => {
  it('treats nested routes as active without matching unrelated prefixes', () => {
    expect(navigationPathIsActive('/beauty/lab', '/beauty')).toBe(true);
    expect(navigationPathIsActive('/finance/brain', '/finance')).toBe(true);
    expect(navigationPathIsActive('/tasks-old', '/tasks')).toBe(false);
  });

  it('opens the group that contains the current route', () => {
    const health = navigationGroups.find(group => group.label === 'HEALTH & CARE');
    const glow = navigationGroups.find(group => group.label === 'GLOW');
    expect(health && groupContainsPath(health, '/beauty/lab')).toBe(true);
    expect(glow && groupContainsPath(glow, '/beauty/lab')).toBe(false);
  });

  it('builds an expanded-state map with the current group open', () => {
    const expanded = expandedNavigationGroups('/finance/brain');
    expect(expanded['MONEY & GROWTH']).toBe(true);
    expect(expanded['PLAN']).toBe(false);
    expect(expanded['GLOW']).toBe(false);
  });
});
