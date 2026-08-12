import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

const USER_SCOPED_TABLES: Record<string, string[]> = {
  'src/db/schema/adaptive-os.ts': [
    'life_modes',
    'personal_rules',
    'glow_inbox_items',
    'task_dependencies',
    'entity_relations',
    'focus_sessions',
    'day_reviews',
    'maintenance_forecasts',
  ],
  'src/db/schema/interconnected-os.ts': [
    'glow_entities',
    'universal_intake_artifacts',
    'resource_library_items',
    'system_preferences',
    'glow_notices',
  ],
  'src/db/schema/intelligence-expansion.ts': [
    'apple_reminder_connections',
    'apple_reminders',
    'planning_blocks',
    'life_memories',
    'projects',
  ],
  'src/db/schema/health-intelligence.ts': [
    'medications',
    'supplements',
  ],
  'src/db/schema/completion-v1.ts': [
    'planning_periods',
    'ai_proposals',
    'audit_events',
    'intelligent_observations',
    'beauty_products',
    'hair_logs',
    'fitness_sessions',
    'closet_items',
    'finance_goals',
    'life_timeline_events',
    'briefing_snapshots',
  ],
};

function read(relativePath: string) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function compact(value: string) {
  return value.replace(/\s+/g, '');
}

function tableSegment(source: string, tableName: string) {
  const marker = `pgTable('${tableName}'`;
  const start = source.indexOf(marker);
  expect(start, `${tableName} should exist`).toBeGreaterThanOrEqual(0);
  const nextExport = source.indexOf('\nexport const ', start + marker.length);
  return source.slice(start, nextExport === -1 ? source.length : nextExport);
}

describe('Glow OS security completion gate', () => {
  it('keeps every completion-era intelligence table explicitly user scoped', () => {
    for (const [relativePath, tables] of Object.entries(USER_SCOPED_TABLES)) {
      const source = read(relativePath);
      for (const table of tables) {
        const segment = compact(tableSegment(source, table));
        expect(segment, `${table} must expose a userId field`).toContain('userId:');
        expect(segment, `${table} must persist user_id`).toContain("text('user_id')");
        expect(segment, `${table} must reference Auth.js users`).toContain('references(()=>users.id');
      }
    }
  });

  it('keeps executable Concierge AI actions approval-gated, user-scoped, auditable and reversible', () => {
    const schema = compact(read('src/db/schema/completion-v1.ts'));
    const concierge = read('src/app/actions/concierge.ts');

    expect(compact(tableSegment(schema, 'ai_proposals'))).toContain("status:text('status').notNull().default('pending')");
    expect(concierge).toContain("proposal.status !== 'pending'");
    expect(concierge).toContain("if (decision === 'approved')");
    expect(concierge).toContain('eq(aiProposals.userId, userId)');
    expect(concierge).toContain('eq(tasks.userId, userId)');
    expect(concierge).toContain('db.insert(auditEvents)');
    expect(concierge).toContain("action: `ai_proposal_${decision}`");
    expect(concierge).toContain("action: 'ai_proposal_reversed'");
    expect(concierge).toContain("eq(tasks.source, 'ai_concierge')");
    expect(concierge).toContain('eq(tasks.sourceVersion, proposal.id)');
  });
});
