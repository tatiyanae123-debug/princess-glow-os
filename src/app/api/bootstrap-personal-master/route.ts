import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema/auth';
import { importBatches } from '@/db/schema/imports';
import { confirmImportBatch } from '@/lib/importer/confirm';
import {
  GLOW_OS_SOURCE,
  GLOW_OS_SOURCE_VERSION,
  IMPORT_CATEGORY_TEMPLATES,
  type ImportTemplate,
} from '@/lib/glow-content/library';
import type { ConfirmImportInput } from '@/lib/validations/importer';

const TARGET_EMAIL = 'tatiyanae123@gmail.com';

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function toImportItem(template: ImportTemplate, index: number): ConfirmImportInput['items'][number] {
  if (template.category === 'routines') {
    return {
      category: 'routines',
      key: `personal-routine-${index}-${slug(template.name)}`,
      name: template.name,
      description: template.description,
      timeOfDay: template.timeOfDay,
      daysOfWeek: template.daysOfWeek,
    };
  }
  if (template.category === 'habits') {
    return {
      category: 'habits',
      key: `personal-habit-${index}-${slug(template.name)}`,
      name: template.name,
      description: template.description,
      frequency: template.frequency,
    };
  }
  if (template.category === 'tasks') {
    return {
      category: 'tasks',
      key: `personal-task-${index}-${slug(template.title)}`,
      title: template.title,
      description: template.description,
    };
  }
  if (template.category === 'beauty_routines') {
    return {
      category: 'beauty_routines',
      key: `personal-beauty-${index}-${slug(template.name)}`,
      name: template.name,
      timeOfDay: template.timeOfDay,
      products: template.products,
    };
  }
  return {
    category: 'calendar_templates',
    key: `personal-calendar-${index}-${slug(template.title)}`,
    title: template.title,
    description: template.description,
    startTime: template.startTime,
    durationMinutes: template.durationMinutes,
    daysOfWeek: template.daysOfWeek,
  };
}

export async function POST() {
  const [user] = await db.select().from(users).where(eq(users.email, TARGET_EMAIL)).limit(1);
  if (!user) {
    return NextResponse.json({ ok: false, error: 'Target Glow OS account not found.' }, { status: 404 });
  }

  const [existing] = await db
    .select()
    .from(importBatches)
    .where(
      and(
        eq(importBatches.userId, user.id),
        eq(importBatches.source, GLOW_OS_SOURCE),
        eq(importBatches.sourceVersion, GLOW_OS_SOURCE_VERSION),
        eq(importBatches.status, 'confirmed'),
      ),
    )
    .limit(1);

  if (existing) {
    return NextResponse.json({ ok: true, alreadyImported: true, batchId: existing.id });
  }

  const categories = [
    'routines', 'habits', 'tasks', 'beauty_routines', 'hair_routines', 'wellness_routines',
    'home_resets', 'finance_reviews', 'planning_rituals', 'saint_care', 'calendar_templates',
    'monthly_resets', 'seasonal_resets', 'yearly_resets',
  ] as const;

  const templates = categories.flatMap((category) => IMPORT_CATEGORY_TEMPLATES[category]);
  const items = templates.map(toImportItem);
  const batch = await confirmImportBatch(user.id, { batchCategory: 'personal_master_bootstrap', items });

  return NextResponse.json({
    ok: true,
    alreadyImported: false,
    batchId: batch.id,
    imported: items.length,
    source: GLOW_OS_SOURCE,
    version: GLOW_OS_SOURCE_VERSION,
  });
}
