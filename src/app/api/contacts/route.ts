import { auth } from '@/auth';
import { getGoogleContacts } from '@/lib/google/contacts-client';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ ok: false, reason: 'not_signed_in' }, { status: 401 });
  }

  const result = await getGoogleContacts(session.user.id);
  if (!result.ok) {
    const status = result.reason === 'insufficient_scope' ? 403 : result.reason === 'not_connected' ? 401 : 502;
    return Response.json(result, { status });
  }

  return Response.json(result, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
