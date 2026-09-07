import 'server-only';

import { createHash, randomUUID } from 'crypto';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { entityRelations } from '@/db/schema/adaptive-os';
import { glowEntities } from '@/db/schema/interconnected-os';
import {
  glowActionReceipts,
  glowKernelEvents,
  glowKernelStates,
  glowObjectVersions,
  glowScenarioChanges,
  glowScenarios,
} from '@/db/schema/living-kernel';
import { ensureLivingKernelSchema, LIVING_KERNEL_SCHEMA_VERSION } from '@/lib/intelligence/living-kernel-schema';

export type CanonicalGlowObjectInput = {
  domain: string;
  sourceTable: string;
  sourceId: string;
  title: string;
  summary?: string | null;
  searchableText?: string | null;
  state?: string;
  status?: string;
  confidence?: number;
  importance?: number;
  provenance?: Record<string, unknown>;
  timing?: Record<string, unknown>;
  dependencies?: string[];
  constraints?: string[];
  triggers?: string[];
  availableActions?: string[];
  resources?: string[];
  crossDomainEffects?: string[];
  permissions?: Record<string, unknown>;
  completionStage?: string | null;
  metadata?: Record<string, unknown>;
  actor?: string;
  reason?: string;
};

export type GlowGraphEdgeInput = {
  fromObjectId: string;
  toObjectId: string;
  fromType: string;
  fromSourceId: string;
  toType: string;
  toSourceId: string;
  relation: string;
  direction?: 'directed' | 'bidirectional';
  confidence?: number;
  provenance?: 'explicit' | 'inferred';
  rationale?: string;
  weight?: number;
  metadata?: Record<string, unknown>;
};

function jsonSafe<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function stableHash(value: unknown) {
  return createHash('sha256').update(JSON.stringify(jsonSafe(value))).digest('hex');
}

export function canonicalGlowObjectId(domain: string, sourceId: string) {
  return `${domain}:${sourceId}`;
}

export function canonicalSourceKey(sourceTable: string, sourceId: string) {
  return `${sourceTable}:${sourceId}`;
}

export async function recordKernelEvent(input: {
  userId: string;
  eventType: string;
  objectId?: string | null;
  relatedObjectIds?: string[];
  payload?: Record<string, unknown>;
  source?: string;
  confidence?: number;
}) {
  await ensureLivingKernelSchema();
  const now = new Date();
  await db.insert(glowKernelEvents).values({
    id: randomUUID(),
    userId: input.userId,
    eventType: input.eventType,
    objectId: input.objectId ?? null,
    relatedObjectIds: input.relatedObjectIds ?? [],
    payload: jsonSafe(input.payload ?? {}),
    source: input.source ?? 'kernel',
    confidence: input.confidence ?? 1,
    occurredAt: now,
  });
  await db.update(glowKernelStates).set({ lastEventAt: now, updatedAt: now }).where(eq(glowKernelStates.userId, input.userId));
}

