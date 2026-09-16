import Link from 'next/link';
import { GlowSystemState } from '@/components/glow/system-state-surface';

export default function NotFound() {
  return (
    <GlowSystemState
      kind="not-found"
      eyebrow="Glow OS · Location"
      title="That room is not available."
      description="The address does not map to a current Glow room. Return Home or open Life to keep moving through the connected system."
    >
      <div className="flex flex-wrap gap-3">
        <Link href="/home" className="inline-flex min-h-11 items-center rounded-2xl bg-[var(--glow-text)] px-4 py-2 text-sm font-medium text-white">
          Return Home
        </Link>
        <Link href="/life" className="inline-flex min-h-11 items-center rounded-2xl border border-[var(--glow-border)] px-4 py-2 text-sm font-medium">
          Open Life
        </Link>
      </div>
    </GlowSystemState>
  );
}
