export type NoteCaptureType =
  | 'Meeting'
  | 'Interview'
  | 'Lecture'
  | 'Brain Dump'
  | 'Planning Session'
  | 'Appointment'
  | 'Conversation'
  | 'Voice Journal'
  | 'General';

export type DetectedAction = {
  id: string;
  kind: 'task' | 'calendar' | 'reminder' | 'idea' | 'decision' | 'memory';
  text: string;
  source: string;
  date?: Date;
};

export type RecordingMeta = {
  id: string;
  title: string;
  type: NoteCaptureType;
  mimeType: string;
  startedAt: number;
  endedAt?: number;
  chunkCount: number;
};

const DB_NAME = 'glow-notes-listener';
const DB_VERSION = 1;
const SESSION_STORE = 'sessions';
const CHUNK_STORE = 'chunks';
const IMPORT_CHUNK_BYTES = 8 * 1024 * 1024;
const pendingWrites = new Map<string, Set<Promise<void>>>();

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('Local recording storage is not available in this browser.'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(SESSION_STORE)) db.createObjectStore(SESSION_STORE, { keyPath: 'id' });
      if (!db.objectStoreNames.contains(CHUNK_STORE)) {
        const store = db.createObjectStore(CHUNK_STORE, { keyPath: 'key' });
        store.createIndex('sessionId', 'sessionId', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Could not open local recording storage.'));
  });
}

function transactionDone(tx: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('Local recording storage failed.'));
    tx.onabort = () => reject(tx.error ?? new Error('Local recording storage was interrupted.'));
  });
}

function trackWrite(sessionId: string, promise: Promise<void>) {
  let writes = pendingWrites.get(sessionId);
  if (!writes) {
    writes = new Set();
    pendingWrites.set(sessionId, writes);
  }
  writes.add(promise);
  void promise.finally(() => {
    const current = pendingWrites.get(sessionId);
    current?.delete(promise);
    if (current?.size === 0) pendingWrites.delete(sessionId);
  });
  return promise;
}

export async function awaitRecordingWrites(sessionId: string) {
  while (pendingWrites.get(sessionId)?.size) {
    await Promise.all([...pendingWrites.get(sessionId)!]);
  }
}

export async function saveRecordingMeta(meta: RecordingMeta) {
  const db = await openDb();
  const tx = db.transaction(SESSION_STORE, 'readwrite');
  tx.objectStore(SESSION_STORE).put(meta);
  await transactionDone(tx);
  db.close();
}

export function appendRecordingChunk(sessionId: string, index: number, blob: Blob) {
  const write = (async () => {
    const db = await openDb();
    const tx = db.transaction([CHUNK_STORE, SESSION_STORE], 'readwrite');
    tx.objectStore(CHUNK_STORE).put({ key: `${sessionId}:${String(index).padStart(8, '0')}`, sessionId, index, blob });
    const sessionStore = tx.objectStore(SESSION_STORE);
    const getMeta = sessionStore.get(sessionId);
    getMeta.onsuccess = () => {
      const meta = getMeta.result as RecordingMeta | undefined;
      if (meta) sessionStore.put({ ...meta, chunkCount: Math.max(meta.chunkCount, index + 1) });
    };
    await transactionDone(tx);
    db.close();
  })();
  return trackWrite(sessionId, write);
}

export async function buildRecordingBlob(sessionId: string, mimeType: string): Promise<Blob> {
  await awaitRecordingWrites(sessionId);
  const db = await openDb();
  const tx = db.transaction(CHUNK_STORE, 'readonly');
  const index = tx.objectStore(CHUNK_STORE).index('sessionId');
  const request = index.getAll(IDBKeyRange.only(sessionId));
  const rows = await new Promise<Array<{ index: number; blob: Blob }>>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result as Array<{ index: number; blob: Blob }>);
    request.onerror = () => reject(request.error ?? new Error('Could not rebuild this recording.'));
  });
  await transactionDone(tx);
  db.close();
  rows.sort((a, b) => a.index - b.index);
  return new Blob(rows.map((row) => row.blob), { type: mimeType || 'audio/webm' });
}

export async function saveImportedMedia(id: string, file: File, type: NoteCaptureType) {
  const baseMeta: RecordingMeta = {
    id,
    title: file.name,
    type,
    mimeType: file.type || 'application/octet-stream',
    startedAt: Date.now(),
    chunkCount: 0,
  };
  await saveRecordingMeta(baseMeta);
  const chunkCount = Math.max(1, Math.ceil(file.size / IMPORT_CHUNK_BYTES));
  for (let index = 0; index < chunkCount; index += 1) {
    const start = index * IMPORT_CHUNK_BYTES;
    const end = Math.min(file.size, start + IMPORT_CHUNK_BYTES);
    await appendRecordingChunk(id, index, file.slice(start, end, file.type));
  }
  const finalMeta: RecordingMeta = { ...baseMeta, endedAt: Date.now(), chunkCount };
  await saveRecordingMeta(finalMeta);
  return finalMeta;
}

