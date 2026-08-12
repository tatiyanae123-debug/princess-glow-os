import { describe, expect, it } from 'vitest';
import { getInboxRoutingRevalidationPaths } from './cross-page-revalidation';

describe('Glow Inbox cross-page revalidation', () => {
  it('refreshes shared intelligence surfaces after every reviewed route', () => {
    const paths = getInboxRoutingRevalidationPaths('task');
    for (const path of ['/inbox', '/today', '/dashboard', '/search', '/graph', '/brain', '/world', '/briefings', '/planning']) {
      expect(paths).toContain(path);
    }
  });

  it('refreshes the destination workspace and connected companion views', () => {
    expect(getInboxRoutingRevalidationPaths('calendar')).toEqual(expect.arrayContaining(['/calendar', '/tasks']));
    expect(getInboxRoutingRevalidationPaths('goal')).toEqual(expect.arrayContaining(['/goals', '/projects']));
    expect(getInboxRoutingRevalidationPaths('finance')).toEqual(expect.arrayContaining(['/finance', '/finance/brain']));
    expect(getInboxRoutingRevalidationPaths('note')).toEqual(expect.arrayContaining(['/notes', '/memory']));
  });

  it('never emits duplicate paths', () => {
    const paths = getInboxRoutingRevalidationPaths('project');
    expect(new Set(paths).size).toBe(paths.length);
  });
});
