import type { NewsItem, NewsScope } from '@/lib/types';
import { mockNews } from './mock-data';

const TTL = (Number(process.env.NEWS_CACHE_TTL) || 300) * 1000;

interface CacheEntry<T> {
  data: T;
  expires: number;
}

// Simple in-memory cache so we don't refetch RSS on every request. Resets on
// server restart / serverless cold start — swap for Redis/Supabase in prod.
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

// ---------------------------------------------------------------------------
// ESPNcricinfo RSS feeds — no API key required.
// Feed IDs map to teams/categories (0 = global, 6 = India). Full list:
//   https://www.espncricinfo.com/rss/content/feeds/
//   - international -> 0.xml (all world cricket)
//   - national      -> 6.xml (India news)
//   - local         -> no public feed; served from mock data / user uploads
// ---------------------------------------------------------------------------
const SCOPE_FEED: Partial<Record<NewsScope, string>> = {
  international: 'https://www.espncricinfo.com/rss/content/story/feeds/0.xml',
  national: 'https://www.espncricinfo.com/rss/content/story/feeds/6.xml',
};

const MAX_PER_SCOPE = 6;

// Minimal HTML-entity decode for RSS text fields.
function decode(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .trim();
}

function tagText(block: string, name: string): string | null {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'i'));
  return m ? decode(m[1]) : null;
}

function attrValue(block: string, name: string, attr: string): string | null {
  const m = block.match(new RegExp(`<${name}\\b[^>]*\\b${attr}="([^"]*)"`, 'i'));
  return m ? m[1] : null;
}

function toIso(pubDate: string | null): string {
  if (!pubDate) return new Date().toISOString();
  const t = new Date(pubDate);
  return Number.isNaN(t.getTime()) ? new Date().toISOString() : t.toISOString();
}

function parseRss(xml: string, scope: NewsScope): NewsItem[] {
  const items: NewsItem[] = [];
  const blocks = xml.match(/<item>[\s\S]*?<\/item>/gi) ?? [];

  for (let i = 0; i < blocks.length && items.length < MAX_PER_SCOPE; i++) {
    const block = blocks[i];
    const title = tagText(block, 'title');
    if (!title) continue;

    const image =
      tagText(block, 'coverImages') ||
      attrValue(block, 'media:content', 'url') ||
      null;

    // Prefer the canonical <url>, fall back to <link>, then <guid>.
    const url =
      tagText(block, 'url') || tagText(block, 'link') || tagText(block, 'guid') || '#';

    items.push({
      id: `${scope}-${tagText(block, 'guid') ?? i}`,
      scope,
      title,
      summary: tagText(block, 'description') ?? '',
      source: 'ESPNcricinfo',
      url,
      imageUrl: image,
      publishedAt: toIso(tagText(block, 'pubDate')),
      origin: 'live',
    });
  }

  return items;
}

async function fetchScope(scope: NewsScope): Promise<NewsItem[]> {
  const feed = SCOPE_FEED[scope];
  if (!feed) return [];

  const res = await fetch(feed, {
    // ESPN rejects requests without a UA. Identify ourselves politely.
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CricNet/1.0; news-feed)' },
    next: { revalidate: Math.floor(TTL / 1000) },
  });
  if (!res.ok) throw new Error(`RSS ${scope} ${res.status}`);

  return parseRss(await res.text(), scope);
}

export async function getCricketNews(): Promise<NewsItem[]> {
  const cached = getCached<NewsItem[]>('cricketNews');
  if (cached) return cached;

  const liveScopes: NewsScope[] = ['international', 'national'];

  const live = await Promise.all(
    liveScopes.map(async (scope) => {
      try {
        const items = await fetchScope(scope);
        // Empty payload (feed hiccup) -> fall back to sample items for this scope.
        return items.length ? items : mockNews.filter((m) => m.scope === scope);
      } catch {
        // Network failure / rate limit: serve samples so the UI never breaks.
        return mockNews.filter((m) => m.scope === scope);
      }
    })
  );

  // Local cricket has no public feed yet — placeholder until user uploads land.
  const local = mockNews.filter((m) => m.scope === 'local');

  const items = [...live.flat(), ...local];
  setCached('cricketNews', items);
  return items;
}