export async function upsertCanonicalGlowObject(userId: string, input: CanonicalGlowObjectInput) {
  await ensureLivingKernelSchema();
  const canonicalKey = canonicalGlowObjectId(input.domain, input.sourceId);
  const sourceKey = canonicalSourceKey(input.sourceTable, input.sourceId);
  const now = new Date();
  const status = input.status ?? (input.state === 'archived' ? 'archived' : 'active');
  const state = input.state ?? status;
  const projection = {
    canonicalKey,
    sourceKey,
    domain: input.domain,
    title: input.title,
    summary: input.summary ?? null,
    searchableText: input.searchableText ?? null,
    status,
    state,
    confidence: input.confidence ?? 1,
    importance: input.importance ?? .5,
    provenance: jsonSafe(input.provenance ?? { sourceSystem: 'glow-os', sourceTable: input.sourceTable, sourceId: input.sourceId }),
    timing: jsonSafe(input.timing ?? {}),
    dependencies: input.dependencies ?? [],
    constraints: input.constraints ?? [],
    triggers: input.triggers ?? [],
    availableActions: input.availableActions ?? [],
    resources: input.resources ?? [],
    crossDomainEffects: input.crossDomainEffects ?? [],
    permissions: jsonSafe(input.permissions ?? {}),
    completionStage: input.completionStage ?? null,
    metadata: jsonSafe(input.metadata ?? {}),
  };
  const sourceHash = stableHash(projection);

  const existing = await db.select().from(glowEntities).where(and(
    eq(glowEntities.userId, userId),
    eq(glowEntities.sourceTable, input.sourceTable),
    eq(glowEntities.sourceId, input.sourceId),
  )).limit(1);

  if (existing[0]?.sourceHash === sourceHash && existing[0].canonicalKey === canonicalKey) return existing[0];

  if (existing[0]) {
    const nextVersion = Math.max(1, existing[0].version ?? 1) + 1;
    const [updated] = await db.update(glowEntities).set({
      entityType: input.domain,
      canonicalKey,
      title: input.title,
      summary: input.summary ?? null,
      searchableText: input.searchableText ?? `${input.title} ${input.summary ?? ''}`.trim(),
      status,
      state,
      version: nextVersion,
      importance: input.importance ?? existing[0].importance ?? .5,
      confidence: input.confidence ?? 1,
      sourceHash,
      provenance: projection.provenance,
      timing: projection.timing,
      dependencies: projection.dependencies,
      constraints: projection.constraints,
      triggers: projection.triggers,
      availableActions: projection.availableActions,
      resources: projection.resources,
      crossDomainEffects: projection.crossDomainEffects,
      permissions: projection.permissions,
      completionStage: projection.completionStage,
      metadata: projection.metadata,
      validTo: status === 'archived' ? now : null,
      updatedAt: now,
    }).where(eq(glowEntities.id, existing[0].id)).returning();

    await db.insert(glowObjectVersions).values({
      id: randomUUID(), userId, objectId: canonicalKey, version: nextVersion, state,
      confidence: input.confidence ?? 1, sourceHash, snapshot: projection,
      reason: input.reason ?? 'Legacy source projection changed', actor: input.actor ?? 'kernel-sync', createdAt: now,
    }).onConflictDoNothing();
    await recordKernelEvent({ userId, eventType: 'object.updated', objectId: canonicalKey, payload: { sourceTable: input.sourceTable, sourceId: input.sourceId, version: nextVersion }, source: input.actor ?? 'kernel-sync' });
    return updated;
  }

  const [created] = await db.insert(glowEntities).values({
    id: randomUUID(), userId, entityType: input.domain, canonicalKey,
    sourceTable: input.sourceTable, sourceId: input.sourceId,
    title: input.title, summary: input.summary ?? null,
    searchableText: input.searchableText ?? `${input.title} ${input.summary ?? ''}`.trim(),
    status, state, version: 1, importance: input.importance ?? .5,
    confidence: input.confidence ?? 1, sourceHash,
    provenance: projection.provenance, timing: projection.timing,
    dependencies: projection.dependencies, constraints: projection.constraints,
    triggers: projection.triggers, availableActions: projection.availableActions,
    resources: projection.resources, crossDomainEffects: projection.crossDomainEffects,
    permissions: projection.permissions, completionStage: projection.completionStage,
    metadata: projection.metadata, validFrom: now, validTo: status === 'archived' ? now : null,
    createdAt: now, updatedAt: now,
  }).returning();

  await db.insert(glowObjectVersions).values({
    id: randomUUID(), userId, objectId: canonicalKey, version: 1, state,
    confidence: input.confidence ?? 1, sourceHash, snapshot: projection,
    reason: input.reason ?? 'Legacy source projected into the Life Model', actor: input.actor ?? 'kernel-sync', createdAt: now,
  }).onConflictDoNothing();
  await recordKernelEvent({ userId, eventType: 'object.created', objectId: canonicalKey, payload: { sourceTable: input.sourceTable, sourceId: input.sourceId, version: 1 }, source: input.actor ?? 'kernel-sync' });
  return created;
}

export async function upsertGlowGraphEdge(userId: string, input: GlowGraphEdgeInput) {
  await ensureLivingKernelSchema();
  const id = `edge:${stableHash([userId, input.fromObjectId, input.relation, input.toObjectId]).slice(0, 48)}`;
  const now = new Date();
  const metadata = jsonSafe({ ...(input.metadata ?? {}), direction: input.direction ?? 'directed' });
  await db.insert(entityRelations).values({
    id, userId,
    fromType: input.fromType, fromId: input.fromSourceId, fromObjectId: input.fromObjectId,
    relation: input.relation,
    toType: input.toType, toId: input.toSourceId, toObjectId: input.toObjectId,
    weight: input.weight ?? 1,
    confidence: input.confidence ?? 1,
    provenance: input.provenance ?? 'explicit',
    rationale: input.rationale ?? null,
    metadata,
    validFrom: now,
    validTo: null,
    createdAt: now,
    updatedAt: now,
  }).onConflictDoUpdate({
    target: entityRelations.id,
    set: {
      fromObjectId: input.fromObjectId,
      toObjectId: input.toObjectId,
      weight: input.weight ?? 1,
      confidence: input.confidence ?? 1,
      provenance: input.provenance ?? 'explicit',
      rationale: input.rationale ?? null,
      metadata,
      validTo: null,
      updatedAt: now,
    },
  });
  return id;
}