export async function getRecordingMeta(sessionId: string): Promise<RecordingMeta | null> {
  const db = await openDb();
  const tx = db.transaction(SESSION_STORE, 'readonly');
  const request = tx.objectStore(SESSION_STORE).get(sessionId);
  const meta = await new Promise<RecordingMeta | null>((resolve, reject) => {
    request.onsuccess = () => resolve((request.result as RecordingMeta | undefined) ?? null);
    request.onerror = () => reject(request.error ?? new Error('Could not load this recording.'));
  });
  await transactionDone(tx);
  db.close();
  return meta;
}

export async function listRecordingMetas(): Promise<RecordingMeta[]> {
  const db = await openDb();
  const tx = db.transaction(SESSION_STORE, 'readonly');
  const request = tx.objectStore(SESSION_STORE).getAll();
  const rows = await new Promise<RecordingMeta[]>((resolve, reject) => {
    request.onsuccess = () => resolve((request.result as RecordingMeta[]) ?? []);
    request.onerror = () => reject(request.error ?? new Error('Could not load local recordings.'));
  });
  await transactionDone(tx);
  db.close();
  return rows.sort((a, b) => b.startedAt - a.startedAt);
}

export async function deleteRecording(sessionId: string) {
  await awaitRecordingWrites(sessionId);
  const db = await openDb();
  const tx = db.transaction([SESSION_STORE, CHUNK_STORE], 'readwrite');
  tx.objectStore(SESSION_STORE).delete(sessionId);
  const index = tx.objectStore(CHUNK_STORE).index('sessionId');
  const request = index.openCursor(IDBKeyRange.only(sessionId));
  request.onsuccess = () => {
    const cursor = request.result;
    if (!cursor) return;
    cursor.delete();
    cursor.continue();
  };
  await transactionDone(tx);
  db.close();
}

export async function localStorageEstimate() {
  if (typeof navigator === 'undefined' || !navigator.storage?.estimate) return null;
  const estimate = await navigator.storage.estimate();
  return {
    usage: estimate.usage ?? 0,
    quota: estimate.quota ?? 0,
    remaining: Math.max(0, (estimate.quota ?? 0) - (estimate.usage ?? 0)),
  };
}

export function formatDuration(totalSeconds: number) {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  return hours > 0
    ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`
    : `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
}

export function inferCaptureType(text: string, fallback: NoteCaptureType = 'General'): NoteCaptureType {
  const value = text.toLowerCase();
  if (/interview|hiring|recruiter|candidate|salary|start date/.test(value)) return 'Interview';
  if (/lecture|class|professor|chapter|exam|study/.test(value)) return 'Lecture';
  if (/appointment|doctor|dentist|provider|follow-up appointment/.test(value)) return 'Appointment';
  if (/plan|planning|weekly goals|schedule|priorities/.test(value)) return 'Planning Session';
  if (/brain dump|random thoughts|thinking out loud/.test(value)) return 'Brain Dump';
  if (/journal|how i feel|today i felt|reflection/.test(value)) return 'Voice Journal';
  if (/meeting|agenda|team|decision/.test(value)) return 'Meeting';
  return fallback;
}

export function cleanTranscript(text: string) {
  return text
    .replace(/\b(um+|uh+|erm+)\b[,.]?\s*/gi, '')
    .replace(/\b(you know|like)\b(?=\s+(?:I|we|they|he|she|it)\b)/gi, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,.!?])/g, '$1')
    .trim();
}

function parseClock(value: string) {
  const match = value.match(/\b(?:at\s*)?(1[0-2]|0?[1-9])(?::([0-5]\d))?\s*(a\.?m\.?|p\.?m\.?)\b/i);
  if (!match) return null;
  let hour = Number(match[1]);
  const minute = Number(match[2] ?? 0);
  const meridiem = match[3].toLowerCase().startsWith('p') ? 'pm' : 'am';
  if (hour === 12) hour = 0;
  if (meridiem === 'pm') hour += 12;
  return { hour, minute };
}

function inferredHour(value: string) {
  const clock = parseClock(value);
  if (clock) return clock;
  if (/morning/.test(value)) return { hour: 9, minute: 0 };
  if (/afternoon/.test(value)) return { hour: 14, minute: 0 };
  if (/evening|night/.test(value)) return { hour: 18, minute: 0 };
  return { hour: 12, minute: 0 };
}

function dateAt(base: Date, value: string) {
  const { hour, minute } = inferredHour(value);
  const date = new Date(base);
  date.setHours(hour, minute, 0, 0);
  return date;
}

function nextOccurrence(day: number, value: string) {
  const now = new Date();
  let add = (day - now.getDay() + 7) % 7;
  const candidate = dateAt(new Date(now.getFullYear(), now.getMonth(), now.getDate() + add), value);
  if (add === 0 && candidate <= now) add = 7;
  return dateAt(new Date(now.getFullYear(), now.getMonth(), now.getDate() + add), value);
}

