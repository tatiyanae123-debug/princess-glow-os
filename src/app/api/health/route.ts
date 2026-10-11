import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export function GET() {
  const configured = Boolean(process.env.DATABASE_URL && process.env.AUTH_SECRET && process.env.PRINCESS_GOOGLE_CLIENT_ID && process.env.PRINCESS_GOOGLE_CLIENT_SECRET);
  return NextResponse.json(
    { service: 'glow-os', status: configured ? 'configured' : 'setup_required' },
    { status: configured ? 200 : 503, headers: { 'Cache-Control': 'no-store' } },
  );
}
