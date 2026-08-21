const PHRASE_ALIASES: Record<string, string> = {
  guasha: 'gua sha',
  quasha: 'gua sha',
  gosha: 'gua sha',
  washa: 'gua sha',
  'gua-sha': 'gua sha',
  glowos: 'glow os',
};

export function normalizeSearch(value: string) {
  let normalized = value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  for (const [alias, canonical] of Object.entries(PHRASE_ALIASES)) {
    normalized = normalized.replace(new RegExp(`\\b${alias}\\b`, 'g'), canonical);
  }
  return normalized.replace(/\s+/g, ' ');
}

function distance(a: string, b: string) {
  const rows = Array.from({ length: a.length + 1 }, (_, i) => i);
  for (let j = 1; j <= b.length; j += 1) {
    let previous = rows[0];
    rows[0] = j;
    for (let i = 1; i <= a.length; i += 1) {
      const saved = rows[i];
      rows[i] = Math.min(rows[i] + 1, rows[i - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
      previous = saved;
    }
  }
  return rows[a.length];
}

function wordMatch(queryWord: string, candidateWord: string) {
  if (candidateWord.includes(queryWord) || queryWord.includes(candidateWord)) return true;
  const tolerance = queryWord.length >= 7 ? 2 : queryWord.length >= 4 ? 1 : 0;
  return distance(queryWord, candidateWord) <= tolerance;
}

export function fuzzyMatch(query: string, candidate: string) {
  const q = normalizeSearch(query);
  const c = normalizeSearch(candidate);
  if (!q) return false;
  if (c.includes(q) || q.includes(c)) return true;
  const meaningful = q.split(' ').filter(word => word.length > 1 && word !== 'glow' && word !== 'os');
  const candidateWords = c.split(' ');
  return meaningful.length > 0 && meaningful.every(word => candidateWords.some(candidateWord => wordMatch(word, candidateWord)));
}

export function didYouMean(query: string, choices: string[]) {
  const normalized = normalizeSearch(query);
  if (!normalized || choices.some(choice => normalizeSearch(choice) === normalized)) return null;
  const ranked = choices.map(choice => ({ choice, score: distance(normalized, normalizeSearch(choice)) })).sort((a, b) => a.score - b.score);
  return ranked[0] && ranked[0].score <= Math.max(2, Math.floor(normalized.length * 0.34)) ? ranked[0].choice : null;
}
