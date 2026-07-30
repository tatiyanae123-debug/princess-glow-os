import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Not implemented yet' }, { status: 501 });
}

export async function PATCH() {
  return NextResponse.json({ message: 'Not implemented yet' }, { status: 501 });
}

export async function DELETE() {
  return new NextResponse(null, { status: 501 });
}
