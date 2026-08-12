import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { ingestFile, ingestText } from '@/lib/intelligence/universal-intake';
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
        message: `${file.name} was uploaded and understood by Glow.`,
        uploadedName: file.name,
        classification: result.classification,
      });
    }

    const result = await ingestText(session.user.id, text, { sourceRoute });
    return NextResponse.json({
      ok: true,
      message: 'Glow understood your text and added it to Glow Inbox.',
      classification: result.classification,
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Unknown intake error';
    console.error('[api/intake]', detail);
    return NextResponse.json({ ok: false, message: `Glow could not save this yet. ${detail}` }, { status: 500 });
  }
}
