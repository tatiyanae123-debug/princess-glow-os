'use client';

export function GlowActionButton() {
  return <button type="button" onClick={() => document.dispatchEvent(new Event('glow:voice-open'))} className="living-glow-trigger" aria-label="Ask Glow"><span className="living-glow-trigger__presence" aria-hidden="true"><i /><i /><i /></span><span>Ask Glow</span></button>;
}
