import type { Skill } from '../types/gamification';

/**
 * Skill costs in crystals
 */
export const SKILL_COST_DEEP_WORK = 50;
export const SKILL_COST_ZEN_BREAK = 30;
export const SKILL_COST_NIGHT_OWL = 40;

/**
 * Available skills that can be unlocked with crystals.
 * Each skill provides unique benefits to enhance the focus experience.
 */
export const SKILLS: Skill[] = [
  {
    id: 'deep-work-mode',
    name: 'Deep Work Mode',
    description: 'Extended 90-minute focus sessions for deep concentration',
    cost: SKILL_COST_DEEP_WORK,
    icon: '🧠',
    effect: () => {
      // This would be implemented to add a 90-minute preset option
      console.log('Deep Work Mode unlocked: 90-minute sessions enabled');
    }
  },
  {
    id: 'zen-break',
    name: 'Zen Break',
    description: 'Guided meditation and breathing exercises during breaks',
    cost: SKILL_COST_ZEN_BREAK,
    icon: '🧘',
    effect: () => {
      // This would be implemented to show meditation timer during breaks
      console.log('Zen Break unlocked: Meditation features enabled');
    }
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Dark theme optimization and night-friendly features',
    cost: SKILL_COST_NIGHT_OWL,
    icon: '🦉',
    effect: () => {
      // This would be implemented to enhance dark mode
      console.log('Night Owl unlocked: Enhanced dark mode enabled');
    }
  }
];

/**
 * Get a skill by its ID
 */
export const findSkill = (skillId: string): Skill | undefined => {
  return SKILLS.find(skill => skill.id === skillId);
};

/**
 * Check if a skill is affordable with current crystals
 */
export const canAffordSkill = (skillId: string, crystals: number): boolean => {
  const skill = findSkill(skillId);
  return skill ? crystals >= skill.cost : false;
};
