import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { ingestFile, ingestText } from '@/lib/intelligence/universal-intake';
import { routeInboxItem } from '@/lib/intelligence/inbox-routing';
import { ensureGlowIntelligenceSchema } from '@/app/actions/intelligence-activation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, message: 'Your Glow session expired. Sign in again and retry.' }, { status: 401 });
    }

    const formData = await request.formData();
    const text = String(formData.get('text') ?? '').trim();
    const note = String(formData.get('note') ?? '').trim();
    const sourceRoute = String(formData.get('sourceRoute') ?? '').trim() || undefined;
    const value = formData.get('file');
    const file = value instanceof File && value.size > 0 ? value : null;

    if (!file && !text) {
      return NextResponse.json({ ok: false, message: 'Choose a file or type something before sending it to Glow.' }, { status: 400 });
    }

    await ensureGlowIntelligenceSchema();

    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        return NextResponse.json({ ok: false, message: 'That file is larger than 3 MB. Choose a smaller file.' }, { status: 413 });
      }
      const result = await ingestFile(session.user.id, file, note || text, { sourceRoute });
      return NextResponse.json({
        ok: true,
        message: `${file.name} was uploaded and understood by Glow. Review its proposed destination in Glow Inbox before the file changes another room.`,
        uploadedName: file.name,
        classification: result.classification,
        routed: false,
      });
    }

    const result = await ingestText(session.user.id, text, { sourceRoute });
    const routed = await routeInboxItem(session.user.id, result.inbox.id);
    if (routed.ok) {
      return NextResponse.json({
        ok: true,
        message: `Glow understood this and placed it in ${routed.routedEntityType.replace(/_/g, ' ')}.`,
        classification: result.classification,
        routed: true,
        routedEntityType: routed.routedEntityType,
        routedEntityId: routed.routedEntityId,
      });
    }

    const missing = routed.reason === 'calendar_needs_date'
      ? 'a date or time'
      : routed.reason === 'finance_needs_amount'
        ? 'an amount'
        : 'one more detail';
    return NextResponse.json({
      ok: true,
      message: `Glow understood this and kept it in Inbox because it needs ${missing} before it can be placed safely.`,
      classification: result.classification,
      routed: false,
      routeReason: routed.reason,
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Unknown intake error';
    console.error('[api/intake]', detail);
    return NextResponse.json({ ok: false, message: `Glow could not save this yet. ${detail}` }, { status: 500 });
  }
}
