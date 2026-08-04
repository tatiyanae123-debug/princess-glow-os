import { describe, it, expect, vi, beforeEach } from 'vitest';

let mockRows: unknown[] = [];

vi.mock('@/db', () => ({
  db: {
    select: () => ({
      from: () => ({
        where: () => Promise.resolve(mockRows),
      }),
    }),
  },
}));

const { buildImportPreview } = await import('@/lib/importer/preview');

describe('buildImportPreview', () => {
  beforeEach(() => {
    mockRows = [];
  });

  it('returns a preview item for every template in the requested categories (selection data)', async () => {
    const preview = await buildImportPreview('user-1', ['saint_care']);
    // saint_care has 2 templates in the library
    expect(preview).toHaveLength(2);
    expect(preview.every((item) => typeof item.key === 'string' && item.key.length > 0)).toBe(true);
    expect(preview.every((item) => 'duplicate' in item)).toBe(true);
  });

  it('produces unique keys so the client can select/deselect individual items', async () => {
    const preview = await buildImportPreview('user-1', ['habits']);
    const keys = preview.map((i) => i.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('flags nothing as duplicate on a first-ever run (empty account)', async () => {
    mockRows = [];
    const preview = await buildImportPreview('user-1', ['habits']);
    expect(preview.every((item) => item.duplicate === false)).toBe(true);
  });

  it('flags items as duplicate on a repeat run once the user already has them (repeat importer execution)', async () => {
    // Simulate: user already ran the importer once and has "Hydration" as a habit.
    mockRows = [{ name: 'Hydration' }];
    const preview = await buildImportPreview('user-1', ['habits']);
    const hydration = preview.find((i) => 'name' in i.template && i.template.name === 'Hydration');
    expect(hydration?.duplicate).toBe(true);
    // Other habits in the same category, not yet imported, should not be flagged.
    const others = preview.filter((i) => 'name' in i.template && i.template.name !== 'Hydration');
    expect(others.every((i) => i.duplicate === false)).toBe(true);
  });
});
