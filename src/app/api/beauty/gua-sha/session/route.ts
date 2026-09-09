import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { db } from '@/db';
import { auditEvents, lifeTimelineEvents } from '@/db/schema/completion-v1';

const bodySchema = z.object({
  view: z.enum(['guided', 'morning', 'midday', 'night']),
  routine: z.string().min(1).max(120),
  durationMinutes: z.number().int().min(1).max(120),
  pressure: z.enum(['Light', 'Medium', 'Firm']).default('Light'),
  toolName: z.string().max(160).nullable().optional(),
  slipProduct: z.string().max(200).nullable().optional(),
  careMode: z.enum(['quick', 'normal', 'low', 'event']).optional(),
  concerns: z.array(z.string().max(80)).max(20).default([]),
  completedAt: z.string().datetime().optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ ok: false, reason: 'not_signed_in' }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, reason: 'invalid_payload' }, { status: 400 });

  const input = parsed.data;
  const occurredAt = input.completedAt ? new Date(input.completedAt) : new Date();
  const details = {
    world: 'Beauty',
    room: 'Gua Sha Studio',
    view: input.view,
    routine: input.routine,
    durationMinutes: input.durationMinutes,
    pressure: input.pressure,
    toolName: input.toolName ?? null,
    slipProduct: input.slipProduct ?? null,
    careMode: input.careMode ?? null,
    concerns: input.concerns,
    completedAt: occurredAt.toISOString(),
  };

  const [audit] = await db.insert(auditEvents).values({
    userId: session.user.id,
    action: 'gua_sha_session_completed',
    entityType: 'gua_sha_session',
    details,
  }).returning({ id: auditEvents.id });

  const summaryParts = [
    `${input.durationMinutes} min`,
    input.pressure,
    input.toolName || 'Hands / tool not recorded',
    input.slipProduct || null,
  ].filter((part): part is string => Boolean(part));

  const [timeline] = await db.insert(lifeTimelineEvents).values({
    userId: session.user.id,
    category: 'gua_sha_session',
    title: input.routine,
    occurredAt,
    summary: summaryParts.join(' · '),
    relatedEntityType: 'audit_event',
    relatedEntityId: audit?.id ?? null,
  }).returning({ id: lifeTimelineEvents.id });

  return NextResponse.json({ ok: true, id: timeline?.id ?? audit?.id ?? null });
}
