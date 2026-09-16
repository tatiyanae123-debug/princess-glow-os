'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { GlowSystemState } from '@/components/glow/system-state-surface';

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[Glow OS] route error', error);
  }, [error]);

  return (
    <GlowSystemState
      kind="error"
      role="alert"
      eyebrow="Glow OS · Recovery"
      title="This room did not finish loading."
      description="Retry the room first. You can also return Home without changing the rest of your Glow OS information."
      reference={error.digest}
    >
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={reset} className="min-h-11 rounded-2xl bg-[var(--glow-text)] px-4 py-2 text-sm font-medium text-white">
          Try again
        </button>
        <Link href="/home" className="inline-flex min-h-11 items-center rounded-2xl border border-[var(--glow-border)] px-4 py-2 text-sm font-medium">
          Return Home
        </Link>
      </div>
    </GlowSystemState>
  );
}
