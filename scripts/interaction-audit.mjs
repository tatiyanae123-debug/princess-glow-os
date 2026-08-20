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

for (const file of ROOTS.flatMap(walk)) {
  const text = fs.readFileSync(file, 'utf8');

  for (const match of text.matchAll(/(?:href|to)\s*=\s*["'](?:#|javascript:void\(0\)|)["']/g)) {
    report(failures, file, text, match.index ?? 0, 'contains a dead navigation target');
  }

  for (const match of text.matchAll(/onClick\s*=\s*\{\s*(?:\(.*?\)|\w+)\s*=>\s*\{\s*\}\s*\}/gs)) {
    report(failures, file, text, match.index ?? 0, 'contains an empty click handler');
  }

  for (const match of text.matchAll(/<button\b[\s\S]*?>/g)) {
    const tag = match[0];
    const index = match.index ?? 0;
    const explicitlyButton = /type\s*=\s*["']button["']/.test(tag);
    const disabled = /\bdisabled(?:\s|=|>)/.test(tag) || /aria-disabled\s*=\s*["']true["']/.test(tag);
    const hasAction = /\bonClick\s*=|\bonPointerDown\s*=|\bonMouseDown\s*=|\bformAction\s*=|\bonKeyDown\s*=/.test(tag);
    if (explicitlyButton && !disabled && !hasAction) {
      report(failures, file, text, index, 'has type="button" but no interaction handler');
    }
    if (!/\btype\s*=/.test(tag) && !hasAction && !/\bname\s*=/.test(tag) && !/\bvalue\s*=/.test(tag) && !disabled) {
      report(warnings, file, text, index, 'button has no explicit type or handler; verify it is an intentional form submit');
    }
  }

  for (const match of text.matchAll(/<(?:Link|a)\b[\s\S]*?>/g)) {
    const tag = match[0];
    const index = match.index ?? 0;
    if (/href\s*=\s*\{?\s*["']\s*["']\s*\}?/.test(tag)) {
      report(failures, file, text, index, 'contains an empty href');
    }
  }

  for (const match of text.matchAll(/<(?:div|span)\b[^>]*\bonClick\s*=/g)) {
    report(warnings, file, text, match.index ?? 0, 'non-semantic clickable element; verify keyboard accessibility');
  }
}

console.log(`Interaction audit scanned ${ROOTS.flatMap(walk).length} source files.`);
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
console.log('Interaction audit passed: no definite dead buttons or navigation targets found.');
