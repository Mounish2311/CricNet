import { getLiveMatches } from '@/lib/cricket/api';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const matches = await getLiveMatches();
  const usingMock = matches.some((m) => m.source === 'mock');

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Live Scores</h1>
        {usingMock && (
          <span className="rounded-full bg-stadium/10 px-3 py-1 text-xs text-stadium">
            Demo data — add CRICAPI_KEY for live feeds
          </span>
        )}
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {matches.map((m) => (
          <article key={m.id} className="card">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">{m.name}</h2>
              {m.matchStarted && !m.matchEnded && (
                <span className="flex items-center gap-1 text-xs text-leather-light">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-leather-light" /> LIVE
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
            </div>
            <p className="mt-3 text-xs text-pitch-light">{m.status}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
