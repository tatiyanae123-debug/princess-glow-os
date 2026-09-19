import { redirect } from 'next/navigation';

export default async function LegacyHomeDeepRoute({ params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  redirect(`/life/home/${path.join('/')}`);
}
