'use client';

import { useState } from 'react';
import type { LiveMatch, MatchCategory } from '@/lib/types';

const TABS: { key: MatchCategory; label: string }[] = [
  { key: 'international', label: 'International' },
  { key: 'league', label: 'League' },
  { key: 'domestic', label: 'Domestic' },
  { key: 'women', label: 'Women' },
];

function MatchCard({ m }: { m: LiveMatch }) {
  const isLive = m.matchStarted && !m.matchEnded;
  return (
    <article className="card">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">{m.name}</h2>
        {isLive ? (
          <span className="flex shrink-0 items-center gap-1 text-xs text-leather-light">
            <span className="h-2 w-2 animate-pulse rounded-full bg-leather-light" /> LIVE
          </span>
        ) : m.matchEnded ? (
          <span className="shrink-0 rounded-full bg-zinc-700/40 px-2 py-0.5 text-xs text-zinc-300">
            Result
          </span>
        ) : (
          <span className="shrink-0 rounded-full bg-stadium/10 px-2 py-0.5 text-xs text-stadium">
            Upcoming
          </span>
        )}
      </div>
      <p className="mt-1 text-xs text-zinc-400">{m.venue}</p>
      <div className="mt-3 space-y-1">
        {m.score.map((s) => (
          <p key={s.inning} className="flex justify-between text-sm">
            <span className="text-zinc-300">{s.inning}</span>
            <span className="font-mono font-semibold text-stadium">
              {s.r}/{s.w} <span className="text-zinc-500">({s.o})</span>
            </span>
          </p>
        ))}
        {!m.score.length && <p className="text-sm text-zinc-500">Yet to begin</p>}
      </div>
      <p className="mt-3 text-xs text-pitch-light">{m.status}</p>
    </article>
  );
}

export default function LiveScores({ matches }: { matches: LiveMatch[] }) {
  // Default to the first tab that actually has matches, so the user isn't
  // greeted by an empty International tab when only league games are on.
  const counts = TABS.map((t) => matches.filter((m) => m.category === t.key).length);
  const firstNonEmpty = TABS[counts.findIndex((c) => c > 0)]?.key ?? 'international';
  const [active, setActive] = useState<MatchCategory>(firstNonEmpty);

  // Order within a tab: live first, then upcoming, then finished results —
  // so recent scores stay visible but never bury an in-progress match.
  const rank = (m: LiveMatch) =>
    m.matchStarted && !m.matchEnded ? 0 : !m.matchStarted ? 1 : 2;
  const shown = matches
    .filter((m) => m.category === active)
    .sort((a, b) => rank(a) - rank(b));

  return (
    <div className="mt-6">
      <div className="flex flex-wrap gap-2 border-b border-night-edge">
        {TABS.map((t, i) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={`relative px-4 py-2 text-sm font-medium transition ${
              active === t.key ? 'text-stadium' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {t.label}
            <span className="ml-1.5 text-xs text-zinc-500">{counts[i]}</span>
            {active === t.key && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-stadium" />
            )}
          </button>
        ))}
      </div>

      {shown.length ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((m) => (
            <MatchCard key={m.id} m={m} />
          ))}
        </div>
      ) : (
        <p className="card mt-6 text-sm text-zinc-400">
          No recent {active} matches right now. Check back soon.
        </p>
      )}
    </div>
  );
}
