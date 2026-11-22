import { describe, expect, it } from 'vitest';
import { glowRoomManifestForRoute } from '@/lib/intelligence/room-manifest';

const routes = [
  '/today', '/planning', '/calendar', '/tasks', '/goals', '/projects', '/reminders', '/routines', '/habits', '/tomorrow', '/focus',
  '/world', '/life', '/beauty', '/hair', '/fitness', '/wellness', '/food', '/home', '/closet', '/finance', '/money', '/work', '/resources', '/maintenance', '/ritual',
  '/brain', '/notes', '/memory', '/timeline', '/graph', '/observations', '/briefings', '/rules', '/connections',
  '/ask-glow', '/create', '/inbox', '/intake', '/import', '/gmail', '/search',
  '/dashboard', '/concierge', '/notices',
] as const;

describe('Glow room intelligence contract', () => {
  it('gives every live top-level room a shared Life Model lens contract', () => {
    for (const route of routes) {
      const manifest = glowRoomManifestForRoute(route);
      expect(manifest.lens.length, route).toBeGreaterThan(8);
      expect(manifest.objectDomains.length, route).toBeGreaterThan(0);
      expect(manifest.specialists.length, route).toBeGreaterThan(0);
      expect(manifest.predictions.length, route).toBeGreaterThan(0);
      expect(manifest.simulations.length, route).toBeGreaterThan(0);
      expect(manifest.executions.length, route).toBeGreaterThan(0);
      expect(manifest.learnings.length, route).toBeGreaterThan(0);
      expect(manifest.history.length, route).toBeGreaterThan(0);
    }
  });

  it('keeps Plan as a future lens, Brain as history, and Create as transformation', () => {
    expect(glowRoomManifestForRoute('/calendar').world).toBe('Plan');
    expect(glowRoomManifestForRoute('/notes').world).toBe('Brain');
    expect(glowRoomManifestForRoute('/ask-glow').world).toBe('Create');
    expect(glowRoomManifestForRoute('/beauty').world).toBe('Life');
    expect(glowRoomManifestForRoute('/today').world).toBe('Today');
  });
});
