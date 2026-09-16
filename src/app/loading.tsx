import { GlowSystemState } from '@/components/glow/system-state-surface';

export default function Loading() {
  return (
    <GlowSystemState
      kind="loading"
      role="status"
      eyebrow="Glow OS · Current state"
      title="Gathering this room."
      description="Glow is bringing the room, its current context and your connected information into view."
    >
      <div className="space-y-3" aria-hidden="true">
        <div className="h-16 animate-pulse rounded-[22px] border border-[var(--glow-border)] bg-[var(--glow-surface-muted)]" />
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="h-24 animate-pulse rounded-[20px] border border-[var(--glow-border)] bg-[var(--glow-surface-muted)]" />
          <div className="h-24 animate-pulse rounded-[20px] border border-[var(--glow-border)] bg-[var(--glow-surface-muted)]" />
          <div className="h-24 animate-pulse rounded-[20px] border border-[var(--glow-border)] bg-[var(--glow-surface-muted)]" />
        </div>
      </div>
    </GlowSystemState>
  );
}
