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

export async function saveRecordingMeta(meta: RecordingMeta) {
  const db = await openDb();
  const tx = db.transaction(SESSION_STORE, 'readwrite');
  tx.objectStore(SESSION_STORE).put(meta);
  await transactionDone(tx);
  db.close();
}

export async function appendRecordingChunk(sessionId: string, index: number, blob: Blob) {
  const db = await openDb();
  const tx = db.transaction(CHUNK_STORE, 'readwrite');
  tx.objectStore(CHUNK_STORE).put({ key: `${sessionId}:${String(index).padStart(8, '0')}`, sessionId, index, blob });
  await transactionDone(tx);
  db.close();
}

export async function buildRecordingBlob(sessionId: string, mimeType: string): Promise<Blob> {
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
  const meta: RecordingMeta = {
    id,
    title: file.name,
    type,
    mimeType: file.type || 'application/octet-stream',
    startedAt: Date.now(),
    endedAt: Date.now(),
    chunkCount: 1,
  };
  await saveRecordingMeta(meta);
  await appendRecordingChunk(id, 0, file);
  return meta;
}

export async function deleteRecording(sessionId: string) {
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

function nextOccurrence(day: number, hour = 12) {
  const now = new Date();
  const add = (day - now.getDay() + 7) % 7 || 7;
  const date = new Date(now);
  date.setDate(now.getDate() + add);
  date.setHours(hour, 0, 0, 0);
  return date;
}

export function parseLooseDate(text: string): Date | undefined {
  const value = text.toLowerCase();
  const date = new Date();
  if (/tomorrow/.test(value)) {
    date.setDate(date.getDate() + 1);
  } else if (/monday/.test(value)) return nextOccurrence(1, /afternoon|2\s*(pm|p\.m\.)/.test(value) ? 14 : 12);
  else if (/tuesday/.test(value)) return nextOccurrence(2);
  else if (/wednesday/.test(value)) return nextOccurrence(3);
  else if (/thursday/.test(value)) return nextOccurrence(4);
  else if (/friday/.test(value)) return nextOccurrence(5);
  else if (/saturday/.test(value)) return nextOccurrence(6);
  else if (/sunday/.test(value)) return nextOccurrence(0);
  else return undefined;

  if (/morning/.test(value)) date.setHours(9, 0, 0, 0);
  else if (/afternoon/.test(value)) date.setHours(14, 0, 0, 0);
  else if (/evening|night/.test(value)) date.setHours(18, 0, 0, 0);
  else date.setHours(12, 0, 0, 0);
  return date;
}

export function extractActions(transcript: string): DetectedAction[] {
  const sentences = transcript
    .split(/(?<=[.!?])\s+|\n+/)
    .map((part) => part.trim())
    .filter(Boolean);
  const output: DetectedAction[] = [];
  const push = (kind: DetectedAction['kind'], source: string, text: string, date?: Date) => {
    const normalized = text.replace(/^(i|we)\s+(need to|have to|should|want to|will|can)\s+/i, '').trim();
    if (!normalized) return;
    output.push({ id: `${kind}-${output.length}-${normalized.slice(0, 20)}`, kind, source, text: normalized, date });
  };

  sentences.forEach((sentence) => {
    const lower = sentence.toLowerCase();
    const date = parseLooseDate(sentence);
    if (/\b(i|we)\s+(need to|have to|should|will)\b/.test(lower)) push('task', sentence, sentence, date);
    else if (/\bremind me\b/.test(lower)) push('reminder', sentence, sentence.replace(/^.*?remind me( to)?\s*/i, ''), date);
    if (/\b(interview|appointment|dinner|meeting|event)\b/.test(lower) && date) push('calendar', sentence, sentence, date);
    if (/\b(i|we)\s+(decided|agreed)|\blet'?s\s+(move|use|make|keep|switch)\b/.test(lower)) push('decision', sentence, sentence);
    if (/\bidea\b|\bmaybe we could\b|\bwhat if\b/.test(lower)) push('idea', sentence, sentence);
    if (/\bi prefer\b|\bi usually\b|\bworks better for me\b/.test(lower)) push('memory', sentence, sentence);
  });

  const seen = new Set<string>();
  return output.filter((item) => {
    const key = `${item.kind}:${item.text.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 30);
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
