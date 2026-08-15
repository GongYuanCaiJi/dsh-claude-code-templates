#!/usr/bin/env node
/**
 * Verify that the shipped skills trees are byte-identical to the upstream pin.
 *
 * Reads THIRD_PARTY_NOTICES.sha256 (one "sha256  relative-path" per line),
 * recomputes every listed file, and exits non-zero on any mismatch or a
 * missing/extra file. Used by `npm prepare` and `npm prepack` so a stripped or
 * drifted tree fails loudly instead of shipping. Portable across macOS/Linux
 * (no dependency on `shasum`/`sha256sum`).
 *
 * Usage: node scripts/verify-fidelity.mjs
 */
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST = join(ROOT, 'THIRD_PARTY_NOTICES.sha256');

function sha256(file) {
  return createHash('sha256').update(readFileSync(file)).digest('hex');
}

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

const expected = new Map();
for (const line of readFileSync(MANIFEST, 'utf8').split('\n')) {
  const trimmed = line.trim();
  if (!trimmed) continue;
  const hash = trimmed.slice(0, 64);
  const rel = trimmed.slice(65).trim();
  expected.set(rel, hash);
}

const actualFiles = new Set(
  [...walk(join(ROOT, 'skills')), ...walk(join(ROOT, '.claude-plugin'))].map((f) => f.slice(ROOT.length + 1)),
);

let failed = 0;
for (const rel of expected.keys()) {
  const file = join(ROOT, rel);
  if (!statSync(file, { throwIfNoEntry: false })?.isFile()) {
    console.error(`MISSING ${rel}`);
    failed += 1;
    continue;
  }
  const hash = sha256(file);
  if (hash !== expected.get(rel)) {
    console.error(`DRIFT ${rel}\n  expected ${expected.get(rel)}\n  actual   ${hash}`);
    failed += 1;
  }
}
for (const rel of actualFiles) {
  if (!expected.has(rel)) {
    console.error(`EXTRA ${rel}`);
    failed += 1;
  }
}

if (failed > 0) {
  console.error(`fidelity check failed: ${failed} problem(s)`);
  process.exit(1);
}
console.log(`fidelity check ok: ${expected.size} files match THIRD_PARTY_NOTICES.sha256`);
