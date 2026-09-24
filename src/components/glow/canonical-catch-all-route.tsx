import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { CanonicalExperiencePage } from '@/components/glow/canonical-experience-page';
import { canonicalExperienceFor } from '@/lib/glow-world/canonical-experiences';

export async function CanonicalCatchAllRoute({ base, segments }: { base: string; segments?: string[] }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const suffix = (segments ?? []).filter(Boolean).join('/');
  const path = suffix ? `${base}/${suffix}` : base;
  const spec = canonicalExperienceFor(path);
  if (!spec) notFound();
  return <AppShell><CanonicalExperiencePage spec={spec} /></AppShell>;
}
