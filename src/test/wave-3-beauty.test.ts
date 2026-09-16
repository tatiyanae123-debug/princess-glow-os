import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { pageContractViolations, pageManifestFor, REQUIRED_SYNC_DIMENSIONS } from '@/lib/glow-world/page-manifest';
import { BEAUTY_FACTORY_GATES, BEAUTY_FACTORY_ROOMS } from '@/lib/glow/beauty-factory-wave';
import {
  BEAUTY_CANONICAL_OBJECTS,
  BEAUTY_INVENTORY_LAWS,
  BEAUTY_REQUIRED_DIMENSIONS,
  WAVE_3_COMPLETION_ORDER,
  WAVE_3_ENTRY,
  wave3Checkpoint,
  type BeautyEvidence,
} from '@/lib/glow/wave-3-beauty-runtime';
import { WAVE_2_LOCK } from '@/lib/glow/wave-2-runtime';

const root = process.cwd();
const source = (path: string) => readFileSync(resolve(root, path), 'utf8');

const PHYSICAL_BEAUTY_ROUTES = [
  ['skincare', '/beauty/skincare', 'src/app/beauty/skincare/page.tsx'],
  ['gua-sha', '/beauty/gua-sha', 'src/app/beauty/gua-sha/page.tsx'],
  ['hair', '/hair', 'src/app/hair/page.tsx'],
  ['makeup', '/beauty/makeup', 'src/app/beauty/makeup/page.tsx'],
  ['body', '/beauty/body', 'src/app/beauty/body/page.tsx'],
  ['nails', '/beauty/nails', 'src/app/beauty/[studio]/page.tsx'],
  ['brows', '/beauty/brows', 'src/app/beauty/[studio]/page.tsx'],
  ['lashes', '/beauty/lashes', 'src/app/beauty/[studio]/page.tsx'],
  ['oral', '/beauty/oral', 'src/app/beauty/[studio]/page.tsx'],
  ['fragrance', '/beauty/fragrance', 'src/app/beauty/fragrance/page.tsx'],
  ['tools-devices', '/beauty/devices', 'src/app/beauty/devices/page.tsx'],
  ['maintenance', '/beauty/maintenance', 'src/app/beauty/maintenance/page.tsx'],
] as const;

const SHARED_BEAUTY_INFRA = [
  ['/beauty', 'src/app/beauty/page.tsx'],
  ['/beauty/today', 'src/app/beauty/today/page.tsx'],
  ['/beauty/inventory', 'src/app/beauty/inventory/page.tsx'],
  ['/beauty/progress', 'src/app/beauty/progress/page.tsx'],
] as const;

const GUA_SHA_EXPERIENCES = ['guided', 'morning', 'midday', 'night'] as const;

