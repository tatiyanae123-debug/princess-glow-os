import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

// /money was an orphan route: never linked from navigation.ts or the
// sidebar, and it duplicated /finance (the real, V3-rebuilt Money &
// Growth room) with an older, unstyled implementation. Per the "no
// generic fallback pages" audit, it now redirects to the real room
// instead of leaving a stale duplicate reachable by direct URL.
export default function MoneyPage() {
  redirect('/finance');
}
