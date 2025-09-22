import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth-guard';
import { getHornetsLast10Stats } from '@/lib/repo/players';

export async function GET() {
  try {
    const gate = await requireSession();
    if (gate instanceof NextResponse) return gate;

    const data = await getHornetsLast10Stats();

    return NextResponse.json(
      { players: data.players, lastUpdated: data.lastUpdated },
      { headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=600' } }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('[players last10] supabase fallback error:', msg);
    return NextResponse.json(
      { players: [], lastUpdated: new Date().toISOString() },
      { headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=60' } }
    );
  }
}
