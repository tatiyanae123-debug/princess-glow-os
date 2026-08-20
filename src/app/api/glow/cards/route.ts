import { auth } from '@/auth';
import { visualCardItems, workoutForDate } from '@/lib/personal-os/source-of-truth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function escapeXml(value: string) {
  return value.replace(/[<>&'\"]/g, (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '\"': '&quot;' })[char] ?? char);
}

function titleFor(kind: string) {
  const value = kind.toLowerCase();
  if (value.includes('sunday')) return 'Sunday Reset';
  if (value.includes('midday')) return 'Midday Reset';
  if (value.includes('night') || value.includes('evening')) return 'Night Ritual';
  if (value.includes('workout')) return workoutForDate(new Date()).name;
  if (value.includes('week')) return 'My Week';
  return 'Morning Ritual';
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return new Response('Unauthorized', { status: 401 });

  const url = new URL(request.url);
  const kind = url.searchParams.get('kind') || 'morning';
  const items = visualCardItems(kind).slice(0, 14);
  const title = titleFor(kind);
  const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const height = 1350;
  const rowStart = 335;
  const rowGap = Math.min(68, Math.floor((height - rowStart - 150) / Math.max(items.length, 1)));
  const rows = items.map((item, index) => {
    const y = rowStart + index * rowGap;
    return `<g><circle cx="112" cy="${y - 7}" r="15" fill="#FFFFFF" fill-opacity="0.55" stroke="#FFFFFF" stroke-opacity="0.9"/><path d="M105 ${y - 7} l5 5 l10 -12" fill="none" stroke="#6B5366" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><text x="150" y="${y}" font-family="Inter, Arial, sans-serif" font-size="28" fill="#302A31">${escapeXml(item)}</text></g>`;
  }).join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="${height}" viewBox="0 0 1080 ${height}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#FFF9FC"/><stop offset="0.32" stop-color="#F7EDF5"/><stop offset="0.66" stop-color="#E9F2F5"/><stop offset="1" stop-color="#F6EFE8"/></linearGradient>
    <radialGradient id="orb" cx="50%" cy="50%" r="50%"><stop stop-color="#FFFFFF" stop-opacity="0.96"/><stop offset="0.35" stop-color="#F6DCEF" stop-opacity="0.78"/><stop offset="0.7" stop-color="#DCEFF4" stop-opacity="0.52"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></radialGradient>
    <filter id="blur"><feGaussianBlur stdDeviation="38"/></filter>
  </defs>
  <rect width="1080" height="${height}" rx="54" fill="url(#bg)"/>
  <circle cx="860" cy="180" r="190" fill="url(#orb)" filter="url(#blur)"/>
  <circle cx="180" cy="1140" r="260" fill="#E7EAFB" opacity="0.42" filter="url(#blur)"/>
  <text x="88" y="105" font-family="Inter, Arial, sans-serif" font-size="20" letter-spacing="5" fill="#8F768B">GLOW OS</text>
  <text x="88" y="205" font-family="Georgia, 'Times New Roman', serif" font-size="62" fill="#27232A">${escapeXml(title)}</text>
  <text x="90" y="252" font-family="Inter, Arial, sans-serif" font-size="24" fill="#756C76">${escapeXml(date)}</text>
  <line x1="88" y1="290" x2="992" y2="290" stroke="#FFFFFF" stroke-opacity="0.8"/>
  ${rows}
  <text x="88" y="1275" font-family="Georgia, 'Times New Roman', serif" font-size="25" font-style="italic" fill="#6E6370">Calm is success. Consistency is the glow.</text>
  </svg>`;

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'private, no-store',
      'Content-Disposition': `inline; filename="glow-${kind.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.svg"`,
    },
  });
}
