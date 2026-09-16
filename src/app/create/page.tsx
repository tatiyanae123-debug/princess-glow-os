import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';

const CREATE_ROOMS = [
  {
    href: '/inbox',
    eyebrow: 'Capture',
    label: 'Inbox',
    description: 'Collect fresh thoughts, classify them, and choose where they belong.',
  },
  {
    href: '/projects',
    eyebrow: 'Build',
    label: 'Projects',
    description: 'Move active ideas into concrete projects, next actions, and finished work.',
  },
  {
    href: '/import',
    eyebrow: 'Bring in',
    label: 'Import',
    description: 'Bring existing notes, files, and source material into Glow without rebuilding them by hand.',
  },
  {
    href: '/concierge',
    eyebrow: 'Shape',
    label: 'Concierge',
    description: 'Turn an intention into an organized next move using the context already inside Glow.',
  },
] as const;

export default function CreatePage() {
  return (
    <AppShell>
      <SectionPage
        eyebrow="Create World"
        title="Create"
        description="Capture an idea, give it structure, and move it into real work without leaving the shared Glow system."
      >
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="Create rooms">
          {CREATE_ROOMS.map((room) => (
            <Link
              key={room.href}
              href={room.href}
              className="editorial-surface group flex min-h-44 flex-col rounded-[18px] p-5 transition hover:-translate-y-0.5 focus-visible:-translate-y-0.5"
            >
              <p className="glow-eyebrow">{room.eyebrow}</p>
              <h2 className="glow-display mt-3 text-2xl text-[var(--glow-text)]">{room.label}</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--glow-text-muted)]">{room.description}</p>
              <span className="mt-auto pt-6 text-xs font-semibold text-[var(--glow-accent)]">Open room →</span>
            </Link>
          ))}
        </section>
      </SectionPage>
    </AppShell>
  );
}
