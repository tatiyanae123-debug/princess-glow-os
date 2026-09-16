import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  MATRIX_DATA_STATES,
  MATRIX_DEVICES,
  MATRIX_DIMENSIONS,
  MATRIX_INTERACTION_STATES,
  MATRIX_MODES,
} from '@/lib/glow/wave-9-device-state-matrix';
import { roomExperienceFor, type GlowWorld } from '@/lib/glow-world/room-experience';
import { enclosureForPath, railTargetsForWorld } from '@/lib/glow-world/navigation-shell';
import { buildTodayLivingModel } from '@/lib/glow-world/today-experience-model';

const root = process.cwd();
const readSource = (path: string) => readFileSync(resolve(root, path), 'utf8');

const GOLDEN_ROUTES: ReadonlyArray<{ route: string; page: string; world: GlowWorld }> = [
  { route: '/today', page: 'src/app/today/page.tsx', world: 'today' },
  { route: '/planning', page: 'src/app/planning/page.tsx', world: 'plan' },
  { route: '/routines', page: 'src/app/routines/page.tsx', world: 'plan' },
  { route: '/beauty', page: 'src/app/beauty/page.tsx', world: 'beauty' },
  { route: '/beauty/skincare', page: 'src/app/beauty/skincare/page.tsx', world: 'beauty' },
  { route: '/beauty/gua-sha', page: 'src/app/beauty/gua-sha/page.tsx', world: 'beauty' },
  { route: '/hair', page: 'src/app/hair/page.tsx', world: 'beauty' },
  { route: '/life', page: 'src/app/life/page.tsx', world: 'life' },
  { route: '/closet', page: 'src/app/closet/page.tsx', world: 'life' },
  { route: '/fitness', page: 'src/app/fitness/page.tsx', world: 'life' },
  { route: '/wellness', page: 'src/app/wellness/page.tsx', world: 'life' },
  { route: '/brain', page: 'src/app/brain/page.tsx', world: 'brain' },
  { route: '/create', page: 'src/app/create/page.tsx', world: 'create' },
  { route: '/projects', page: 'src/app/projects/page.tsx', world: 'create' },
];

function scoreForEnergy(energy: 'low' | 'normal' | 'high' | 'recovery') {
  const data = {
    tasks: [
      {
        id: 'matrix-task',
        title: 'Matrix task',
        description: null,
        status: 'pending',
        priority: 'medium',
        dueDate: null,
      },
    ],
    activeTask: null,
    events: [],
    todayEvents: [],
    tomorrowEvents: [],
    routines: [],
    wellness: { energy },
  } as unknown as Parameters<typeof buildTodayLivingModel>[0];

  const model = buildTodayLivingModel(data, new Date('2026-09-16T12:00:00-04:00'));
  return model.rankedNextActions[0]?.score ?? -1;
}

describe('Batch C · device, mode and state matrix', () => {
  it('covers the five required device families with real shared responsive ancestors', () => {
    expect([...MATRIX_DEVICES]).toEqual([
      'iphone-compact',
      'iphone-large',
      'ipad-portrait',
      'ipad-landscape',
      'desktop',
    ]);

    const phone = readSource('src/app/batch-b-whole-app-convergence.css');
    const tablet = readSource('src/app/device-composition.css');
    const shell = readSource('src/app/glow-shell.css');
    const responsive = `${phone}\n${tablet}\n${shell}`;

    expect(phone).toMatch(/@media\s*\(max-width:\s*390px\)/);
    expect(phone).toMatch(/@media\s*\(max-width:\s*700px\)/);
    expect(tablet).toMatch(/orientation:\s*portrait/);
    expect(tablet).toMatch(/orientation:\s*landscape/);
    expect(shell).toContain('.glow-current__top-band');
    expect(responsive).toContain('env(safe-area-inset-top)');
    expect(responsive).toMatch(/100dvh|100svh/);
  });

  it('executes all four canonical energy modes through the real Today prioritization path', () => {
    expect([...MATRIX_MODES]).toEqual(['low', 'normal', 'high', 'recovery']);

    const low = scoreForEnergy('low');
    const normal = scoreForEnergy('normal');
    const high = scoreForEnergy('high');
    const recovery = scoreForEnergy('recovery');

    expect(low).toBeGreaterThan(0);
    expect(recovery).toBe(low);
    expect(high).toBe(normal);
    expect(normal).toBeGreaterThan(low);

    const routineCatalog = readSource('src/components/routines/routine-catalog.ts');
    const routineWorld = readSource('src/components/routines/routine-reference-world.tsx');
    expect(routineCatalog).toContain("'Recovery' | 'Low' | 'Medium' | 'High'");
    expect(routineWorld).toContain("modes=['Recovery','Low','Medium','High']");
    expect(routineWorld).toContain('Energy Versions');
  });

  it('has concrete implementation evidence for loading, empty, populated, error, overlay and persistence states', () => {
    for (const state of ['loading', 'empty', 'populated', 'error'] as const) {
      expect(MATRIX_DATA_STATES).toContain(state);
    }
    expect(MATRIX_INTERACTION_STATES).toContain('overlay-open');
    expect(MATRIX_DIMENSIONS).toContain('persistence');

    const loading = readSource('src/app/loading.tsx');
    const error = readSource('src/app/error.tsx');
    const notes = readSource('src/components/notes/note-manager.tsx');
    const dialog = readSource('src/components/ui/dialog.tsx');
    const current = readSource('src/components/glow/glow-current.tsx');

    expect(loading).toContain('GlowSystemState');
    expect(loading).toContain('kind="loading"');
    expect(error).toContain('GlowSystemState');
    expect(error).toContain('kind="error"');
    expect(notes).toContain('filteredNotes.length === 0');
    expect(notes).toContain('filteredNotes.map');
    expect(dialog).toContain('role="dialog"');
    expect(dialog).toContain('aria-modal="true"');
    expect(dialog).toContain("event.key === 'Escape'");
    expect(dialog).toContain("event.key !== 'Tab'");
    expect(current).toContain('glow.current.thread.v2');
    expect(current).toContain('glow.world.state-anchors.v2');
    expect(current).toContain('glow.world.pending-restore.v2');
    expect(current).toContain('glow:world-state-restore');
  });

  it('keeps matrix accessibility and touch behavior at shared ancestors', () => {
    const focus = readSource('src/app/keyboard-focus.css');
    const phone = readSource('src/app/batch-b-whole-app-convergence.css');
    const dialog = readSource('src/components/ui/dialog.tsx');

    expect(focus).toContain(':focus-visible');
    expect(phone).toContain('touch-action: manipulation');
    expect(phone).toContain('@media (forced-colors: active)');
    expect(dialog).toContain('previousFocus');
    expect(dialog).toContain('focusable');
  });
});

describe('Batch C · representative Golden routes', () => {
  for (const golden of GOLDEN_ROUTES) {
    it(`${golden.route} is physical, resolves to ${golden.world}, and inherits shell navigation`, () => {
      expect(existsSync(resolve(root, golden.page)), `${golden.page} must exist`).toBe(true);
      expect(roomExperienceFor(golden.route).world).toBe(golden.world);
      expect(['open', 'structured', 'protected']).toContain(enclosureForPath(golden.route));
      expect(railTargetsForWorld(golden.world).length).toBeGreaterThan(0);
    });
  }
});
