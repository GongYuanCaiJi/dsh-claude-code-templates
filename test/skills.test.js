import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Context } from '@deepseek-ai/cordis';
import { SkillRegistry } from '@deepseek-ai/dsh-skill';
import { registerSkills, listSkills, getSkill, SKILL_ROOTS } from '../lib/index.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

function walkSkills(root) {
  const out = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const full = join(root, entry.name);
    if (entry.isDirectory()) out.push(...walkSkills(full));
    else if (entry.name === 'SKILL.md') out.push(full);
  }
  return out;
}

/** Real cordis Context with the real dsh skill registry mounted, plus our provider. */
function freshRegistry() {
  const ctx = new Context();
  new SkillRegistry(ctx);
  registerSkills(ctx);
  return ctx;
}

test('ships all 884 upstream SKILL.md files', () => {
  const files = SKILL_ROOTS.flatMap(walkSkills);
  assert.equal(files.length, 884, `expected 884 SKILL.md, got ${files.length}`);
});

test('shipped fidelity guard verifies every file against the manifest', () => {
  // Exercise the actual shipped guard (scripts/verify-fidelity.mjs) rather than
  // re-implementing its hash walk: the manifest is the independent source of
  // truth (generated once from the pinned upstream tree), the script is the
  // shipped tool, and this test proves both agree.
  const result = spawnSync(process.execPath, ['scripts/verify-fidelity.mjs'], { cwd: ROOT, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /5044 files match/);
});

test('registry integration: every candidate validates and all 860 unique names resolve', async () => {
  const ctx = freshRegistry();
  const catalog = await ctx.skills.list();
  // 884 files, 45 duplicated skill names across categories -> 860 unique winners
  assert.equal(catalog.length, 860, `expected 860 unique skills, got ${catalog.length}`);
  assert.ok(catalog.every((s) => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(s.name)), 'all names kebab-case');
  assert.ok(catalog.every((s) => s.description.length > 0), 'all descriptions non-empty');
  assert.ok(catalog.every((s) => s.provider === 'dsh-claude-code-templates'), 'provider matches');
});

test('get() returns the exact SKILL.md body for a loaded candidate', async () => {
  const ctx = freshRegistry();
  const def = await ctx.skills.get('agent-management');
  assert.ok(def, 'agent-management should load');
  const file = join(ROOT, 'skills', 'ai-maestro', 'agent-management', 'SKILL.md');
  assert.equal(def.content, readFileSync(file, 'utf8'));
  assert.equal(def.path, file);
});

test('torch_geometric directory is exposed under its valid frontmatter name', async () => {
  const ctx = freshRegistry();
  const hyphen = await ctx.skills.get('torch-geometric');
  assert.ok(hyphen, 'torch-geometric should load (frontmatter name)');
  const underscore = await ctx.skills.get('torch_geometric');
  assert.equal(underscore, undefined, 'underscore name must not be addressable');
});

test('CRLF frontmatter parses (ui-ux-pro-max)', () => {
  const candidates = listSkills(SKILL_ROOTS);
  const skill = candidates.find((c) => c.name === 'ui-ux-pro-max');
  assert.ok(skill, 'ui-ux-pro-max listed');
  assert.match(skill.description, /^UI\/UX design intelligence/, 'CRLF description extracted');
});

test('frontmatter-less skill gets a fallback description (scholar-evaluation)', () => {
  const candidates = listSkills(SKILL_ROOTS);
  const skill = candidates.find((c) => c.name === 'scholar-evaluation');
  assert.ok(skill, 'scholar-evaluation listed');
  assert.ok(skill.description.length > 0);
});

test('duplicate skill names resolve deterministically (sorted by category path)', async () => {
  const ctx = freshRegistry();
  const catalog = await ctx.skills.list();
  const names = new Set(catalog.map((s) => s.name));
  const all = listSkills(SKILL_ROOTS);
  const dupNames = [...new Set(all.map((c) => c.name).filter((n) => all.filter((c) => c.name === n).length > 1))];
  assert.ok(dupNames.length >= 21, `expected >=21 duplicate names, got ${dupNames.length}`);
  for (const name of dupNames) {
    assert.ok(names.has(name), `${name} present in catalog`);
    const withDups = all.filter((c) => c.name === name).sort((a, b) => (a.path < b.path ? -1 : 1));
    const winner = catalog.find((s) => s.name === name);
    assert.equal(winner.resourceBase.path, withDups[0].resourceBase.path, `${name} winner is first in sorted category order`);
  }
});

test('nested skills load (game-development and its platform sub-skills)', async () => {
  const ctx = freshRegistry();
  const container = await ctx.skills.get('game-development');
  assert.ok(container, 'game-development (container skill) loads');
  for (const sub of ['2d-games', 'game-design', 'web-games']) {
    const def = await ctx.skills.get(sub);
    assert.ok(def, `${sub} (nested sub-skill) loads`);
  }
});

test('getSkill returns undefined for a missing locator', () => {
  assert.equal(getSkill({ locator: join(ROOT, 'skills', 'no-such', 'SKILL.md') }), undefined);
});
