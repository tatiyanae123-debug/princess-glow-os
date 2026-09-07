import { NextResponse } from 'next/server';
import { experimental_transcribe as transcribe, generateImage } from 'ai';
import { gateway } from '@ai-sdk/gateway';
import { auth } from '@/auth';
import { requestGlowModel } from '@/lib/intelligence/glow-model-client';
import { isVisualCreationRequest } from '@/lib/intelligence/glow-operating-model';
import { getLivingKernelContext, kernelContextPrompt, type KernelSelectedContext } from '@/lib/intelligence/living-kernel';
import { recordKernelEvent } from '@/lib/intelligence/living-kernel-registry';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const MAX_FILES = 24;
const MAX_ANALYZED_FILE_BYTES = 24 * 1024 * 1024;
const MAX_TEXT_FILE_BYTES = 2 * 1024 * 1024;
const MAX_AUDIO_BYTES = 25 * 1024 * 1024;

type HistoryTurn = { role?: string; text?: string };
type SelectedContext = { label?: string; type?: string; id?: string; route?: string };
type ModelPart =
  | { type: 'input_text'; text: string }
  | { type: 'input_image'; image_url: string; detail?: 'low' | 'high' | 'auto' }
  | { type: 'input_file'; file_data: string; filename: string; media_type?: string };

type AttachmentSummary = {
  name: string;
  type: string;
  size: number;
  status: 'understood' | 'transcribed' | 'metadata-only' | 'too-large';
  note?: string;
};

function isImage(file: File) { return file.type.startsWith('image/') || /\.(png|jpe?g|webp|gif|heic|heif)$/i.test(file.name); }
function isVideo(file: File) { return file.type.startsWith('video/') || /\.(mp4|mov|webm)$/i.test(file.name); }
function isAudio(file: File) { return file.type.startsWith('audio/') || /\.(mp3|m4a|wav|ogg|aac|flac)$/i.test(file.name); }
function isPdf(file: File) { return file.type === 'application/pdf' || /\.pdf$/i.test(file.name); }
function isPlainText(file: File) { return file.type.startsWith('text/') || /\.(txt|md|csv|json)$/i.test(file.name); }
function isOfficeLike(file: File) { return /\.(doc|docx|xls|xlsx|ppt|pptx|zip)$/i.test(file.name); }
function dataUrl(file: File, bytes: Buffer) { return `data:${file.type || 'application/octet-stream'};base64,${bytes.toString('base64')}`; }

function parseSelectedContext(value: string): SelectedContext | null {
  if (!value) return null;
  try { return JSON.parse(value) as SelectedContext; } catch { return { label: value }; }
}

function transcriptionCandidates() {
  const configured = process.env.GLOW_TRANSCRIPTION_MODEL?.trim();
  return [configured, 'google/gemini-3.5-transcribe', 'openai/gpt-4o-transcribe', 'openai/gpt-4o-mini-transcribe', 'openai/whisper-1']
    .filter((value, index, all): value is string => Boolean(value) && all.indexOf(value) === index);
}