describe('Batch A · Wave 3 Beauty completion gate', () => {
  it('enters Beauty only from the explicitly locked Wave 2 handoff', () => {
    expect(WAVE_2_LOCK.status).toBe('LOCKED');
    expect(WAVE_3_ENTRY.allowed).toBe(true);
    expect(WAVE_3_ENTRY.requires).toBe('wave-2-locked');
  });

  it('covers every required Beauty room exactly once in the factory and completion order', () => {
    const factoryRooms = BEAUTY_FACTORY_ROOMS.map((room) => room.room);
    expect(factoryRooms).toHaveLength(12);
    expect(new Set(factoryRooms).size).toBe(12);
    expect([...factoryRooms].sort()).toEqual([...WAVE_3_COMPLETION_ORDER].sort());
    expect(BEAUTY_FACTORY_ROOMS.filter((room) => room.exception).map((room) => room.room).sort()).toEqual(['gua-sha', 'skincare']);
  });

  it('ties every Beauty room to a physical route and the shared Glow contract', () => {
    for (const [room, route, file] of PHYSICAL_BEAUTY_ROUTES) {
      expect(existsSync(resolve(root, file)), `${room} must have a physical route`).toBe(true);
      const manifest = pageManifestFor(route);
      expect(manifest, `${route} must be registered`).toBeTruthy();
      expect(manifest?.world).toBe('beauty');
      expect(pageContractViolations(route)).toEqual([]);
      expect(manifest?.sync.sort()).toEqual([...REQUIRED_SYNC_DIMENSIONS].sort());
    }
  });

  it('keeps Beauty hub, Today, inventory and progress as real shared infrastructure', () => {
    for (const [route, file] of SHARED_BEAUTY_INFRA) {
      expect(existsSync(resolve(root, file)), `${file} must exist`).toBe(true);
      expect(pageManifestFor(route)?.world).toBe('beauty');
      expect(pageContractViolations(route)).toEqual([]);
    }
  });

  it('makes Nails, Brows, Lashes and Oral real data-backed studios rather than dead routes', () => {
    const studio = source('src/app/beauty/[studio]/page.tsx');
    for (const slug of ['nails', 'brows', 'lashes', 'oral']) {
      expect(studio).toContain(`${slug}: {`);
    }
    expect(studio).toContain('getBeautyProducts(session.user.id)');
    expect(studio).toContain('getBeautyRoutinesByUser(session.user.id)');
    expect(studio).toContain('No matching products are recorded yet.');
    expect(studio).toContain('aria-label={`${definition.title} summary`}');
  });

  it('keeps the shared Beauty rooms on canonical products, routines, calendar and history data', () => {
    const depthRoom = source('src/components/beauty/beauty-depth-room.tsx');
    expect(depthRoom).toContain('getBeautyProducts(session.user.id)');
    expect(depthRoom).toContain('getBeautyRoutinesByUser(session.user.id)');
    expect(depthRoom).toContain('getCalendarEventsByUser(session.user.id)');
    expect(depthRoom).toContain('getHairLogs(session.user.id)');
    expect(depthRoom).toContain("redirect('/sign-in')");
  });

  it('preserves the full guided Gua Sha exception family on real authenticated data', () => {
    const studioPage = source('src/components/beauty/gua-sha-studio-page.tsx');
    expect(studioPage).toContain('getGuaShaStudioData(session.user.id)');
    expect(studioPage).toContain("redirect('/sign-in')");
    for (const view of GUA_SHA_EXPERIENCES) {
      const file = `src/app/beauty/gua-sha/${view}/page.tsx`;
      expect(existsSync(resolve(root, file)), `${file} must exist`).toBe(true);
      expect(pageContractViolations(`/beauty/gua-sha/${view}`)).toEqual([]);
    }
  });

  it('inherits responsive, reduced-motion and nonvisual accessibility behavior from Beauty ancestors', () => {
    const atelierCss = source('src/app/beauty/beauty-personal-atelier.module.css');
    const depthCss = source('src/components/beauty/beauty-domain-rooms.module.css');
    const guaCss = source('src/components/beauty/gua-sha-reference-studio-v5.module.css');
    for (const css of [atelierCss, depthCss, guaCss]) {
      expect(css).toContain('@media');
    }
    expect(`${atelierCss}\n${depthCss}\n${guaCss}`).toContain('prefers-reduced-motion');
    const gua = source('src/components/beauty/gua-sha-reference-studio-v5.tsx');
    expect(gua).toContain('aria-');
  });

  it('locks canonical Beauty object and inventory laws instead of creating page-local ownership truth', () => {
    expect(BEAUTY_CANONICAL_OBJECTS).toContain('product');
    expect(BEAUTY_CANONICAL_OBJECTS).toContain('routine');
    expect(BEAUTY_CANONICAL_OBJECTS).toContain('routine-session');
    expect(BEAUTY_INVENTORY_LAWS.oneCanonicalProductRecord).toBe(true);
    expect(BEAUTY_INVENTORY_LAWS.physicalBackupsSeparate).toBe(true);
    expect(BEAUTY_INVENTORY_LAWS.unclearProductsRemainNeedsIdentification).toBe(true);
    expect(BEAUTY_INVENTORY_LAWS.preserveSourceProvenance).toBe(true);
  });

  it('does not permit a false Wave 3 lock when any required evidence dimension is missing', () => {
    const structuralDimensions = BEAUTY_REQUIRED_DIMENSIONS.filter((dimension) => !['runtime', 'visual', 'golden'].includes(dimension));
    const evidence = BEAUTY_FACTORY_ROOMS.flatMap((room) => structuralDimensions.map((dimension) => ({
      surface: room.room,
      dimension,
      status: 'PASS' as const,
      source: 'Batch A executable structural gate',
    }))) as BeautyEvidence[];
    const checkpoint = wave3Checkpoint(evidence, []);
    expect(checkpoint.canLock).toBe(false);
    expect(checkpoint.status).toBe('BUILDING');
    expect(checkpoint.evidence.missing.some((item) => item.endsWith(':runtime'))).toBe(true);
    expect(checkpoint.evidence.missing.some((item) => item.endsWith(':visual'))).toBe(true);
    expect(checkpoint.evidence.missing.some((item) => item.endsWith(':golden'))).toBe(true);
  });

  it('requires the complete factory gate set before retirement or lock', () => {
    for (const gate of ['canonical-data-preserved', 'shared-shell', 'registered-experiences', 'shared-templates', 'state-machine', 'overlay-factory', 'responsive', 'accessibility', 'history', 'golden-exceptions']) {
      expect(BEAUTY_FACTORY_GATES).toContain(gate);
    }
  });
});
