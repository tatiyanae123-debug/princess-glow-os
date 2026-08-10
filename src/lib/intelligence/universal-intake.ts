import 'server-only';

import { db } from '@/db';
import { glowInboxItems } from '@/db/schema/adaptive-os';
import { glowEntities, universalIntakeArtifacts } from '@/db/schema/interconnected-os';

const MAX_STORED_FILE_BYTES = 3 * 1024 * 1024;

export type IntakeClassification = {
  type: string;
  title: string;
  confidence: number;
  destinations: string[];
  extracted: Record<string, unknown>;
};

function normalize(value: string) {
  return value.toLowerCase().replace(/\s+/g, ' ').trim();
}

export function classifyUniversalInput(input: { text?: string; filename?: string; mimeType?: string }): IntakeClassification {
  const text = normalize(`${input.filename ?? ''} ${input.text ?? ''}`);
  const mime = normalize(input.mimeType ?? '');
  const firstLine = (input.text ?? '').split(/\r?\n/).map((line) => line.trim()).find(Boolean);
  const title = firstLine?.slice(0, 120) || input.filename || 'Untitled intake';

  const rules: Array<{ match: boolean; type: string; confidence: number; destinations: string[] }> = [
    { match: /receipt|order total|subtotal|purchase|paid|invoice/.test(text), type: 'receipt', confidence: .92, destinations: ['finance', 'beauty', 'closet'] },
    { match: /appointment|dentist|doctor|salon|interview|reservation/.test(text), type: 'appointment', confidence: .9, destinations: ['calendar', 'tasks', 'timeline'] },
    { match: /schedule|shift|roster|class schedule|work schedule/.test(text), type: 'schedule', confidence: .9, destinations: ['calendar', 'today', 'planning'] },
    { match: /remind|remember to|don't forget|do not forget/.test(text), type: 'reminder', confidence: .88, destinations: ['tasks', 'today'] },
    { match: /todo|to-do|need to|call |email |buy |pick up|research |submit /.test(text), type: 'task', confidence: .84, destinations: ['tasks', 'today'] },
    { match: /goal|by the end of|target|save \$|want to reach/.test(text), type: 'goal', confidence: .82, destinations: ['goals', 'planning'] },
    { match: /project|prototype|milestone|vendor|manufacturer|creative brief/.test(text), type: 'project', confidence: .8, destinations: ['projects', 'tasks', 'memory'] },
    { match: /skincare|serum|retinol|tretinoin|makeup|sephora|beauty/.test(text), type: 'beauty', confidence: .84, destinations: ['beauty', 'beauty-lab', 'finance'] },
    { match: /hair|wash day|scalp|braid|silk press|salon/.test(text), type: 'hair', confidence: .84, destinations: ['hair', 'beauty', 'calendar'] },
    { match: /workout|gym|exercise|run|pilates|strength|cardio/.test(text), type: 'fitness', confidence: .84, destinations: ['fitness', 'today', 'habits'] },
    { match: /resume|cv|application|interview|job|career/.test(text), type: 'career', confidence: .8, destinations: ['projects', 'tasks', 'calendar'] },
    { match: /flight|hotel|trip|travel|boarding|airbnb/.test(text), type: 'travel', confidence: .82, destinations: ['calendar', 'world', 'tasks'] },
    { match: mime.startsWith('image/'), type: 'image', confidence: .62, destinations: ['notes', 'memory'] },
    { match: mime.includes('pdf'), type: 'document', confidence: .66, destinations: ['notes', 'memory'] },
  ];

  const matched = rules.find((rule) => rule.match) ?? { type: 'note', confidence: .58, destinations: ['notes', 'inbox'] };
  const extracted: Record<string, unknown> = { filename: input.filename ?? null, mimeType: input.mimeType ?? null };
  const money = text.match(/\$\s?([0-9]+(?:\.[0-9]{2})?)/);
  if (money) extracted.amount = Number(money[1]);
  const date = text.match(/\b(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{1,2}(?:,\s*\d{4})?\b/i);
  if (date) extracted.dateText = date[0];
  const time = text.match(/\b(?:1[0-2]|0?[1-9]):[0-5][0-9]\s?(?:am|pm)?\b/i);
  if (time) extracted.timeText = time[0];

  return { type: matched.type, title, confidence: matched.confidence, destinations: matched.destinations, extracted };
}

export async function ingestText(userId: string, rawText: string) {
  const classification = classifyUniversalInput({ text: rawText });
  const [inbox] = await db.insert(glowInboxItems).values({
    userId,
    rawText,
    source: 'universal_intake',
    suggestedType: classification.type,
    suggestedTitle: classification.title,
    confidence: classification.confidence,
    metadata: { destinations: classification.destinations, extracted: classification.extracted },
  }).returning();
  const [artifact] = await db.insert(universalIntakeArtifacts).values({
    userId,
    inboxItemId: inbox.id,
    kind: 'text',
    sourceText: rawText,
    detectedType: classification.type,
    detectedTitle: classification.title,
    extracted: classification.extracted,
    proposedDestinations: classification.destinations,
    confidence: classification.confidence,
  }).returning();
  await db.insert(glowEntities).values({
    userId,
    entityType: 'intake_artifact',
    sourceTable: 'universal_intake_artifacts',
    sourceId: artifact.id,
    title: classification.title,
    summary: rawText.slice(0, 500),
    searchableText: rawText,
    metadata: { detectedType: classification.type, destinations: classification.destinations },
  }).onConflictDoNothing();
  return { inbox, artifact, classification };
}

export async function ingestFile(userId: string, file: File, note = '') {
  if (!file.size) throw new Error('The selected file is empty.');
  if (file.size > MAX_STORED_FILE_BYTES) throw new Error('For now, upload files smaller than 3 MB so Glow can safely store and analyze them in one request.');
  const bytes = Buffer.from(await file.arrayBuffer());
  const textLike = file.type.startsWith('text/') || /\.(txt|csv|json|md)$/i.test(file.name);
  const extractedText = textLike ? bytes.toString('utf8').slice(0, 120000) : '';
  const combinedText = [note, extractedText].filter(Boolean).join('\n');
  const classification = classifyUniversalInput({ text: combinedText, filename: file.name, mimeType: file.type });
  const dataUrl = `data:${file.type || 'application/octet-stream'};base64,${bytes.toString('base64')}`;
  const rawText = combinedText || `${file.name} (${file.type || 'file'})`;
  const [inbox] = await db.insert(glowInboxItems).values({
    userId,
    rawText,
    source: 'file_upload',
    suggestedType: classification.type,
    suggestedTitle: classification.title,
    confidence: classification.confidence,
    metadata: { filename: file.name, mimeType: file.type, sizeBytes: file.size, destinations: classification.destinations, extracted: classification.extracted },
  }).returning();
  const [artifact] = await db.insert(universalIntakeArtifacts).values({
    userId,
    inboxItemId: inbox.id,
    kind: file.type.startsWith('image/') ? 'image' : file.type.includes('pdf') ? 'pdf' : 'file',
    originalName: file.name,
    mimeType: file.type || null,
    sizeBytes: file.size,
    sourceText: extractedText || note || null,
    contentDataUrl: dataUrl,
    detectedType: classification.type,
    detectedTitle: classification.title,
    extracted: classification.extracted,
    proposedDestinations: classification.destinations,
    confidence: classification.confidence,
    analysisStatus: textLike ? 'analyzed' : 'stored_for_deeper_analysis',
  }).returning();
  await db.insert(glowEntities).values({
    userId,
    entityType: 'intake_artifact',
    sourceTable: 'universal_intake_artifacts',
    sourceId: artifact.id,
    title: classification.title,
    summary: rawText.slice(0, 500),
    searchableText: `${file.name} ${combinedText}`.trim(),
    metadata: { detectedType: classification.type, destinations: classification.destinations, mimeType: file.type },
  }).onConflictDoNothing();
  return { inbox, artifact, classification };
}
