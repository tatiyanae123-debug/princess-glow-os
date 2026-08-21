'use client';

import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import type { GlowClimate } from '@/lib/glow-visual-migration';

type Depth = 0 | 1 | 2 | 3 | 4;

type BaseProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  climate?: GlowClimate;
  depth?: Depth;
};

export function GlowPage({ children, climate, className = '', ...props }: BaseProps) {
  return <div data-glow-page="true" data-glow-climate={climate} className={className} {...props}>{children}</div>;
}

export function GlowMatter({ children, climate, depth = 2, className = '', style, ...props }: BaseProps) {
  const depthStyle = { '--glow-depth': depth } as CSSProperties;
  return (
    <div
      data-glow-matter="true"
      data-glow-climate={climate}
      data-glow-depth={depth}
      className={className}
      style={{ ...depthStyle, ...style }}
      {...props}
    >
      {children}
    </div>
  );
}

export function GlowCard(props: BaseProps) {
  return <GlowMatter depth={props.depth ?? 2} {...props} />;
}

export function GlowHero(props: BaseProps) {
  return <GlowMatter depth={props.depth ?? 3} {...props} />;
}

export function GlowCompletion({ children, complete = false, className = '', ...props }: BaseProps & { complete?: boolean }) {
  return <div data-glow-complete={complete ? 'true' : 'false'} className={className} {...props}>{children}</div>;
}

export function GlowIntelligence({ children, className = '', ...props }: BaseProps) {
  return <div data-glow-intelligence="true" className={className} {...props}>{children}</div>;
}
