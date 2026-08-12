import 'server-only';

import { db } from '@/db';
import { glowInboxItems } from '@/db/schema/adaptive-os';
import { glowEntities, universalIntakeArtifacts } from '@/db/schema/interconnected-os';
import { analyzeUniversalInputWithAI } from '@/lib/intelligence/ai-intake';

const MAX_STORED_FILE_BYTES = 3 * 1024 * 1024;

export type IntakeClassification = {
  type: string;
  title: string;
  confidence: number;
  destinations: string[];
  extracted: Record<string, unknown>;
};

type IntakeContext = { sourceRoute?: string };

function normalize(value: string) { return value.toLowerCase().replace(/\s+/g, ' ').trim(); }

export function classifyUniversalInput(input: { text?: string; filename?: string; mimeType?: string }): IntakeClassification {
  const text = normalize(`${input.filename ?? ''} ${input.text ?? ''}`);
  const mime = normalize(input.mimeType ?? '');
  const filename = normalize(input.filename ?? '');
  const firstLine = (input.text ?? '').split(/\r?\n/).map((line) => line.trim()).find(Boolean);
  const title = firstLine?.slice(0, 120) || input.filename || 'Untitled intake';

  const isSpreadsheet = /\.(csv|xls|xlsx|numbers)$/i.test(filename) || /spreadsheet|excel|csv|sheet/.test(mime);
  const isDocument = /\.(doc|docx|rtf|pages)$/i.test(filename) || /word|document|rtf/.test(mime);
  const isPdf = /\.pdf$/i.test(filename) || mime.includes('pdf');
  const isImage = /\.(png|jpe?g|gif|webp|heic|heif)$/i.test(filename) || mime.startsWith('image/');
  const hasLink = /https?:\/\/[^\s]+/i.test(input.text ?? '');

  const rules: Array<{ match: boolean; type: string; confidence: number; destinations: string[] }> = [
    { match: isSpreadsheet, type: 'spreadsheet', confidence: .94, destinations: ['planning', 'finance', 'projects', 'notes'] },
    { match: isPdf, type: 'document', confidence: .92, destinations: ['notes', 'memory', 'projects'] },
    { match: isDocument, type: 'document', confidence: .9, destinations: ['notes', 'memory', 'projects'] },
    { match: /recipe|ingredients|meal prep|breakfast|lunch|dinner|snack|grocery|groceries|pantry|fridge|food|leftovers/.test(text), type: 'food', confidence: .91, destinations: ['food', 'planning', 'home', 'finance'] },
    { match: /dress|shirt|blouse|pants|jeans|skirt|shoes|heels|sneakers|bag|outfit|wardrobe|closet|jacket|coat|laundry/.test(text), type: 'clothing', confidence: .89, destinations: ['closet', 'finance', 'calendar', 'home'] },
    { match: /medication|medicine|prescription|supplement|vitamin|dose|tablet|capsule|refill|pharmacy/.test(text), type: 'wellness', confidence: .91, destinations: ['wellness', 'today', 'calendar'] },
    { match: /receipt|order total|subtotal|purchase|paid|invoice|order confirmation/.test(text), type: 'receipt', confidence: .92, destinations: ['finance', 'beauty-lab', 'closet', 'food'] },
    { match: /rent|budget|bill|subscription|bank|credit card|savings|income|paycheck|expense|payment due/.test(text), type: 'finance', confidence: .91, destinations: ['finance', 'financial-brain', 'calendar'] },
    { match: /clean|cleaning|laundry|bedroom|bathroom|kitchen|home reset|house|restock|household|maintenance/.test(text), type: 'home', confidence: .86, destinations: ['home', 'tasks', 'planning'] },
    { match: /appointment|dentist|doctor|salon|interview|reservation|booking/.test(text), type: 'appointment', confidence: .9, destinations: ['calendar', 'tasks', 'timeline'] },
    { match: /schedule|shift|roster|class schedule|work schedule/.test(text), type: 'schedule', confidence: .9, destinations: ['calendar', 'today', 'planning'] },
    { match: /remind|reminder|remember to|don't forget|do not forget/.test(text), type: 'reminder', confidence: .9, destinations: ['tasks', 'today', 'briefings'] },
    { match: /todo|to-do|need to|call |email |buy |pick up|research |submit /.test(text), type: 'task', confidence: .84, destinations: ['tasks', 'today'] },
    { match: /shopping list|wishlist|wish list|things to buy/.test(text), type: 'shopping', confidence: .86, destinations: ['tasks', 'home', 'finance'] },
    { match: /goal|by the end of|target|save \$|want to reach/.test(text), type: 'goal', confidence: .82, destinations: ['goals', 'planning'] },
    { match: /project|prototype|milestone|vendor|manufacturer|creative brief/.test(text), type: 'project', confidence: .8, destinations: ['projects', 'tasks', 'memory'] },
    { match: /skincare|serum|retinol|tretinoin|makeup|sephora|beauty|moisturizer|cleanser|sunscreen/.test(text), type: 'beauty', confidence: .86, destinations: ['beauty', 'beauty-lab', 'finance'] },
    { match: /hair|wash day|scalp|braid|silk press|salon|conditioner|shampoo/.test(text), type: 'hair', confidence: .86, destinations: ['hair', 'beauty', 'calendar'] },
    { match: /workout|gym|exercise|run|pilates|strength|cardio|reps|sets/.test(text), type: 'fitness', confidence: .86, destinations: ['fitness', 'today', 'habits'] },
    { match: /resume|cv|application|interview|job|career/.test(text), type: 'career', confidence: .8, destinations: ['projects', 'tasks', 'calendar'] },
    { match: /flight|hotel|trip|travel|boarding|airbnb/.test(text), type: 'travel', confidence: .82, destinations: ['calendar', 'world', 'tasks'] },
    { match: hasLink, type: 'link', confidence: .82, destinations: ['notes', 'projects', 'tasks', 'memory'] },
    { match: isImage, type: 'image', confidence: .7, destinations: ['notes', 'memory'] },
  ];
  const matched = rules.find((rule) => rule.match) ?? { type: 'note', confidence: .58, destinations: ['notes', 'inbox'] };
  const extracted: Record<string, unknown> = { filename: input.filename ?? null, mimeType: input.mimeType ?? null };

  const money = text.match(/\$\s?([0-9][0-9,]*(?:\.[0-9]{2})?)/);
  if (money) extracted.amount = Number(money[1].replace(/,/g, ''));
  const date = text.match(/\b(?:(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{1,2}(?:,\s*\d{4})?|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)\b/i);
  if (date) extracted.dateText = date[0];
  const time = text.match(/\b(?:1[0-2]|0?[1-9])(?::[0-5][0-9])?\s?(?:am|pm)\b/i);
  if (time) extracted.timeText = time[0];
  const urls = (input.text ?? '').match(/https?:\/\/[^\s)\]}>,]+/gi);
  if (urls?.length) extracted.urls = [...new Set(urls)].slice(0, 5);
  const extension = input.filename?.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase();
  if (extension) extracted.extension = extension;

  return { type: matched.type, title, confidence: matched.confidence, destinations: matched.destinations, extracted };
}