export function parseLooseDate(text: string): Date | undefined {
  const value = text.toLowerCase();
  const now = new Date();
  if (/\btoday\b/.test(value)) return dateAt(now, value);
  if (/\btomorrow\b/.test(value)) {
    const date = new Date(now);
    date.setDate(date.getDate() + 1);
    return dateAt(date, value);
  }
  const weekdays: Array<[RegExp, number]> = [
    [/\bsunday\b/, 0], [/\bmonday\b/, 1], [/\btuesday\b/, 2], [/\bwednesday\b/, 3],
    [/\bthursday\b/, 4], [/\bfriday\b/, 5], [/\bsaturday\b/, 6],
  ];
  for (const [pattern, day] of weekdays) if (pattern.test(value)) return nextOccurrence(day, value);

  const numeric = value.match(/\b(\d{1,2})[\/-](\d{1,2})(?:[\/-](\d{2,4}))?\b/);
  if (numeric) {
    const month = Number(numeric[1]) - 1;
    const day = Number(numeric[2]);
    let year = numeric[3] ? Number(numeric[3]) : now.getFullYear();
    if (year < 100) year += 2000;
    const date = dateAt(new Date(year, month, day), value);
    if (!numeric[3] && date < now) date.setFullYear(date.getFullYear() + 1);
    return date;
  }
  return undefined;
}

function actionText(sentence: string) {
  return sentence
    .replace(/^.*?\bremind me(?: to)?\s+/i, '')
    .replace(/^\s*(?:i|we)\s+(?:need to|have to|should|will)\s+/i, '')
    .trim();
}

export function extractActions(transcript: string): DetectedAction[] {
  const sentences = transcript
    .split(/(?<=[.!?])\s+|\n+/)
    .map((part) => part.trim())
    .filter(Boolean);
  const output: DetectedAction[] = [];
  const push = (kind: DetectedAction['kind'], source: string, text: string, date?: Date) => {
    const normalized = actionText(text);
    if (!normalized || normalized.length < 2) return;
    output.push({ id: `${kind}-${output.length}-${normalized.slice(0, 28).toLowerCase().replace(/\W+/g, '-')}`, kind, source, text: normalized, date });
  };

  sentences.forEach((sentence) => {
    const lower = sentence.toLowerCase();
    const date = parseLooseDate(sentence);
    const reminder = /\bremind me\b/.test(lower);
    if (reminder) push('reminder', sentence, sentence, date);
    else if (/\b(i|we)\s+(need to|have to|should|will)\b/.test(lower)) push('task', sentence, sentence, date);

    if (/\b(interview|appointment|dinner|meeting|event|reservation|class|flight|call)\b/.test(lower) && date) {
      push('calendar', sentence, sentence, date);
    }
    if (/\b(i|we)\s+(decided|agreed)\b|\blet'?s\s+(move|use|make|keep|switch)\b/.test(lower)) push('decision', sentence, sentence);
    if (/\bidea\b|\bmaybe we could\b|\bwhat if\b/.test(lower)) push('idea', sentence, sentence);
    if (/\bi prefer\b|\bi usually\b|\bworks better for me\b/.test(lower)) push('memory', sentence, sentence);
  });

  const seen = new Set<string>();
  return output.filter((item) => {
    const key = `${item.kind}:${item.text.toLowerCase().replace(/\s+/g, ' ')}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 50);
}

export function buildSmartNoteContent(input: {
  transcript: string;
  type: NoteCaptureType;
  durationSeconds: number;
  actions: DetectedAction[];
  bookmarks: Array<{ at: number; label: string }>;
}) {
  const transcript = input.transcript.trim();
  const clean = cleanTranscript(transcript);
  const sentences = clean.split(/(?<=[.!?])\s+/).filter(Boolean);
  const summary = sentences.slice(0, 3).join(' ') || 'Recording captured. Add or review the transcript when ready.';
  const keyPoints = sentences.slice(0, 8);
  const decisions = input.actions.filter((item) => item.kind === 'decision');
  const tasks = input.actions.filter((item) => item.kind === 'task' || item.kind === 'reminder');
  const dates = input.actions.filter((item) => item.date);

  return [
    `# ${input.type}`,
    '',
    `Duration: ${formatDuration(input.durationSeconds)}`,
    '',
    '## In 30 Seconds',
    summary,
    '',
    '## Key Points',
    ...(keyPoints.length ? keyPoints.map((point) => `- ${point}`) : ['- No transcript text was available yet.']),
    '',
    '## Decisions',
    ...(decisions.length ? decisions.map((item) => `- ${item.text}`) : ['- None detected.']),
    '',
    '## Action Items',
    ...(tasks.length ? tasks.map((item) => `- [ ] ${item.text}${item.date ? ` · ${item.date.toLocaleString()}` : ''}`) : ['- None detected.']),
    '',
    '## Dates Mentioned',
    ...(dates.length ? dates.map((item) => `- ${item.date?.toLocaleString()} · ${item.source}`) : ['- None detected.']),
    '',
    '## Bookmarks',
    ...(input.bookmarks.length ? input.bookmarks.map((item) => `- ${formatDuration(item.at)} · ${item.label}`) : ['- None.']),
    '',
    '## Full Transcript',
    transcript || '[Audio captured locally. Live transcript was unavailable or empty.]',
  ].join('\n');
}
