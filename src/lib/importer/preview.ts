import 'server-only';

import { IMPORT_CATEGORY_TEMPLATES, type ImportCategory, type ImportTemplate } from '@/lib/glow-content/library';
import { isDuplicate, normalizeTitle } from '@/lib/importer/duplicate-detection';

export type PreviewItem = {
  key: string;
  template: ImportTemplate;
  duplicate: boolean;
};

function templateKey(category: ImportCategory, template: ImportTemplate, index: number) {
  const label = 'name' in template ? template.name : 'title' in template ? template.title : String(index);
  return `${category}:${normalizeTitle(label)}:${index}`;
}

/**
 * Builds a preview for the requested categories. Purely read-only — this
 * checks for duplicates but writes nothing. The user must explicitly
 * confirm before any real routine/habit/task/beauty/calendar row exists.
 */
export async function buildImportPreview(userId: string, categories: ImportCategory[]): Promise<PreviewItem[]> {
  const results: PreviewItem[] = [];

  for (const category of categories) {
    const templates = IMPORT_CATEGORY_TEMPLATES[category] ?? [];
    for (let i = 0; i < templates.length; i++) {
      const template = templates[i];
      const duplicate = await isDuplicate(userId, template);
      results.push({ key: templateKey(category, template, i), template, duplicate });
    }
  }

  return results;
}
