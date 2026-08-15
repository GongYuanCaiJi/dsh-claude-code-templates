/**
 * Types for the dsh-claude-code-templates plugin.
 *
 * The plugin ships the upstream davila7/claude-code-templates skill library
 * verbatim and registers it with the dsh skill registry (`ctx.skills`) as a
 * bundled provider. See THIRD_PARTY_NOTICES.md for the pinned upstream commit.
 */
import type { Context } from '@deepseek-ai/cordis';
import type { SkillCandidate, SkillDefinition } from '@deepseek-ai/dsh-skill';

/** Cordis plugin entry point. */
export declare function apply(ctx: Context): void;

/** Register the bundled skill provider into ctx.skills (dsh-lens pattern). */
export declare function registerSkills(ctx: Context): void;

/** Build all candidates from the shipped roots, deterministically ordered. */
export declare function listSkills(roots?: readonly string[]): SkillCandidate[];

/** Load the full skill body for a candidate; undefined when the file is gone. */
export declare function getSkill(candidate: SkillCandidate): SkillDefinition | undefined;

/** Absolute paths of the shipped skill roots (upstream layout preserved). */
export declare const SKILL_ROOTS: readonly string[];

