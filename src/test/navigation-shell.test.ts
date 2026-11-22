import { describe, expect, it } from 'vitest';
import {
  depthLabelsForPath,
  enclosureForPath,
  railTargetIsActive,
  returnTargetForPath,
  roomLabelForPath,
} from '@/lib/glow-world/navigation-shell';
import { pageContractViolations, pageManifestChainFor, pageManifestFor, REQUIRED_SYNC_DIMENSIONS } from '@/lib/glow-world/page-manifest';

describe('Glow OS universal navigation shell', () => {
  it('keeps Today family depth and contextual return coherent', () => {
    expect(roomLabelForPath('/today?room=focus', 'today')).toBe('Focus Session');
    expect(depthLabelsForPath('/today?room=focus', 'today')).toEqual(['Today', 'Focus Session']);
    expect(returnTargetForPath('/today?room=focus', 'today')).toEqual({ label: 'Today', path: '/today?room=what-now' });
    expect(enclosureForPath('/today?room=focus')).toBe('protected');
  });

  it('uses manifest ancestry instead of URL guessing for deep experiences', () => {
    expect(returnTargetForPath('/closet', 'life')).toEqual({ label: 'Life', path: '/life' });
    expect(returnTargetForPath('/beauty/skincare', 'beauty')).toEqual({ label: 'Beauty', path: '/beauty' });
    expect(depthLabelsForPath('/beauty/gua-sha/morning', 'beauty')).toEqual(['Beauty', 'Gua Sha Studio', 'Morning Light Gua Sha']);
    expect(pageManifestChainFor('/beauty/gua-sha/morning').map((item) => item.id)).toEqual([
      'beauty.world', 'beauty.gua-sha', 'beauty.gua-sha.morning',
    ]);
  });

  it('surfaces world roots back toward the canonical Today current', () => {
    expect(returnTargetForPath('/planning', 'plan')).toEqual({ label: 'Today', path: '/today?room=what-now' });
    expect(returnTargetForPath('/life', 'life')).toEqual({ label: 'Today', path: '/today?room=what-now' });
    expect(returnTargetForPath('/brain', 'brain')).toEqual({ label: 'Today', path: '/today?room=what-now' });
    expect(returnTargetForPath('/create', 'create')).toEqual({ label: 'Today', path: '/today?room=what-now' });
  });

  it('derives enclosure from the page contract rather than page-random styling', () => {
    expect(enclosureForPath('/today?room=tonight')).toBe('open');
    expect(enclosureForPath('/today?room=what-now')).toBe('structured');
    expect(enclosureForPath('/today?room=replan')).toBe('protected');
    expect(enclosureForPath('/closet')).toBe('open');
    expect(enclosureForPath('/calendar')).toBe('structured');
    expect(enclosureForPath('/beauty/gua-sha/night')).toBe('protected');
  });

  it('requires the complete eight-dimension synchronization contract', () => {
    const guaSha = pageManifestFor('/beauty/gua-sha/morning');
    expect(guaSha).not.toBeNull();
    expect(guaSha?.sync).toEqual(REQUIRED_SYNC_DIMENSIONS);
    expect(pageContractViolations('/beauty/gua-sha/morning')).toEqual([]);
    expect(pageContractViolations('/definitely-unregistered')).toEqual(['UNREGISTERED_PAGE:/definitely-unregistered']);
  });

  it('matches rail destinations without treating query-state as a second navigation system', () => {
    expect(railTargetIsActive('/today?room=focus', '/today?room=focus')).toBe(true);
    expect(railTargetIsActive('/today?room=focus&focus=1', '/today?room=focus')).toBe(true);
    expect(railTargetIsActive('/today?room=later', '/today?room=focus')).toBe(false);
    expect(railTargetIsActive('/calendar', '/calendar')).toBe(true);
  });
});
