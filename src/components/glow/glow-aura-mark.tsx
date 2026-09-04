'use client';

import type { GlowState, GlowWorld } from '@/lib/intelligence/glow-operating-model';

type GlowAuraMarkProps = {
  state: GlowState;
  world: GlowWorld;
  size?: 'compact' | 'expanded';
  className?: string;
};

export function GlowAuraMark({ state, world, size = 'compact', className = '' }: GlowAuraMarkProps) {
  return (
    <span
      className={`glow-aura-mark glow-aura-mark--${size} ${className}`}
      data-glow-state={state}
      data-glow-world={world.toLowerCase()}
      aria-hidden="true"
    >
      <span className="glow-aura-mark__field" />
      <span className="glow-aura-mark__orbit glow-aura-mark__orbit--outer" />
      <span className="glow-aura-mark__orbit glow-aura-mark__orbit--inner" />
      <span className="glow-aura-mark__beam" />
      <span className="glow-aura-mark__wing glow-aura-mark__wing--left" />
      <span className="glow-aura-mark__wing glow-aura-mark__wing--right" />
      <span className="glow-aura-mark__fold glow-aura-mark__fold--one" />
      <span className="glow-aura-mark__fold glow-aura-mark__fold--two" />
      <span className="glow-aura-mark__core" />
      <span className="glow-aura-mark__flare glow-aura-mark__flare--horizontal" />
      <span className="glow-aura-mark__flare glow-aura-mark__flare--vertical" />
      <span className="glow-aura-mark__drop glow-aura-mark__drop--one" />
      <span className="glow-aura-mark__drop glow-aura-mark__drop--two" />
      <span className="glow-aura-mark__drop glow-aura-mark__drop--three" />
    </span>
  );
}
