import fs from 'node:fs';
import path from 'node:path';

const ROOTS = ['src/app', 'src/components'];
const EXTENSIONS = new Set(['.tsx', '.ts', '.jsx', '.js']);
const failures = [];
const warnings = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return EXTENSIONS.has(path.extname(entry.name)) ? [full] : [];
  });
}

function lineFor(text, index) {
  return text.slice(0, index).split('\n').length;
}

function report(bucket, file, text, index, message) {
  bucket.push(`${file}:${lineFor(text, index)} ${message}`);
}

function insideForm(text, index) {
  return text.lastIndexOf('<form', index) > text.lastIndexOf('</form>', index);
}

function readOpeningTag(text, start) {
  let quote = null;
  let braceDepth = 0;
  let escaped = false;
  for (let i = start; i < text.length; i += 1) {
    const ch = text[i];
    if (quote) {
      if (escaped) { escaped = false; continue; }
      if (ch === '\\') { escaped = true; continue; }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
    if (ch === '{') { braceDepth += 1; continue; }
    if (ch === '}') { braceDepth = Math.max(0, braceDepth - 1); continue; }
    if (ch === '>' && braceDepth === 0) return text.slice(start, i + 1);
  }
  return text.slice(start, Math.min(text.length, start + 2000));
}

function appRouteFromPage(file) {
  const relative = path.relative('src/app', path.dirname(file)).replaceAll(path.sep, '/');
  if (!relative || relative === '.') return '/';
  const segments = relative.split('/').filter((segment) => !segment.startsWith('(') && !segment.startsWith('@'));
  return `/${segments.join('/')}`;
}

function routeRegex(route) {
  const escaped = route.split('/').map((segment) => {
    if (!segment) return '';
    if (/^\[\[\.\.\..+\]\]$/.test(segment)) return '(?:.*)?';
    if (/^\[\.\.\..+\]$/.test(segment)) return '.+';
    if (/^\[.+\]$/.test(segment)) return '[^/]+';
    return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }).join('/');
  return new RegExp(`^${escaped || '/'}$`);
}

const sourceFiles = ROOTS.flatMap(walk);
const pageFiles = walk('src/app').filter((file) => /\/page\.(tsx|ts|jsx|js)$/.test(file.replaceAll('\\', '/')));
const routePatterns = pageFiles.map(appRouteFromPage).map(routeRegex);

function hasRoute(href) {
  const clean = href.split('#')[0].split('?')[0] || '/';
  if (clean.startsWith('/api/')) return true;
  return routePatterns.some((pattern) => pattern.test(clean));
}

for (const file of sourceFiles) {
  const text = fs.readFileSync(file, 'utf8');

  for (const match of text.matchAll(/(?:href|to)\s*=\s*["'](?:#|javascript:void\(0\)|)["']/g)) {
    report(failures, file, text, match.index ?? 0, 'contains a dead navigation target');
  }

  for (const match of text.matchAll(/onClick\s*=\s*\{\s*(?:\(.*?\)|\w+)\s*=>\s*\{\s*\}\s*\}/gs)) {
    report(failures, file, text, match.index ?? 0, 'contains an empty click handler');
  }

  for (const match of text.matchAll(/<button\b/g)) {
    const index = match.index ?? 0;
    const tag = readOpeningTag(text, index);
    const explicitlyButton = /type\s*=\s*["']button["']/.test(tag);
    const explicitlySubmit = /type\s*=\s*["']submit["']/.test(tag);
    const disabled = /\bdisabled(?:\s|=|>)/.test(tag) || /aria-disabled\s*=\s*["']true["']/.test(tag);
    const hasAction = /\bonClick\s*=|\bonPointerDown\s*=|\bonMouseDown\s*=|\bformAction\s*=|\bonKeyDown\s*=/.test(tag);
    const propsDriven = /\.\.\.[A-Za-z_$][\w$]*/.test(tag);
    const inForm = insideForm(text, index);

    if (explicitlyButton && !disabled && !hasAction && !propsDriven) {
      report(failures, file, text, index, 'has type="button" but no interaction handler');
    }

    if (!explicitlyButton && !explicitlySubmit && !hasAction && !disabled && !propsDriven && !inForm && !/\bname\s*=/.test(tag) && !/\bvalue\s*=/.test(tag)) {
      report(failures, file, text, index, 'looks clickable but has no action and is not a form submit');
    }
  }

  for (const match of text.matchAll(/<(?:Link|a)\b/g)) {
    const index = match.index ?? 0;
    const tag = readOpeningTag(text, index);
    if (/href\s*=\s*\{?\s*["']\s*["']\s*\}?/.test(tag)) {
      report(failures, file, text, index, 'contains an empty href');
    }
    const literal = tag.match(/href\s*=\s*["'](\/[^"']*)["']/)?.[1];
    if (literal && !hasRoute(literal)) {
      report(failures, file, text, index, `points to missing internal route ${literal}`);
    }
  }

  for (const match of text.matchAll(/<(?:div|span)\b/g)) {
    const index = match.index ?? 0;
    const tag = readOpeningTag(text, index);
    if (!/\bonClick\s*=/.test(tag)) continue;
    const decorativeBackdrop = /\baria-hidden(?:\s|=|>)/.test(tag);
    const keyboardSafe = /\brole\s*=/.test(tag) && /\btabIndex\s*=/.test(tag) && /\bonKeyDown\s*=/.test(tag);
    if (!decorativeBackdrop && !keyboardSafe) {
      report(failures, file, text, index, 'non-semantic clickable element is missing keyboard interaction semantics');
    }
  }
}

console.log(`Interaction audit scanned ${sourceFiles.length} source files and ${pageFiles.length} application routes.`);
if (warnings.length) {
  console.log(`Interaction audit warnings (${warnings.length}):`);
  for (const item of warnings.slice(0, 120)) console.log(`  WARN ${item}`);
  if (warnings.length > 120) console.log(`  ... ${warnings.length - 120} more warnings`);
}
if (failures.length) {
  console.error(`Interaction audit failures (${failures.length}):`);
  for (const item of failures) console.error(`  FAIL ${item}`);
  process.exit(1);
}
console.log('Interaction audit passed: every statically-auditable control has an action, submit path, disabled state, keyboard-safe interaction, and valid literal internal destination.');
