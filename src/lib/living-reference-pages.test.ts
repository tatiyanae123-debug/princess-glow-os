import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const routes = [
  'what-now',
  'planning-studio',
  'day-flow',
  'today-systems',
  'important-inbox',
  'people-to-contact',
  'brain-web',
  'moving-forward',
  'life-pulse',
  'catch-up',
  'personal-house',
  'midday-reset',
  'vision-you',
] as const;

const referenceComponent = path.join(ROOT, 'src/components/living/reference-living-workspace.tsx');
const homeComponent = path.join(ROOT, 'src/components/home/glow-threshold-reference.tsx');
const pageManifest = path.join(ROOT, 'src/lib/glow-world/page-manifest.ts');

describe('13 reference living workspaces', () => {
  it('ships every requested destination as a real route', () => {
    for (const route of routes) {
      const file = path.join(ROOT, 'src/app/living', route, 'page.tsx');
      expect(fs.existsSync(file), route).toBe(true);
      const source = fs.readFileSync(file, 'utf8');
      expect(source).toContain(`workspace="${route}"`);
      expect(source).toContain("dynamic = 'force-dynamic'");
    }
  });

  it('registers every destination in the canonical Glow page graph', () => {
    const manifest = fs.readFileSync(pageManifest, 'utf8');
    for (const route of routes) {
      expect(manifest).toContain(`/living/${route}`);
    }
  });

  it('wires Home to all 13 new destinations', () => {
    const source = fs.readFileSync(homeComponent, 'utf8');
    for (const route of routes) {
      expect(source).toContain(`/living/${route}`);
    }
  });

  it('keeps known reference-board demo content out of production workspace source', () => {
    const source = fs.readFileSync(referenceComponent, 'utf8');
    const banned = [
      'Lisa · Bluemercury',
      'Jordan',
      'Morgan',
      'Alex',
      'Macy',
      'Dr. Pearson',
      'Best Buy',
      'Tue, Apr 22, 2025',
      'Interview Prep',
      'Creative Push',
      '82 / 100',
    ];
    for (const value of banned) expect(source).not.toContain(value);
  });

  it('uses live data bridges instead of demo arrays for connected inbox/reminders/contacts', () => {
    const source = fs.readFileSync(referenceComponent, 'utf8');
    expect(source).toContain("fetch('/api/contacts'");
    expect(source).toContain("fetch('/api/living/reminders'");
    expect(source).toContain("fetch('/api/living/inbox'");
    expect(source).toContain('usePersonalContext()');
  });

  it('preserves focused-workspace state and dashboard return context', () => {
    const source = fs.readFileSync(referenceComponent, 'utf8');
    const home = fs.readFileSync(homeComponent, 'utf8');
    expect(source).toContain('glow:living:day-flow-date');
    expect(source).toContain('glow:living:planning-scope');
    expect(source).toContain('glow:living:important-inbox-tab');
    expect(source).toContain('glow:living:catch-up-tab');
    expect(source).toContain('glow:living:personal-house-tab');
    expect(home).toContain('glow:home-scroll-y');
  });
});
