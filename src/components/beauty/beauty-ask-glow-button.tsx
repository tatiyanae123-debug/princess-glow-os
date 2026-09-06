'use client';

import { Sparkles } from 'lucide-react';

export function BeautyAskGlowButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => document.dispatchEvent(new CustomEvent('glow:open', { detail: { prefill: 'Beauty: ' } }))}
      aria-label="Ask Glow about Beauty"
    >
      <Sparkles size={14}/> Ask Glow
    </button>
  );
}
