import type { LiveMatch } from '@/lib/types';
import { mockLiveMatches } from './mock-data';

const TTL = (Number(process.env.CRICKET_CACHE_TTL) || 60) * 1000;

interface CacheEntry<T> {
  data: T;
  expires: number;
}

// Simple in-memory cache to stay within CricAPI free-tier limits.
// Swap for Redis/Supabase table cache in production.
const cache = new Map<string, CacheEntry<unknown>>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && entry.expires > Date.now()) return entry.data as T;
  cache.delete(key);
  return null;
}

function setCached<T>(key: string, data: T) {
  cache.set(key, { data, expires: Date.now() + TTL });
}

export async function getLiveMatches(): Promise<LiveMatch[]> {
  const cached = getCached<LiveMatch[]>('currentMatches');
  if (cached) return cached;

  const key = process.env.CRICAPI_KEY;
  if (!key) return mockLiveMatches;

  try {
    const res = await fetch(
      `https://api.cricapi.com/v1/currentMatches?apikey=${key}&offset=0`,
      { next: { revalidate: 0 } }
    );
    if (!res.ok) throw new Error(`CricAPI ${res.status}`);
    const json = await res.json();
    if (json.status !== 'success' || !Array.isArray(json.data)) {
      throw new Error('CricAPI limit reached or bad payload');
    }
    const matches: LiveMatch[] = json.data.map((m: any) => ({
      id: m.id,
      name: m.name,
      status: m.status,
      venue: m.venue ?? '',
      teams: m.teams ?? [],
      score: (m.score ?? []).map((s: any) => ({
        inning: s.inning,
        r: s.r,
        w: s.w,
        o: s.o,
      })),
      matchStarted: !!m.matchStarted,
      matchEnded: !!m.matchEnded,
      source: 'live' as const,
    }));
    setCached('currentMatches', matches);
    return matches;
  } catch {
    // Rate limited or network failure: serve mock data so the UI never breaks
    return mockLiveMatches;
  }
}
