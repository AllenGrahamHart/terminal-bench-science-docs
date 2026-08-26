import { type NextRequest, NextResponse } from 'next/server';

import { readHarborLeaderboardWithDomains } from '@/lib/harbor-leaderboard.server';
import {
  TERMINAL_BENCH_LEADERBOARD,
  TERMINAL_BENCH_PACKAGE,
} from '@/lib/leaderboard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

function notFound() {
  return NextResponse.json(
    { error: { message: 'Not found', code: 'not_found' } },
    { status: 404 },
  );
}

export async function GET(request: NextRequest) {
  if (
    process.env.NODE_ENV !== 'development' ||
    !LOCAL_HOSTS.has(request.nextUrl.hostname)
  ) {
    return notFound();
  }

  const packageName = request.nextUrl.searchParams.get('package');
  const leaderboardName = request.nextUrl.searchParams.get('name');
  if (
    packageName !== TERMINAL_BENCH_PACKAGE ||
    leaderboardName !== TERMINAL_BENCH_LEADERBOARD
  ) {
    return notFound();
  }

  const apiKey = process.env.HARBOR_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      {
        error: {
          message: 'HARBOR_API_KEY is not configured',
          code: 'not_configured',
        },
      },
      { status: 503 },
    );
  }

  try {
    const payload = await readHarborLeaderboardWithDomains(
      apiKey,
      TERMINAL_BENCH_PACKAGE,
      TERMINAL_BENCH_LEADERBOARD,
    );

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error(
      'Failed to load the private Harbor leaderboard:',
      error instanceof Error ? error.message : error,
    );
    return NextResponse.json(
      {
        error: {
          message: 'Failed to load the private Harbor leaderboard',
          code: 'upstream_error',
        },
      },
      { status: 502 },
    );
  }
}