export async function ingestText(userId: string, rawText: string, context: IntakeContext = {}) {
  const heuristic = classifyUniversalInput({ text: rawText });
  const ai = await analyzeUniversalInputWithAI({ text: rawText });
  const classification: IntakeClassification = ai ? { type: ai.type, title: ai.title, confidence: ai.confidence, destinations: ai.destinations, extracted: ai.extracted } : heuristic;
  const sharedMetadata = { destinations: classification.destinations, extracted: classification.extracted, summary: ai?.summary ?? null, sourceRoute: context.sourceRoute ?? null };
  const [inbox] = await db.insert(glowInboxItems).values({ userId, rawText, source: ai ? 'universal_intake_ai' : 'universal_intake', suggestedType: classification.type, suggestedTitle: classification.title, confidence: classification.confidence, metadata: sharedMetadata }).returning();
  const [artifact] = await db.insert(universalIntakeArtifacts).values({ userId, inboxItemId: inbox.id, kind: 'text', sourceText: rawText, detectedType: classification.type, detectedTitle: classification.title, extracted: { ...classification.extracted, sourceRoute: context.sourceRoute ?? null }, proposedDestinations: classification.destinations, confidence: classification.confidence, analysisStatus: ai ? 'ai_analyzed' : 'analyzed' }).returning();
  await db.insert(glowEntities).values({ userId, entityType: 'intake_artifact', sourceTable: 'universal_intake_artifacts', sourceId: artifact.id, title: classification.title, summary: ai?.summary ?? rawText.slice(0, 500), searchableText: rawText, metadata: { detectedType: classification.type, destinations: classification.destinations, sourceRoute: context.sourceRoute ?? null } }).onConflictDoNothing();
  return { inbox, artifact, classification };
}