export async function getOrCreateKernelState(userId: string) {
  await ensureLivingKernelSchema();
  const existing = await db.select().from(glowKernelStates).where(eq(glowKernelStates.userId, userId)).limit(1);
  if (existing[0]) return existing[0];
  const currentRealityId = `current-reality:${new Date().toISOString()}`;
  const [created] = await db.insert(glowKernelStates).values({
    userId,
    schemaVersion: LIVING_KERNEL_SCHEMA_VERSION,
    currentRealityId,
    syncRevision: 0,
    updatedAt: new Date(),
  }).returning();
  return created;
}

export async function createKernelScenario(input: {
  userId: string;
  title: string;
  summary?: string;
  sourceRoute?: string;
  sourceText?: string;
  confidence?: number;
  kind?: string;
  changes?: Array<{ objectId?: string; actionType: string; patch?: Record<string, unknown>; rationale: string; expectedEffects?: string[] }>;
}) {
  const state = await getOrCreateKernelState(input.userId);
  const id = randomUUID();
  const now = new Date();
  await db.insert(glowScenarios).values({
    id, userId: input.userId, kind: input.kind ?? 'proposed-reality', title: input.title,
    summary: input.summary ?? null, basedOnRealityId: state.currentRealityId,
    sourceRoute: input.sourceRoute ?? null, sourceText: input.sourceText ?? null,
    status: 'draft', confidence: input.confidence ?? .5,
    assumptions: [], expectedEffects: [], createdAt: now,
  });
  if (input.changes?.length) {
    await db.insert(glowScenarioChanges).values(input.changes.map((change) => ({
      id: randomUUID(), userId: input.userId, scenarioId: id,
      objectId: change.objectId ?? null, actionType: change.actionType,
      patch: jsonSafe(change.patch ?? {}), rationale: change.rationale,
      expectedEffects: change.expectedEffects ?? [], createdAt: now,
    })));
  }
  await recordKernelEvent({ userId: input.userId, eventType: 'scenario.created', payload: { scenarioId: id, title: input.title }, source: 'simulation-engine' });
  return id;
}

export async function decideKernelScenario(userId: string, scenarioId: string, decision: 'accepted' | 'rejected') {
  await ensureLivingKernelSchema();
  const [scenario] = await db.select().from(glowScenarios).where(and(eq(glowScenarios.userId, userId), eq(glowScenarios.id, scenarioId))).limit(1);
  if (!scenario || scenario.status !== 'draft') return scenario ?? null;
  const now = new Date();
  const [updated] = await db.update(glowScenarios).set({ status: decision, decidedAt: now }).where(and(eq(glowScenarios.userId, userId), eq(glowScenarios.id, scenarioId))).returning();
  await recordKernelEvent({ userId, eventType: `scenario.${decision}`, payload: { scenarioId }, source: 'decision-engine' });
  return updated;
}

export async function recordKernelReceipt(input: {
  userId: string;
  scenarioId?: string | null;
  action: string;
  reasons?: string[];
  evidence?: string[];
  affectedObjectIds?: string[];
  affectedDomains?: string[];
  confidence?: number;
  executor: string;
  result: 'proposed' | 'completed' | 'failed' | 'unavailable';
  reversible?: boolean;
  undoRef?: string | null;
  details?: Record<string, unknown>;
}) {
  await ensureLivingKernelSchema();
  const id = randomUUID();
  const now = new Date();
  await db.insert(glowActionReceipts).values({
    id, userId: input.userId, scenarioId: input.scenarioId ?? null,
    action: input.action, reasons: input.reasons ?? [], evidence: input.evidence ?? [],
    affectedObjectIds: input.affectedObjectIds ?? [], affectedDomains: input.affectedDomains ?? [],
    confidence: input.confidence ?? 1, executor: input.executor, result: input.result,
    reversible: input.reversible ?? false, undoRef: input.undoRef ?? null,
    details: jsonSafe(input.details ?? {}), changedAt: now,
  });
  await recordKernelEvent({ userId: input.userId, eventType: `action.${input.result}`, relatedObjectIds: input.affectedObjectIds ?? [], payload: { receiptId: id, action: input.action, scenarioId: input.scenarioId ?? null }, source: input.executor, confidence: input.confidence ?? 1 });
  return id;
}

export async function recentKernelReceipts(userId: string, limit = 12) {
  await ensureLivingKernelSchema();
  return db.select().from(glowActionReceipts).where(eq(glowActionReceipts.userId, userId)).orderBy(desc(glowActionReceipts.changedAt)).limit(limit);
}
