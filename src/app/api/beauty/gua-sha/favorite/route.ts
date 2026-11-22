import { NextResponse } from 'next/server';
import { z } from 'zod';
import { and, eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { db } from '@/db';
import { lifeMemories } from '@/db/schema/intelligence-expansion';

const bodySchema = z.object({
  slug: z.string().min(1).max(80).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1).max(120),
  favorite: z.boolean(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ ok: false, reason: 'not_signed_in' }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, reason: 'invalid_payload' }, { status: 400 });

  const source = `gua-sha-routine:${parsed.data.slug}`;
  const existing = await db.select({ id: lifeMemories.id })
    .from(lifeMemories)
    .where(and(eq(lifeMemories.userId, session.user.id), eq(lifeMemories.source, source)))
    .limit(1);

  if (existing[0]) {
    await db.update(lifeMemories)
      .set({
        title: parsed.data.title,
        pinned: parsed.data.favorite,
        archived: false,
        confidence: 1,
      })
      .where(and(eq(lifeMemories.id, existing[0].id), eq(lifeMemories.userId, session.user.id)));
  } else if (parsed.data.favorite) {
    await db.insert(lifeMemories).values({
      userId: session.user.id,
      category: 'gua_sha_routine_favorite',
      source,
      title: parsed.data.title,
      summary: 'Saved from Gua Sha Studio Routine Library.',
      relatedArea: 'Beauty · Gua Sha Studio',
      confidence: 1,
      privacyLevel: 'private',
      pinned: true,
      archived: false,
    });
  }

  return NextResponse.json({ ok: true, favorite: parsed.data.favorite });
}
