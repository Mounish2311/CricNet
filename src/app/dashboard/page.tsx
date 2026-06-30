import { getLiveMatches } from '@/lib/cricket/api';
import LiveScores from '@/components/cricket/LiveScores';

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
      <LiveScores matches={matches} />
    </div>
  );
}
