import 'server-only';
import { getVercelOidcToken } from '@vercel/oidc';

export async function getGlowGatewayToken() {
  if (process.env.AI_GATEWAY_API_KEY) return process.env.AI_GATEWAY_API_KEY;
  try {
    const token = await getVercelOidcToken({ expirationBufferMs: 60_000 });
    if (token) return token;
  } catch {}
  return process.env.VERCEL_OIDC_TOKEN || '';
}
