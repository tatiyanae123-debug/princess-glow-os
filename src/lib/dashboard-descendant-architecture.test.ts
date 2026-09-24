import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(ROOT, file), 'utf8');

describe('Dashboard descendant architecture', () => {
  it('marks AppShell pages as descendants of the new Dashboard visual system', () => {
    const shell = read('src/components/app-shell.tsx');
    expect(shell).toContain("data-glow-deep-page="true"");
    expect(shell).toContain("dashboard-descendant-v1");
  });

  it('uses the shared pearl deep-room chrome and hierarchy', () => {
    const room = read('src/components/glow/canonical-domain-room.tsx');
    expect(room).toContain('Princess Glow OS');
    expect(room).toContain('Dashboard');
    expect(room).toContain('Ask Shakti');
    expect(room).toContain('data-glow-deep-room');
  });

  it('keeps Tasks and Calendar inside the same generation and preserves view state', () => {
    const chrome = read('src/components/plan/plan-instrument-chrome.tsx');
    const tasks = read('src/components/plan/plan-tasks-room.tsx');
    const calendar = read('src/components/plan/plan-calendar-reference.tsx');
    expect(chrome).not.toContain('GLOW OS BATCH 1');
    expect(chrome).toContain('DASHBOARD');
    expect(chrome).toContain('Shakti');
    expect(tasks).toContain('glow:tasks:view-state');
    expect(calendar).toContain('glow:calendar:view-state');
  });

  it('provides real deep destinations for task detail, brain dump, and fitness subroutes', () => {
    const required = [
      'src/app/tasks/[id]/page.tsx',
      'src/app/brain/dump/page.tsx',
      'src/app/fitness/week/page.tsx',
      'src/app/fitness/workout/page.tsx',
      'src/app/fitness/exercises/page.tsx',
      'src/app/fitness/progression/page.tsx',
      'src/app/fitness/recovery/page.tsx',
    ];
    for (const file of required) expect(fs.existsSync(path.join(ROOT, file)), file).toBe(true);
  });

  it('does not populate Fitness with the previous static demo workout library', () => {
    const fitness = read('src/app/fitness/page.tsx');
    for (const demo of ['20-minute reset', 'Strong lower body', 'Upper body sculpt', 'Pilates core flow', 'Mobility restore']) {
      expect(fitness).not.toContain(demo);
    }
    expect(fitness).toContain('sessions.reduce');
  });

  it('routes Brain Dump through the real preserved Glow Inbox capture', () => {
    const brain = read('src/app/brain/page.tsx');
    const dump = read('src/app/brain/dump/page.tsx');
    expect(brain).toContain("/brain/dump");
    expect(brain).not.toContain("/brain/thoughts");
    expect(dump).toContain('addInboxItemFormAction');
    expect(dump).toContain('getInbox');
  });
});
