import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync('src/components/voice/glow-voice-command.tsx', 'utf8');
const styles = readFileSync('src/app/glow-aura.css', 'utf8');

describe('Living Glow Aura', () => {
  it('uses responsive text-free portrait and widescreen art', () => {
    expect(source).toContain('/glow/aura/living-aura-portrait-v1.webp');
    expect(source).toContain('/glow/aura/living-aura-wide-v1.webp');
    expect(source).toContain('(min-width: 760px) and (orientation: landscape)');
  });

  it('models the visible interaction states and approval boundary', () => {
    for (const state of ['waking', 'listening', 'understanding', 'speaking', 'creating', 'acting', 'complete', 'protecting', 'error']) expect(source).toContain(`'${state}'`);
    expect(source).toContain('Nothing meaningful changes until you approve.');
    expect(source).toContain('Approve changes');
  });

  it('speaks naturally and carries visible light to the affected world', () => {
    expect(source).toContain('SpeechSynthesisUtterance');
    expect(source).toContain("window.speechSynthesis.speak");
    expect(source).toContain('travelTo(target)');
    expect(source).toContain('data-action-target');
    expect(styles).toContain('glow-travel-pearl');
    expect(styles).toContain("data-action-target='plan'");
  });

  it('calibrates portrait and landscape tablet compositions separately', () => {
    expect(styles).toContain('(min-width:700px) and (orientation:portrait)');
    expect(styles).toContain('(min-width:1024px) and (orientation:landscape)');
  });

  it('supports accessible closing, keyboard recovery, scrolling and reduced motion', () => {
    expect(source).toContain("event.key === 'Escape'");
    expect(source).toContain('aria-modal="true"');
    expect(styles).toContain('overflow:auto');
    expect(styles).toContain('prefers-reduced-motion:reduce');
  });
});
