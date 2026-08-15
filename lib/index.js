import { registerSkills } from './skills.js';

export const name = 'dsh-claude-code-templates';
export { registerSkills, listSkills, getSkill, SKILL_ROOTS } from './skills.js';

/** Register the 884 upstream Claude Code skills with the dsh skill registry. */
export function apply(ctx) {
  registerSkills(ctx);
}
