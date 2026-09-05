import 'server-only';

import { getValidGoogleAccessToken, REQUIRED_SCOPES } from '@/lib/google/tokens';

const PEOPLE_API = 'https://people.googleapis.com/v1';
const MAX_CONTACTS = 60;

export type GlowContact = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  photoUrl: string | null;
  organization: string | null;
};

export type ContactsFetchResult =
  | { ok: true; contacts: GlowContact[] }
  | { ok: false; reason: 'not_connected' | 'insufficient_scope' | 'revoked' | 'error' };

type RawPerson = {
  resourceName?: string;
  names?: Array<{ displayName?: string }>;
  phoneNumbers?: Array<{ value?: string }>;
  emailAddresses?: Array<{ value?: string }>;
  photos?: Array<{ url?: string; default?: boolean }>;
  organizations?: Array<{ name?: string; title?: string }>;
};

function normalizePerson(person: RawPerson): GlowContact | null {
  const name = person.names?.[0]?.displayName?.trim();
  if (!name) return null;

  const organization = person.organizations?.[0];
  const organizationText = [organization?.title, organization?.name].filter(Boolean).join(' · ') || null;

  return {
    id: person.resourceName ?? name,
    name,
    phone: person.phoneNumbers?.find((item) => item.value)?.value ?? null,
    email: person.emailAddresses?.find((item) => item.value)?.value ?? null,
    photoUrl: person.photos?.find((item) => item.url && !item.default)?.url ?? null,
    organization: organizationText,
  };
}

/**
 * Returns real contacts from the signed-in user's Google Contacts account.
 * Read-only. Glow never writes, edits, or deletes a contact from this client.
 */
export async function getGoogleContacts(userId: string): Promise<ContactsFetchResult> {
  const token = await getValidGoogleAccessToken(userId, REQUIRED_SCOPES.contacts);
  if (!token.ok) {
    if (token.reason === 'not_connected') return { ok: false, reason: 'not_connected' };
    if (token.reason === 'insufficient_scope') return { ok: false, reason: 'insufficient_scope' };
    if (token.reason === 'revoked' || token.reason === 'missing_refresh_token') return { ok: false, reason: 'revoked' };
    return { ok: false, reason: 'error' };
  }

  const params = new URLSearchParams({
    personFields: 'names,phoneNumbers,emailAddresses,photos,organizations',
    pageSize: String(MAX_CONTACTS),
    sortOrder: 'LAST_MODIFIED_DESCENDING',
  });

  try {
    const response = await fetch(`${PEOPLE_API}/people/me/connections?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token.accessToken}` },
      cache: 'no-store',
    });

    if (response.status === 401) return { ok: false, reason: 'revoked' };
    if (response.status === 403) return { ok: false, reason: 'insufficient_scope' };
    if (!response.ok) return { ok: false, reason: 'error' };

    const data = (await response.json()) as { connections?: RawPerson[] };
    const contacts = (data.connections ?? [])
      .map(normalizePerson)
      .filter((contact): contact is GlowContact => contact !== null);

    return { ok: true, contacts };
  } catch {
    return { ok: false, reason: 'error' };
  }
}
