import Reveal from '@/components/ui/Reveal';
import type { NewsItem, NewsScope } from '@/lib/types';

const SCOPES: { key: NewsScope; label: string; blurb: string; accent: string }[] = [
  {
    key: 'international',
    label: 'International',
    blurb: 'World cricket — Tests, ODIs, T20Is and ICC events',
    accent: 'text-stadium',
  },
  {
    key: 'national',
    label: 'National',
    blurb: 'Domestic season, selections and the national setup',
    accent: 'text-pitch-light',
  },
  {
    key: 'local',
    label: 'Local',
    blurb: 'Club, district and grassroots cricket near you',
    accent: 'text-leather-light',
  },
];

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diff = Date.now() - then;
  const hrs = Math.round(diff / 3_600_000);
  if (hrs < 1) return 'just now';
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
}

function NewsCard({ item }: { item: NewsItem }) {
  const external = item.url && item.url !== '#';
  return (
    <a
      href={external ? item.url : undefined}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className={`card block h-full overflow-hidden transition ${
        external ? 'hover:-translate-y-1' : 'cursor-default'
      }`}
    >
      <div className="relative -mx-5 -mt-5 mb-4 aspect-[16/9] overflow-hidden">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-night-card via-pitch-dark/40 to-night" />
        )}
        <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2 py-0.5 text-[10px] uppercase tracking-wide text-zinc-200 backdrop-blur">
          {item.source}
        </span>
      </div>
      <h3 className="text-sm font-semibold leading-snug">{item.title}</h3>
      {item.summary && (
        <p className="mt-2 line-clamp-3 text-xs text-zinc-400">{item.summary}</p>
      )}
      <p className="mt-3 text-[11px] text-zinc-500">{timeAgo(item.publishedAt)}</p>
    </a>
  );
}

export default function NewsSections({ items }: { items: NewsItem[] }) {
  // International & national come from ESPNcricinfo RSS; local is always sample
  // data for now. Only flag "demo" when a *live* scope fell back to mock —
  // i.e. the RSS fetch failed — not for the expected local placeholder.
  const liveFellBack = items.some(
    (i) => i.scope !== 'local' && i.origin === 'mock'
  );

  return (
    <div id="news" className="mt-24 scroll-mt-24 space-y-16">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.3em] text-stadium/80">
              Latest cricket news
            </p>
            <h2 className="text-3xl font-bold">From the world game to your ground</h2>
          </div>
          {liveFellBack && (
            <span className="rounded-full bg-stadium/10 px-3 py-1 text-xs text-stadium">
              Showing sample news — live feed unavailable
            </span>
          )}
        </div>
      </Reveal>

      {SCOPES.map((scope) => {
        const scoped = items.filter((i) => i.scope === scope.key);
        if (!scoped.length) return null;
        return (
          <section key={scope.key} className="space-y-5">
            <Reveal>
              <div className="flex items-baseline gap-3 border-b border-night-edge pb-3">
                <h3 className={`text-xl font-bold ${scope.accent}`}>{scope.label}</h3>
                <p className="text-sm text-zinc-500">{scope.blurb}</p>
              </div>
            </Reveal>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {scoped.map((item, i) => (
                <Reveal key={item.id} delay={i * 80}>
                  <NewsCard item={item} />
                </Reveal>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
