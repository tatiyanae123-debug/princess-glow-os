import { describe, expect, it } from 'vitest';
import {
  WORLD_TARGETS,
  depthLabelsForPath,
  enclosureForPath,
  railTargetIsActive,
  returnTargetForPath,
  roomLabelForPath,
} from '@/lib/glow-world/navigation-shell';
import { pageContractViolations, pageManifestChainFor, pageManifestFor, REQUIRED_SYNC_DIMENSIONS } from '@/lib/glow-world/page-manifest';

describe('Glow OS universal navigation shell', () => {
  it('locks exactly five canonical Worlds', () => {
    expect(WORLD_TARGETS.map((item) => item.world)).toEqual(['today', 'plan', 'life', 'brain', 'create']);
    expect(WORLD_TARGETS.some((item) => item.world === 'beauty')).toBe(false);
  });

  it('keeps Today family depth and contextual return coherent', () => {
    expect(roomLabelForPath('/today?room=focus', 'today')).toBe('Focus Session');
    expect(depthLabelsForPath('/today?room=focus', 'today')).toEqual(['Today', 'Focus Session']);
    expect(returnTargetForPath('/today?room=focus', 'today')).toEqual({ label: 'Today', path: '/today?room=what-now' });
    expect(enclosureForPath('/today?room=focus')).toBe('protected');
  });

  it('nests Beauty inside Life throughout manifest ancestry', () => {
    const beauty = pageManifestFor('/beauty');
    expect(beauty?.world).toBe('life');
    expect(beauty?.level).toBe('room');
    expect(beauty?.parent).toBe('/life');
    expect(returnTargetForPath('/beauty/skincare', 'life')).toEqual({ label: 'Beauty', path: '/beauty' });
    expect(depthLabelsForPath('/beauty/gua-sha/morning', 'life')).toEqual(['Life', 'Beauty', 'Gua Sha Studio', 'Morning Light Gua Sha']);
    expect(pageManifestChainFor('/beauty/gua-sha/morning').map((item) => item.id)).toEqual([
      'life.world', 'life.beauty', 'beauty.gua-sha', 'beauty.gua-sha.morning',
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

  it('marks global utilities as global rather than as Worlds', () => {
    expect(pageManifestFor('/search')?.scope).toBe('global');
    expect(pageManifestFor('/ask-glow')?.scope).toBe('global');
    expect(pageManifestFor('/concierge')?.scope).toBe('global');
    expect(pageManifestFor('/settings')?.scope).toBe('global');
  });

  it('matches rail destinations without treating query-state as a second navigation system', () => {
    expect(railTargetIsActive('/today?room=focus', '/today?room=focus')).toBe(true);
    expect(railTargetIsActive('/today?room=focus&focus=1', '/today?room=focus')).toBe(true);
    expect(railTargetIsActive('/today?room=later', '/today?room=focus')).toBe(false);
    expect(railTargetIsActive('/calendar', '/calendar')).toBe(true);
  });
});
