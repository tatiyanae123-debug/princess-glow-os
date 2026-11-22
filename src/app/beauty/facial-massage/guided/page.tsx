import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function GuidedGuaShaPage() {
  redirect('/beauty/gua-sha/guided');
}
