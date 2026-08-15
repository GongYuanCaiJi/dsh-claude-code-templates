/**
 * Skill provider for dsh-claude-code-templates.
 *
 * Registers the 884 SKILL.md files shipped from the upstream
 * davila7/claude-code-templates repository (pinned commit, see
 * THIRD_PARTY_NOTICES.md) with the dsh skill registry, following the same
 * provider shape as dsh-lens (`@deepseek-ai/dsh-skill` registry contract).
 *
 * Files are 100% verbatim upstream copies; this module only reads them.
 * The one adaptation is name handling: the registry requires kebab-case
 * candidate names and throws on any invalid candidate, so the candidate name
 * comes from the skill's own frontmatter `name:` (upstream's
 * `scientific/torch_geometric` directory declares `name: torch-geometric` in
 * its frontmatter), falling back to a normalized directory name.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BUNDLED_SKILL_RANK } from '@deepseek-ai/dsh-skill';

export const PROVIDER = 'dsh-claude-code-templates';

const INVOCATION = Object.freeze({ modelInvocable: true, userInvocable: true });

/** Kebab-case grammar used by the dsh skill registry. */
const SKILL_NAME = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Skills ship under these two roots, mirroring the upstream layout. */
export const SKILL_ROOTS = (() => {
  const base = join(dirname(fileURLToPath(import.meta.url)), '..');
  return Object.freeze([join(base, 'skills'), join(base, '.claude-plugin', 'skills')]);
})();

/** Parse the YAML frontmatter block; tolerant of CRLF line endings. */
function parseFrontmatter(body) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/u.exec(body);
  if (!match) return null;
  const fm = {};
  for (const line of match[1].split(/\r?\n/u)) {
    const kv = /^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/u.exec(line);
    if (kv) fm[kv[1]] = kv[2];
  }
  return fm;
}

function stripQuotes(value) {
  return value.replace(/^['"]|['"]$/g, '').trim();
}

/** Frontmatter `description:`, else the first non-empty non-heading body line. */
export function extractDescription(body) {
  const fm = parseFrontmatter(body);
  const described = fm?.description;
  if (described && stripQuotes(described).length > 0) return stripQuotes(described);
  const firstLine = body
    .replace(/^---[\s\S]*?---\r?\n?/u, '')
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .find((line) => line && !line.startsWith('#'));
  return firstLine || '';
}

/** Registry-valid candidate name: frontmatter `name:` if valid, else normalized directory name. */
export function resolveSkillName(dirName, frontmatterName) {
  if (frontmatterName && SKILL_NAME.test(frontmatterName)) return frontmatterName;
  const normalized = dirName
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
  if (SKILL_NAME.test(normalized)) return normalized;
  // No honest kebab-case form: the registry fails the whole catalog on an
  // invalid name, so guarantee validity over fidelity of the identifier.
  return normalized.replace(/[^a-z0-9]/g, '') || 'skill';
}

function collectRoot(root) {
  const candidates = [];
  const visit = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const full = join(dir, entry.name);
      const skillFile = join(full, 'SKILL.md');
      if (existsSync(skillFile)) {
        candidates.push({ dir: full, skillFile });
      }
      // A directory can be both a skill and a container of more skills
      // (upstream nests, e.g. game-development/2d-games): keep descending.
      visit(full);
    }
  };
  visit(root);
  return candidates;
}

/** Build all candidates from the shipped roots, deterministically ordered. */
export function listSkills(roots = SKILL_ROOTS) {
  const candidates = [];
  for (const root of roots) {
    for (const found of collectRoot(root)) {
      const body = readFileSync(found.skillFile, 'utf8');
      const fm = parseFrontmatter(body);
      const name = resolveSkillName(join(found.dir).split(/[\\/]/).pop(), fm?.name);
      const description = extractDescription(body);
      candidates.push({
        name,
        description,
        invocation: INVOCATION,
        source: 'bundled',
        provider: PROVIDER,
        rank: BUNDLED_SKILL_RANK,
        resourceBase: { kind: 'directory', path: found.dir },
        locator: found.skillFile,
        path: found.skillFile,
      });
    }
  }
  // Deterministic local order: the registry resolves duplicate names by
  // (rank, provider order, local order); sorting by path makes the winner
  // stable across runs — the first category alphabetically wins.
  candidates.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
  return candidates;
}

/** Load the full skill body for a candidate previously returned by listSkills. */
export function getSkill(candidate) {
  if (typeof candidate?.locator !== 'string' || !existsSync(candidate.locator)) return undefined;
  return {
    name: candidate.name,
    description: candidate.description,
    invocation: candidate.invocation,
    provider: candidate.provider,
    source: candidate.source,
    resourceBase: candidate.resourceBase,
    content: readFileSync(candidate.locator, 'utf8'),
    path: candidate.locator,
  };
}

/** Register the provider into the ctx.skills registry (dsh-lens pattern). */
export function registerSkills(ctx) {
  ctx.inject(['skills'], (skillCtx) => {
    const candidates = listSkills();
    const provider = {
      name: PROVIDER,
      list: () => Promise.resolve(candidates),
      get: async (candidate) => getSkill(candidate),
    };
    skillCtx.skills.registerProvider(() => provider);
  });
}