export async function ingestFile(userId: string, file: File, note = '', context: IntakeContext = {}) {
  if (!file.size) throw new Error('The selected file is empty.');
  if (file.size > MAX_STORED_FILE_BYTES) throw new Error('For now, upload files smaller than 3 MB so Glow can safely store and analyze them in one request.');
  const bytes = Buffer.from(await file.arrayBuffer());
  const base64 = bytes.toString('base64');
  const textLike = file.type.startsWith('text/') || /\.(txt|csv|json|md)$/i.test(file.name);
  const extractedText = textLike ? bytes.toString('utf8').slice(0, 120000) : '';
  const combinedText = [note, extractedText].filter(Boolean).join('\n');
  const dataUrl = `data:${file.type || 'application/octet-stream'};base64,${base64}`;
  const heuristic = classifyUniversalInput({ text: combinedText, filename: file.name, mimeType: file.type });
  const ai = await analyzeUniversalInputWithAI({ filename: file.name, mimeType: file.type, base64: file.type.startsWith('image/') ? undefined : base64, dataUrl: file.type.startsWith('image/') ? dataUrl : undefined, text: extractedText, note });
  const classification: IntakeClassification = ai ? { type: ai.type, title: ai.title, confidence: ai.confidence, destinations: ai.destinations, extracted: { ...heuristic.extracted, ...ai.extracted } } : heuristic;
  const rawText = combinedText || ai?.summary || `${file.name} (${file.type || 'file'})`;
  const sharedMetadata = { filename: file.name, mimeType: file.type, sizeBytes: file.size, destinations: classification.destinations, extracted: classification.extracted, summary: ai?.summary ?? null, sourceRoute: context.sourceRoute ?? null };
  const [inbox] = await db.insert(glowInboxItems).values({ userId, rawText, source: ai ? 'file_upload_ai' : 'file_upload', suggestedType: classification.type, suggestedTitle: classification.title, confidence: classification.confidence, metadata: sharedMetadata }).returning();
  const [artifact] = await db.insert(universalIntakeArtifacts).values({ userId, inboxItemId: inbox.id, kind: file.type.startsWith('image/') ? 'image' : file.type.includes('pdf') ? 'pdf' : 'file', originalName: file.name, mimeType: file.type || null, sizeBytes: file.size, sourceText: extractedText || note || ai?.summary || null, contentDataUrl: dataUrl, detectedType: classification.type, detectedTitle: classification.title, extracted: { ...classification.extracted, sourceRoute: context.sourceRoute ?? null }, proposedDestinations: classification.destinations, confidence: classification.confidence, analysisStatus: ai ? 'ai_analyzed' : textLike ? 'analyzed' : 'stored_for_deeper_analysis' }).returning();
  await db.insert(glowEntities).values({ userId, entityType: 'intake_artifact', sourceTable: 'universal_intake_artifacts', sourceId: artifact.id, title: classification.title, summary: ai?.summary ?? rawText.slice(0, 500), searchableText: `${file.name} ${combinedText} ${ai?.summary ?? ''}`.trim(), metadata: { detectedType: classification.type, destinations: classification.destinations, mimeType: file.type, sourceRoute: context.sourceRoute ?? null } }).onConflictDoNothing();
  return { inbox, artifact, classification };
}
