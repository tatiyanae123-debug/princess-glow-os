import { describe, expect, it } from 'vitest';
import {
  CREATE_DESTINATIONS,
  GLOBAL_NAVIGATION,
  GLOBAL_NAVIGATION_GROUPS,
  GLOBAL_UTILITIES,
  breadcrumbsForPath,
  localTabIsActive,
  localTabsForPath,
  navigationDestinationIsActive,
  visibleWorldForPath,
} from '@/lib/navigation-system';

describe('Glow OS unified visible navigation', () => {
  it('locks the user-facing global destinations and groups', () => {
    expect(GLOBAL_NAVIGATION.map((item) => item.key)).toEqual([
      'home', 'today', 'plan', 'life', 'beauty', 'closet', 'fitness', 'wellness', 'brain', 'create',
    ]);
    expect(GLOBAL_NAVIGATION_GROUPS.map((group) => group.label)).toEqual([
      'DAILY', 'LIFE', 'SELF', 'MIND + CREATE',
    ]);
  });

  it('treats self destinations as first-class visible navigation without changing their data ancestry', () => {
    expect(visibleWorldForPath('/beauty/skincare/routine')).toBe('beauty');
    expect(visibleWorldForPath('/hair')).toBe('beauty');
    expect(visibleWorldForPath('/closet/outfits')).toBe('closet');
    expect(visibleWorldForPath('/fitness/workouts')).toBe('fitness');
    expect(visibleWorldForPath('/wellness/sleep')).toBe('wellness');
    expect(navigationDestinationIsActive('/beauty/skincare', GLOBAL_NAVIGATION.find((item) => item.key === 'beauty')!)).toBe(true);
  });

  it('gives Skincare one predictable local navigation set', () => {
    expect(localTabsForPath('/beauty/skincare/products').map((tab) => tab.label)).toEqual([
      'Overview', 'Routine', 'Products', 'Treatments', 'Skin Log', 'Progress', 'Schedule', 'Goals', 'Recommendations',
    ]);
  });

  it('keeps query-driven Today tabs mutually exclusive', () => {
    expect(localTabIsActive('/today?room=tonight', '/today?room=tonight')).toBe(true);
    expect(localTabIsActive('/today?room=tonight', '/today?room=what-now')).toBe(false);
    expect(localTabIsActive('/today?room=day-view', '/today?room=day-view')).toBe(true);
  });

  it('starts Beauty breadcrumbs at Beauty instead of exposing internal Life ancestry', () => {
    const crumbs = breadcrumbsForPath('/beauty/gua-sha/morning');
    expect(crumbs[0]).toEqual({ label: 'Beauty', path: '/beauty' });
    expect(crumbs.at(-1)?.path).toBe('/beauty/gua-sha/morning');
  });

  it('keeps global utilities separate from Worlds', () => {
    expect(GLOBAL_UTILITIES.map((item) => item.key)).toEqual([
      'search', 'ask-glow', 'concierge', 'attention', 'settings',
    ]);
    expect(GLOBAL_NAVIGATION.some((item) => item.label === 'Settings')).toBe(false);
  });

  it('offers the one universal create system', () => {
    expect(CREATE_DESTINATIONS.map((item) => item.type)).toEqual([
      'task', 'event', 'routine', 'goal', 'project', 'note', 'idea', 'meal', 'workout', 'beauty-entry', 'shopping-item',
    ]);
  });
});
