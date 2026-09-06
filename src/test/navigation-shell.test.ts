import { describe, expect, it } from 'vitest';
import {
  depthLabelsForPath,
  enclosureForPath,
  railTargetIsActive,
  returnTargetForPath,
  roomLabelForPath,
} from '@/lib/glow-world/navigation-shell';

describe('Glow OS universal navigation shell', () => {
  it('keeps Today depth and contextual return behavior coherent', () => {
    expect(roomLabelForPath('/today?room=focus', 'today')).toBe('Focus Session');
    expect(depthLabelsForPath('/today?room=focus', 'today')).toEqual(['Today', 'Focus Session']);
    expect(returnTargetForPath('/today?room=focus', 'today')).toEqual({ label: 'Today', path: '/today?room=what-now' });
    expect(enclosureForPath('/today?room=focus')).toBe('protected');
  });

  it('uses one parent-aware Return Anchor through Life depth', () => {
    expect(returnTargetForPath('/closet', 'life')).toEqual({ label: 'Life', path: '/world' });
    expect(returnTargetForPath('/beauty/skincare', 'life')).toEqual({ label: 'Beauty', path: '/beauty' });
    expect(depthLabelsForPath('/beauty/skincare', 'life')).toEqual(['Life', 'Beauty', 'Skincare']);
  });

  it('surfaces major world roots back toward Today', () => {
    expect(returnTargetForPath('/planning', 'plan')).toEqual({ label: 'Today', path: '/today' });
    expect(returnTargetForPath('/world', 'life')).toEqual({ label: 'Today', path: '/today' });
    expect(returnTargetForPath('/brain', 'brain')).toEqual({ label: 'Today', path: '/today' });
    expect(returnTargetForPath('/inbox', 'create')).toEqual({ label: 'Today', path: '/today' });
  });

  it('keeps enclosure states intentional rather than page-random', () => {
    expect(enclosureForPath('/today?room=tonight')).toBe('open');
    expect(enclosureForPath('/today?room=what-now')).toBe('structured');
    expect(enclosureForPath('/today?room=replan')).toBe('protected');
    expect(enclosureForPath('/today?room=day-view')).toBe('structured');
    expect(enclosureForPath('/closet')).toBe('structured');
    expect(enclosureForPath('/brain')).toBe('open');
  });

  it('matches rail destinations without treating query-state as a new navigation system', () => {
    expect(railTargetIsActive('/today?room=focus', '/today?room=focus')).toBe(true);
    expect(railTargetIsActive('/today?room=focus&focus=1', '/today?room=focus')).toBe(true);
    expect(railTargetIsActive('/today?room=later', '/today?room=focus')).toBe(false);
    expect(railTargetIsActive('/calendar', '/calendar')).toBe(true);
  });
});