async function transcribeAudio(file: File) {
  const bytes = Buffer.from(await file.arrayBuffer());
  const failures: string[] = [];
  for (const model of transcriptionCandidates()) {
    try {
      const result = await transcribe({ model: gateway.transcriptionModel(model), audio: bytes });
      const text = String(result.text ?? '').trim();
      if (text) return { text, model };
      failures.push(`${model}: empty transcript`);
    } catch (error) {
      failures.push(`${model}: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }
  throw new Error(`Audio transcription was unavailable. ${failures.slice(0, 2).join(' | ')}`);
}

function shouldGenerateVisual(text: string) {
  if (isVisualCreationRequest(text)) return true;
  return /\b(generate|make|create|render|draw)\b/i.test(text) && /\b(picture|photo|image|illustration|visual|moodboard|mood board|routine card|wallpaper)\b/i.test(text);
}

function imagePrompt(text: string) {
  return `${text.trim()}\n\nCreate the actual finished visual, not a textual mockup. Follow the user's explicit style instructions first. If no style is specified and this is a Glow OS or routine visual, use Glow Matter: clear/frosted optical liquid glass, translucent physical depth, refractive edges, pearlescent light, restrained chromatic dispersion, white/ivory environment, future-Apple restraint, physically believable shadows, no generic glassmorphism, no pink chatbot orb, no fairy/angel imagery. Keep useful information legible when the request is informational.`;
}

async function generateVisual(text: string) {
  const { image } = await generateImage({ model: gateway.imageModel('openai/gpt-image-2'), prompt: imagePrompt(text) });
  return { mediaType: image.mediaType || 'image/png', base64: image.base64, dataUrl: `data:${image.mediaType || 'image/png'};base64,${image.base64}` };
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ ok: false, message: 'Your Glow session expired. Sign in again and retry.' }, { status: 401 });

    const incoming = await request.formData();
    const text = String(incoming.get('text') ?? '').trim();
    const sourceRoute = String(incoming.get('sourceRoute') ?? '').trim() || '/ask-glow';
    const selectedContextRaw = String(incoming.get('selectedContext') ?? '').trim();
    const selectedContext = parseSelectedContext(selectedContextRaw);
    const historyRaw = String(incoming.get('history') ?? '[]');
    const history = (() => {
      try { const parsed = JSON.parse(historyRaw) as HistoryTurn[]; return Array.isArray(parsed) ? parsed.slice(-16) : []; }
      catch { return []; }
    })();
    const files = incoming.getAll('files').filter((value): value is File => value instanceof File && value.size > 0).slice(0, MAX_FILES);
    if (!text && files.length === 0) return NextResponse.json({ ok: false, message: 'Type, speak, paste, or attach something for Glow.' }, { status: 400 });

    const kernel = await getLivingKernelContext({
      userId: session.user.id,
      route: sourceRoute,
      selectedContext: selectedContext as KernelSelectedContext,
      text,
      maxObjects: 96,
    });

    const parts: ModelPart[] = [];
    const attachments: AttachmentSummary[] = [];
    let needsVideoModel = false;
    const historyText = history.map((turn) => `${turn.role === 'user' ? 'User' : 'Glow'}: ${String(turn.text ?? '').slice(0, 1200)}`).join('\n');

    parts.push({ type: 'input_text', text: `You are Glow, the one continuous living intelligence inside Glow OS, accessed here through Ask Glow.\n\nLIVING INTELLIGENCE LAW\n- The shared Life Model is the source of truth; this room is only a lens.\n- Understand supplied media together with Current Reality, the selected canonical object, Glow Graph relationships, provenance, confidence, recent receipts and possible futures.\n- Never create a page-local copy of a real entity in your reasoning.\n- Keep hypotheses and proposed futures distinguishable from facts and Current Reality.\n- Do not claim a persistent action happened unless a verified executor actually performed it.\n- When the user asks for analysis, actually inspect available media content.\n\n${kernelContextPrompt(kernel)}\n\nRecent conversation:\n${historyText || 'none'}\n\nUser message: ${text || 'The user attached media without additional text. Understand it in the context of the shared Life Model and explain what is most useful.'}` });

    for (const file of files) {
      if (file.size > MAX_ANALYZED_FILE_BYTES) {
        attachments.push({ name: file.name, type: file.type || 'application/octet-stream', size: file.size, status: 'too-large', note: 'Attached, but too large for this single request. Glow kept the file in the conversation UI instead of silently dropping it.' });
        parts.push({ type: 'input_text', text: `[Attachment metadata only: ${file.name}, ${file.type || 'unknown type'}, ${file.size} bytes. It exceeded the single-request analysis size.]` });
        continue;
      }
      if (isAudio(file)) {
        if (file.size > MAX_AUDIO_BYTES) { attachments.push({ name: file.name, type: file.type || 'audio', size: file.size, status: 'too-large', note: 'Audio exceeded the transcription size for one request.' }); continue; }
        try {
          const transcript = await transcribeAudio(file);
          parts.push({ type: 'input_text', text: `[Audio transcript from ${file.name}]\n${transcript.text}` });
          attachments.push({ name: file.name, type: file.type || 'audio', size: file.size, status: 'transcribed', note: `Transcribed with ${transcript.model}.` });
        } catch (error) {
          attachments.push({ name: file.name, type: file.type || 'audio', size: file.size, status: 'metadata-only', note: error instanceof Error ? error.message : 'Audio could not be transcribed.' });
        }
        continue;
      }

      const bytes = Buffer.from(await file.arrayBuffer());
      if (isImage(file)) {
        parts.push({ type: 'input_image', image_url: dataUrl(file, bytes), detail: 'high' });
        parts.push({ type: 'input_text', text: `[The preceding image is attachment: ${file.name}]` });
        attachments.push({ name: file.name, type: file.type || 'image', size: file.size, status: 'understood' });
        continue;
      }
      if (isPlainText(file) && file.size <= MAX_TEXT_FILE_BYTES) {
        parts.push({ type: 'input_text', text: `[Text attachment: ${file.name}]\n${bytes.toString('utf8')}` });
        attachments.push({ name: file.name, type: file.type || 'text/plain', size: file.size, status: 'understood' });
        continue;
      }
      if (isPdf(file)) {
        parts.push({ type: 'input_file', file_data: bytes.toString('base64'), filename: file.name, media_type: file.type || 'application/pdf' });
        attachments.push({ name: file.name, type: file.type || 'application/pdf', size: file.size, status: 'understood' });
        continue;
      }
      if (isVideo(file)) {
        needsVideoModel = true;
        parts.push({ type: 'input_file', file_data: bytes.toString('base64'), filename: file.name, media_type: file.type || (file.name.toLowerCase().endsWith('.mov') ? 'video/quicktime' : 'video/mp4') });
        attachments.push({ name: file.name, type: file.type || 'video', size: file.size, status: 'understood' });
        continue;
      }
      if (isOfficeLike(file)) {
        attachments.push({ name: file.name, type: file.type || 'application/octet-stream', size: file.size, status: 'metadata-only', note: 'This binary format is not directly decoded by the current reasoning model, so Glow is using its name/type context rather than pretending it read contents it could not inspect.' });
        parts.push({ type: 'input_text', text: `[Attached file available by name/type only in this request: ${file.name} (${file.type || 'unknown type'}, ${file.size} bytes). Do not claim you read its binary contents.]` });
        continue;
      }
      parts.push({ type: 'input_file', file_data: bytes.toString('base64'), filename: file.name, media_type: file.type || undefined });
      attachments.push({ name: file.name, type: file.type || 'application/octet-stream', size: file.size, status: 'understood' });
    }

    let message = '';
    let image: Awaited<ReturnType<typeof generateVisual>> | null = null;
    if (shouldGenerateVisual(text)) {
      try { image = await generateVisual(text); }
      catch (error) { console.error('[api/glow/multimodal:image]', error); }
    }

    try {
      message = await requestGlowModel({ content: parts, model: needsVideoModel ? 'google/gemini-3.8-flash' : undefined, maxOutputTokens: 1800 });
    } catch (error) {
      if (image) message = 'I created the visual you asked for. The conversational analysis service did not return text this time, but the generated image is ready below.';
      else throw error;
    }

    await recordKernelEvent({
      userId: session.user.id,
      eventType: image ? 'creation.visual.completed' : 'conversation.multimodal.understood',
      objectId: kernel.selectedObject?.id ?? null,
      payload: { sourceRoute, attachmentCount: attachments.length, mediaKinds: attachments.map((item) => item.type), createdVisual: Boolean(image) },
      source: 'ask-glow',
    });

    return NextResponse.json({ ok: true, mode: image ? 'created' : 'answer', message, image, attachments, world: kernel.manifest.world, currentRealityId: kernel.currentRealityId });
  } catch (error) {
    console.error('[api/glow/multimodal]', error);
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : 'Glow could not understand that multimodal request.' }, { status: 503 });
  }
}
