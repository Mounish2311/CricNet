import { NextResponse } from 'next/server';
import { getLiveMatches } from '@/lib/cricket/api';

export const dynamic = 'force-dynamic';

export async function GET() {
  const matches = await getLiveMatches();
  return NextResponse.json({ matches });
}
