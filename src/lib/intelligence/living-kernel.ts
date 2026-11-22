import 'server-only';

import { and, desc, eq, isNull, or } from 'drizzle-orm';
import { db } from '@/db';
import { entityRelations } from '@/db/schema/adaptive-os';
import { glowEntities } from '@/db/schema/interconnected-os';
import { glowActionReceipts, glowKernelEvents, glowLearnings, glowScenarios } from '@/db/schema/living-kernel';
import { glowRoomManifestForRoute } from '@/lib/intelligence/room-manifest';
import { getOrCreateKernelState } from '@/lib/intelligence/living-kernel-registry';
import { syncLivingLifeModel } from '@/lib/intelligence/living-kernel-sync';

export type KernelSelectedContext = { label?: string; type?: string; id?: string; route?: string } | null;

export type GlowKernelContext = {
  generatedAt: string;
  currentRealityId: string;
  syncRevision: number;
  route: string;
  manifest: ReturnType<typeof glowRoomManifestForRoute>;
  selectedObject: null | {
    id: string;
    domain: string;
    title: string;
    state: string;
    confidence: number;
    provenance: Record<string, unknown>;
    timing: Record<string, unknown>;
    metadata: Record<string, unknown>;
  };
  objects: Array<{
    id: string;
    domain: string;
    title: string;
    summary: string | null;
    state: string;
    version: number;
    confidence: number;
    provenance: Record<string, unknown>;
    timing: Record<string, unknown>;
    dependencies: string[];
    constraints: string[];
    triggers: string[];
    availableActions: string[];
    resources: string[];
    crossDomainEffects: string[];
    completionStage: string | null;
    metadata: Record<string, unknown>;
  }>;
  relationships: Array<{
    id: string;
    fromObjectId: string | null;
    relation: string;
    toObjectId: string | null;
    confidence: number;
    provenance: string;
    rationale: string | null;
  }>;
  scenarios: Array<{ id: string; kind: string; title: string; status: string; confidence: number; summary: string | null; createdAt: string }>;
  receipts: Array<{ id: string; action: string; result: string; executor: string; affectedObjectIds: string[]; affectedDomains: string[]; changedAt: string }>;
  learnings: Array<{ id: string; learningType: string; domain: string; statement: string; confidence: number; status: string }>;
  events: Array<{ id: string; eventType: string; objectId: string | null; source: string; occurredAt: string }>;
};

function terms(text: string) {
  return text.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 2).slice(0, 24);
}

function scoreObject(row: typeof glowEntities.$inferSelect, domains: string[], queryTerms: string[], selected: KernelSelectedContext) {
  let score = 0;
  if (domains.includes(row.entityType)) score += 20;
  if (selected?.id && (row.sourceId === selected.id || row.canonicalKey === selected.id)) score += 100;
  if (selected?.type && row.entityType === selected.type) score += 25;
  if (selected?.label && row.title.toLowerCase().includes(selected.label.toLowerCase())) score += 35;
  const haystack = `${row.title} ${row.summary ?? ''} ${row.searchableText ?? ''}`.toLowerCase();
  for (const term of queryTerms) if (haystack.includes(term)) score += 4;
  const timing = row.timing as Record<string, unknown>;
  const when = timing.startAt ?? timing.dueAt ?? timing.targetDate ?? timing.occurredAt;
  if (when) {
    const timestamp = Date.parse(String(when));
    if (Number.isFinite(timestamp)) {
      const distance = Math.abs(timestamp - Date.now());
      if (distance < 24 * 60 * 60 * 1000) score += 18;
      else if (distance < 7 * 24 * 60 * 60 * 1000) score += 8;
    }
  }
  if (row.status === 'active' || row.state === 'active' || row.state === 'scheduled' || row.state === 'open') score += 4;
  score += Math.round((row.importance ?? .5) * 5);
  return score;
}

function asObject(row: typeof glowEntities.$inferSelect) {
  return {
    id: row.canonicalKey ?? `${row.entityType}:${row.sourceId ?? row.id}`,
    domain: row.entityType,
    title: row.title,
    summary: row.summary,
    state: row.state,
    version: row.version,
    confidence: row.confidence,
    provenance: row.provenance as Record<string, unknown>,
    timing: row.timing as Record<string, unknown>,
    dependencies: row.dependencies as string[],
    constraints: row.constraints as string[],
    triggers: row.triggers as string[],
    availableActions: row.availableActions as string[],
    resources: row.resources as string[],
    crossDomainEffects: row.crossDomainEffects as string[],
    completionStage: row.completionStage,
    metadata: row.metadata as Record<string, unknown>,
  };
}

export async function initializeLivingKernel(userId: string, options: { forceSync?: boolean; reason?: string } = {}) {
  await syncLivingLifeModel(userId, { force: options.forceSync, reason: options.reason ?? 'Kernel initialization' });
  return getOrCreateKernelState(userId);
}

