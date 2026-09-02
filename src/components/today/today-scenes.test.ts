import { describe, expect, it } from 'vitest';
import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

describe('Glow Today scene foundation', () => {
  it.each([
    'src/app/dashboard/page.tsx',
    'src/app/today/morning/page.tsx',
    'src/app/today/flow/page.tsx',
    'src/app/today/evening/page.tsx',
  ])('ships route %s', (path) => {
    expect(statSync(resolve(root, path)).isFile()).toBe(true);
  });

  it.each([
    'public/glow/today/home-v3.webp',
    'public/glow/today/morning-brief-v3.webp',
    'public/glow/today/day-flow-v3.webp',
    'public/glow/today/evening-debrief-v3.webp',
  ])('ships a real environmental asset at %s', (path) => {
    expect(statSync(resolve(root, path)).size).toBeGreaterThan(50_000);
  });

  it('ships the opening experience and device-time synchronization', () => {
    expect(statSync(resolve(root, 'public/glow/today/opening-reference.jpeg')).size).toBeGreaterThan(15_000);
    const source = read('src/components/today/today-experience.tsx');
    expect(source).toContain("useState<JourneyScene>(initialScene)");
    expect(source).toContain("const initialScene: JourneyScene");
    expect(source).not.toContain('sessionStorage');
    expect(source).toContain('glow-timezone');
    expect(source).toContain("brief: 'Midday Brief'");
    expect(source).toContain("brief: 'Night Brief'");
    expect(source).toContain('window.scrollTo');
    for (const scene of ["'home'", "'brief'", "'flow'", "'debrief'"]) expect(source).toContain(scene);
  });

  it('ships deliberate tablet and reduced-motion layouts', () => {
    const css = read('src/app/today-scenes.css');
    expect(css).toContain('@media (min-width:700px)');
    expect(css).toContain('@media (prefers-reduced-motion:reduce)');
    expect(css).toContain('.today-utility-controls select');
    expect(css).toContain('vercel-live-feedback');
    expect(css).toContain("opening-reference.jpeg");
    expect(css).toContain('background-size:auto 100%');
    expect(css).toContain('overflow-y:auto');
    expect(css).toContain('-webkit-overflow-scrolling:touch');
    expect(css).toContain('.today-reflection-form{pointer-events:none}');
  });

  it('keeps dates, priorities, appointments, energy, and Ask Glow live', () => {
    const source = read('src/components/today/today-experience.tsx');
    expect(source).toContain('useLiveMoment');
    expect(source).toContain('data.tasks');
    expect(source).toContain('todaySchedule.events');
    expect(source).toContain('wellnessToday.entry?.energy');
    expect(source).toContain("new Event('glow:voice-open')");
    expect(source).toContain('completeTodayTaskAction');
    expect(source).toContain('moveTodayTaskToTomorrowAction');
    expect(source).toContain('finishDayFormAction');
  });

  it('provides one remembered five-world navigation system', () => {
    const source = read('src/components/today/glow-world-nav.tsx');
    for (const label of ['Today', 'Plan', 'Life', 'Brain', 'Create']) expect(source).toContain(`label: '${label}'`);
    expect(source).toContain("window.localStorage.setItem('glow:last-route'");
    expect(source).toContain('startViewTransition');
  });

  it('does not simulate a phone status bar in the live Today component', () => {
    const source = read('src/components/today/today-experience.tsx').toLowerCase();
    expect(source).not.toContain('wifi');
    expect(source).not.toContain('battery');
    expect(source).not.toContain('status bar');
  });
});
