import 'server-only';

import { sql } from 'drizzle-orm';
import { db } from '@/db';

export const LIVING_KERNEL_SCHEMA_VERSION = 2;

const statements = [
  `CREATE TABLE IF NOT EXISTS glow_entities (
    id text PRIMARY KEY,
    user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entity_type text NOT NULL,
    canonical_key text,
    source_table text,
    source_id text,
    title text NOT NULL,
    summary text,
    searchable_text text,
    status text NOT NULL DEFAULT 'active',
    state text NOT NULL DEFAULT 'active',
    version integer NOT NULL DEFAULT 1,
    importance real NOT NULL DEFAULT 0.5,
    confidence real NOT NULL DEFAULT 1,
    source_hash text,
    provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
    timing jsonb NOT NULL DEFAULT '{}'::jsonb,
    dependencies jsonb NOT NULL DEFAULT '[]'::jsonb,
    constraints jsonb NOT NULL DEFAULT '[]'::jsonb,
    triggers jsonb NOT NULL DEFAULT '[]'::jsonb,
    available_actions jsonb NOT NULL DEFAULT '[]'::jsonb,
    resources jsonb NOT NULL DEFAULT '[]'::jsonb,
    cross_domain_effects jsonb NOT NULL DEFAULT '[]'::jsonb,
    permissions jsonb NOT NULL DEFAULT '{}'::jsonb,
    completion_stage text,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    valid_from timestamp NOT NULL DEFAULT now(),
    valid_to timestamp,
    superseded_by text,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
  )`,
  `ALTER TABLE glow_entities ADD COLUMN IF NOT EXISTS canonical_key text`,
  `ALTER TABLE glow_entities ADD COLUMN IF NOT EXISTS state text NOT NULL DEFAULT 'active'`,
  `ALTER TABLE glow_entities ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 1`,
  `ALTER TABLE glow_entities ADD COLUMN IF NOT EXISTS confidence real NOT NULL DEFAULT 1`,
  `ALTER TABLE glow_entities ADD COLUMN IF NOT EXISTS source_hash text`,
  `ALTER TABLE glow_entities ADD COLUMN IF NOT EXISTS provenance jsonb NOT NULL DEFAULT '{}'::jsonb`,
  `ALTER TABLE glow_entities ADD COLUMN IF NOT EXISTS timing jsonb NOT NULL DEFAULT '{}'::jsonb`,
  `ALTER TABLE glow_entities ADD COLUMN IF NOT EXISTS dependencies jsonb NOT NULL DEFAULT '[]'::jsonb`,
  `ALTER TABLE glow_entities ADD COLUMN IF NOT EXISTS constraints jsonb NOT NULL DEFAULT '[]'::jsonb`,
  `ALTER TABLE glow_entities ADD COLUMN IF NOT EXISTS triggers jsonb NOT NULL DEFAULT '[]'::jsonb`,
  `ALTER TABLE glow_entities ADD COLUMN IF NOT EXISTS available_actions jsonb NOT NULL DEFAULT '[]'::jsonb`,
  `ALTER TABLE glow_entities ADD COLUMN IF NOT EXISTS resources jsonb NOT NULL DEFAULT '[]'::jsonb`,
  `ALTER TABLE glow_entities ADD COLUMN IF NOT EXISTS cross_domain_effects jsonb NOT NULL DEFAULT '[]'::jsonb`,
  `ALTER TABLE glow_entities ADD COLUMN IF NOT EXISTS permissions jsonb NOT NULL DEFAULT '{}'::jsonb`,
  `ALTER TABLE glow_entities ADD COLUMN IF NOT EXISTS completion_stage text`,
  `ALTER TABLE glow_entities ADD COLUMN IF NOT EXISTS valid_from timestamp NOT NULL DEFAULT now()`,
  `ALTER TABLE glow_entities ADD COLUMN IF NOT EXISTS valid_to timestamp`,
  `ALTER TABLE glow_entities ADD COLUMN IF NOT EXISTS superseded_by text`,
  `CREATE INDEX IF NOT EXISTS glow_entities_user_type_idx ON glow_entities(user_id, entity_type)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS glow_entities_source_uidx ON glow_entities(user_id, source_table, source_id)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS glow_entities_canonical_uidx ON glow_entities(user_id, canonical_key) WHERE canonical_key IS NOT NULL`,

  `CREATE TABLE IF NOT EXISTS entity_relations (
    id text PRIMARY KEY,
    user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    from_type text NOT NULL,
    from_id text NOT NULL,
    from_object_id text,
    relation text NOT NULL,
    to_type text NOT NULL,
    to_id text NOT NULL,
    to_object_id text,
    weight real NOT NULL DEFAULT 1,
    confidence real NOT NULL DEFAULT 1,
    provenance text NOT NULL DEFAULT 'explicit',
    rationale text,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    valid_from timestamp NOT NULL DEFAULT now(),
    valid_to timestamp,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
  )`,
  `ALTER TABLE entity_relations ADD COLUMN IF NOT EXISTS from_object_id text`,
  `ALTER TABLE entity_relations ADD COLUMN IF NOT EXISTS to_object_id text`,
  `ALTER TABLE entity_relations ADD COLUMN IF NOT EXISTS confidence real NOT NULL DEFAULT 1`,
  `ALTER TABLE entity_relations ADD COLUMN IF NOT EXISTS provenance text NOT NULL DEFAULT 'explicit'`,
  `ALTER TABLE entity_relations ADD COLUMN IF NOT EXISTS rationale text`,
  `ALTER TABLE entity_relations ADD COLUMN IF NOT EXISTS valid_from timestamp NOT NULL DEFAULT now()`,
  `ALTER TABLE entity_relations ADD COLUMN IF NOT EXISTS valid_to timestamp`,
  `ALTER TABLE entity_relations ADD COLUMN IF NOT EXISTS updated_at timestamp NOT NULL DEFAULT now()`,
  `CREATE INDEX IF NOT EXISTS entity_relations_user_from_object_idx ON entity_relations(user_id, from_object_id)`,
  `CREATE INDEX IF NOT EXISTS entity_relations_user_to_object_idx ON entity_relations(user_id, to_object_id)`,

  `CREATE TABLE IF NOT EXISTS glow_object_versions (
    id text PRIMARY KEY,
    user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    object_id text NOT NULL,
    version integer NOT NULL,
    state text NOT NULL DEFAULT 'active',
    confidence real NOT NULL DEFAULT 1,
    source_hash text,
    snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
    reason text,
    actor text NOT NULL DEFAULT 'kernel',
    created_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS glow_object_versions_user_object_idx ON glow_object_versions(user_id, object_id)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS glow_object_versions_user_object_version_uidx ON glow_object_versions(user_id, object_id, version)`,

  `CREATE TABLE IF NOT EXISTS glow_kernel_events (
    id text PRIMARY KEY,
    user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type text NOT NULL,
    object_id text,
    related_object_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
    payload jsonb NOT NULL DEFAULT '{}'::jsonb,
    source text NOT NULL DEFAULT 'kernel',
    confidence real NOT NULL DEFAULT 1,
    occurred_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS glow_kernel_events_user_occurred_idx ON glow_kernel_events(user_id, occurred_at)`,
  `CREATE INDEX IF NOT EXISTS glow_kernel_events_user_type_idx ON glow_kernel_events(user_id, event_type)`,

  `CREATE TABLE IF NOT EXISTS glow_scenarios (
    id text PRIMARY KEY,
    user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kind text NOT NULL DEFAULT 'proposed-reality',
    title text NOT NULL,
    summary text,
    based_on_reality_id text NOT NULL,
    source_route text,
    source_text text,
    status text NOT NULL DEFAULT 'draft',
    confidence real NOT NULL DEFAULT 0.5,
    assumptions jsonb NOT NULL DEFAULT '[]'::jsonb,
    expected_effects jsonb NOT NULL DEFAULT '[]'::jsonb,
    created_at timestamp NOT NULL DEFAULT now(),
    decided_at timestamp
  )`,
  `CREATE INDEX IF NOT EXISTS glow_scenarios_user_status_idx ON glow_scenarios(user_id, status)`,
  `CREATE INDEX IF NOT EXISTS glow_scenarios_user_created_idx ON glow_scenarios(user_id, created_at)`,

  `CREATE TABLE IF NOT EXISTS glow_scenario_changes (
    id text PRIMARY KEY,
    user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scenario_id text NOT NULL,
    object_id text,
    action_type text NOT NULL,
    patch jsonb NOT NULL DEFAULT '{}'::jsonb,
    rationale text NOT NULL,
    expected_effects jsonb NOT NULL DEFAULT '[]'::jsonb,
    created_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS glow_scenario_changes_user_scenario_idx ON glow_scenario_changes(user_id, scenario_id)`,

  `CREATE TABLE IF NOT EXISTS glow_action_receipts (
    id text PRIMARY KEY,
    user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scenario_id text,
    action text NOT NULL,
    reasons jsonb NOT NULL DEFAULT '[]'::jsonb,
    evidence jsonb NOT NULL DEFAULT '[]'::jsonb,
    affected_object_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
    affected_domains jsonb NOT NULL DEFAULT '[]'::jsonb,
    confidence real NOT NULL DEFAULT 1,
    executor text NOT NULL,
    result text NOT NULL,
    reversible boolean NOT NULL DEFAULT false,
    undo_ref text,
    details jsonb NOT NULL DEFAULT '{}'::jsonb,
    changed_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS glow_action_receipts_user_changed_idx ON glow_action_receipts(user_id, changed_at)`,
  `CREATE INDEX IF NOT EXISTS glow_action_receipts_user_scenario_idx ON glow_action_receipts(user_id, scenario_id)`,

  `CREATE TABLE IF NOT EXISTS glow_learnings (
    id text PRIMARY KEY,
    user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    learning_type text NOT NULL,
    domain text NOT NULL,
    statement text NOT NULL,
    evidence_object_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
    confidence real NOT NULL DEFAULT 0.5,
    status text NOT NULL DEFAULT 'proposed',
    source text NOT NULL DEFAULT 'kernel',
    valid_from timestamp NOT NULL DEFAULT now(),
    valid_until timestamp,
    superseded_by text,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS glow_learnings_user_status_idx ON glow_learnings(user_id, status)`,
  `CREATE INDEX IF NOT EXISTS glow_learnings_user_domain_idx ON glow_learnings(user_id, domain)`,

  `CREATE TABLE IF NOT EXISTS glow_kernel_states (
    user_id text PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    schema_version integer NOT NULL DEFAULT ${LIVING_KERNEL_SCHEMA_VERSION},
    current_reality_id text NOT NULL,
    last_full_sync_at timestamp,
    last_event_at timestamp,
    last_error text,
    sync_revision integer NOT NULL DEFAULT 0,
    updated_at timestamp NOT NULL DEFAULT now()
  )`,
];

let ensurePromise: Promise<void> | null = null;

export async function ensureLivingKernelSchema() {
  if (!ensurePromise) {
    ensurePromise = (async () => {
      for (const statement of statements) await db.execute(sql.raw(statement));
    })().catch((error) => {
      ensurePromise = null;
      throw error;
    });
  }
  return ensurePromise;
}