export async function getLivingKernelContext(input: {
  userId: string;
  route: string;
  selectedContext?: KernelSelectedContext;
  text?: string;
  forceSync?: boolean;
  maxObjects?: number;
}): Promise<GlowKernelContext> {
  const route = input.route || '/today';
  await syncLivingLifeModel(input.userId, { force: input.forceSync, reason: `Context projection for ${route}` });
  const state = await getOrCreateKernelState(input.userId);
  const manifest = glowRoomManifestForRoute(route);
  const queryTerms = terms(`${input.text ?? ''} ${input.selectedContext?.label ?? ''}`);

  const [allObjects, edgeRows, scenarioRows, receiptRows, learningRows, eventRows] = await Promise.all([
    db.select().from(glowEntities).where(and(eq(glowEntities.userId, input.userId), or(eq(glowEntities.status, 'active'), eq(glowEntities.status, 'recorded'), eq(glowEntities.status, 'historical'), eq(glowEntities.status, 'remembered'), eq(glowEntities.status, 'scheduled'), eq(glowEntities.status, 'open')))).orderBy(desc(glowEntities.updatedAt)).limit(500),
    db.select().from(entityRelations).where(and(eq(entityRelations.userId, input.userId), isNull(entityRelations.validTo))).orderBy(desc(entityRelations.updatedAt)).limit(320),
    db.select().from(glowScenarios).where(eq(glowScenarios.userId, input.userId)).orderBy(desc(glowScenarios.createdAt)).limit(12),
    db.select().from(glowActionReceipts).where(eq(glowActionReceipts.userId, input.userId)).orderBy(desc(glowActionReceipts.changedAt)).limit(12),
    db.select().from(glowLearnings).where(eq(glowLearnings.userId, input.userId)).orderBy(desc(glowLearnings.updatedAt)).limit(16),
    db.select().from(glowKernelEvents).where(eq(glowKernelEvents.userId, input.userId)).orderBy(desc(glowKernelEvents.occurredAt)).limit(24),
  ]);

  const selectedRow = input.selectedContext
    ? allObjects.find((row) => (input.selectedContext?.id && (row.sourceId === input.selectedContext.id || row.canonicalKey === input.selectedContext.id))
      || (input.selectedContext?.label && row.title.toLowerCase() === input.selectedContext.label.toLowerCase())) ?? null
    : null;

  const maxObjects = Math.max(24, Math.min(input.maxObjects ?? 90, 160));
  const ranked = allObjects
    .map((row) => ({ row, score: scoreObject(row, manifest.objectDomains, queryTerms, input.selectedContext ?? null) }))
    .sort((a, b) => b.score - a.score || b.row.updatedAt.getTime() - a.row.updatedAt.getTime())
    .slice(0, maxObjects)
    .map(({ row }) => asObject(row));
  const objectIds = new Set(ranked.map((row) => row.id));
  if (selectedRow) objectIds.add(selectedRow.canonicalKey ?? `${selectedRow.entityType}:${selectedRow.sourceId ?? selectedRow.id}`);

  const relevantEdges = edgeRows
    .filter((edge) => !edge.fromObjectId || !edge.toObjectId || objectIds.has(edge.fromObjectId) || objectIds.has(edge.toObjectId))
    .slice(0, 140)
    .map((edge) => ({
      id: edge.id,
      fromObjectId: edge.fromObjectId,
      relation: edge.relation,
      toObjectId: edge.toObjectId,
      confidence: edge.confidence,
      provenance: edge.provenance,
      rationale: edge.rationale,
    }));

  return {
    generatedAt: new Date().toISOString(),
    currentRealityId: state.currentRealityId,
    syncRevision: state.syncRevision,
    route,
    manifest,
    selectedObject: selectedRow ? {
      id: selectedRow.canonicalKey ?? `${selectedRow.entityType}:${selectedRow.sourceId ?? selectedRow.id}`,
      domain: selectedRow.entityType,
      title: selectedRow.title,
      state: selectedRow.state,
      confidence: selectedRow.confidence,
      provenance: selectedRow.provenance as Record<string, unknown>,
      timing: selectedRow.timing as Record<string, unknown>,
      metadata: selectedRow.metadata as Record<string, unknown>,
    } : null,
    objects: ranked,
    relationships: relevantEdges,
    scenarios: scenarioRows.map((row) => ({ id: row.id, kind: row.kind, title: row.title, status: row.status, confidence: row.confidence, summary: row.summary, createdAt: row.createdAt.toISOString() })),
    receipts: receiptRows.map((row) => ({ id: row.id, action: row.action, result: row.result, executor: row.executor, affectedObjectIds: row.affectedObjectIds as string[], affectedDomains: row.affectedDomains as string[], changedAt: row.changedAt.toISOString() })),
    learnings: learningRows.map((row) => ({ id: row.id, learningType: row.learningType, domain: row.domain, statement: row.statement, confidence: row.confidence, status: row.status })),
    events: eventRows.map((row) => ({ id: row.id, eventType: row.eventType, objectId: row.objectId, source: row.source, occurredAt: row.occurredAt.toISOString() })),
  };
}

export function kernelContextPrompt(context: GlowKernelContext) {
  return `CURRENT GLOW LIFE MODEL\nCurrent Reality: ${context.currentRealityId}\nRoom lens: ${context.manifest.lens}\nRoom world: ${context.manifest.world}\nSelected canonical object: ${JSON.stringify(context.selectedObject)}\nRelevant canonical objects: ${JSON.stringify(context.objects)}\nRelevant Glow Graph relationships: ${JSON.stringify(context.relationships)}\nRecent possible futures: ${JSON.stringify(context.scenarios)}\nRecent truthful receipts: ${JSON.stringify(context.receipts)}\nCurrent learnings: ${JSON.stringify(context.learnings)}\nRecent kernel events: ${JSON.stringify(context.events)}\n\nTreat these as projections of one shared Life Model. Never invent a separate page-local copy. Distinguish Current Reality from draft/proposed scenarios, preserve provenance and confidence, and explain cross-domain effects when they matter.`;
}
