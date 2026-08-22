export type GlowVisualVersion = 'legacy' | 'hybrid' | 'liquid-v1';
export type GlowClimate = 'dawn' | 'time' | 'vital' | 'pearl' | 'emerald' | 'violet' | 'opal' | 'earth' | 'slate';

type Rule = { pattern: RegExp; climate: GlowClimate; version: GlowVisualVersion };

const RULES: Rule[] = [
  { pattern: /^\/today(?:\/|$)/, climate: 'dawn', version: 'liquid-v1' },
  { pattern: /^\/calendar(?:\/|$)/, climate: 'time', version: 'liquid-v1' },
  { pattern: /^\/(dashboard|briefings?)/, climate: 'dawn', version: 'hybrid' },
  { pattern: /^\/(planning|tasks|reminders|goals|projects|routines|habits|tomorrow|focus)/, climate: 'time', version: 'hybrid' },
  { pattern: /^\/(fitness|wellness|body|food|maintenance|workout-mode)/, climate: 'vital', version: 'hybrid' },
  { pattern: /^\/(beauty|beauty-lab|makeup|skincare|hair|closet)/, climate: 'pearl', version: 'hybrid' },
  { pattern: /^\/(finance|financial-brain|money)/, climate: 'emerald', version: 'hybrid' },
  { pattern: /^\/(brain|memory|timeline|observations|graph|connections|notices|concierge|knowledge)/, climate: 'violet', version: 'hybrid' },
  { pattern: /^\/(create|capture|creative|creative-studio|notes|inbox|gmail|import|resources|settings|vault)/, climate: 'opal', version: 'hybrid' },
  { pattern: /^\/(home|world|life|travel|saint-space)/, climate: 'earth', version: 'hybrid' },
  { pattern: /^\/(work|interview-mode)/, climate: 'slate', version: 'hybrid' },
];

export function getGlowVisualConfig(pathname: string) {
  const match = RULES.find((rule) => rule.pattern.test(pathname));
  return match ?? { climate: 'dawn' as GlowClimate, version: 'hybrid' as GlowVisualVersion };
}
