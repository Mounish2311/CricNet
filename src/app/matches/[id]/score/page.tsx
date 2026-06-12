import { createClient } from '@/lib/supabase/server';
import BallEntry from '@/components/scoring/BallEntry';
import { inningsTotal } from '@/lib/scoring';
import type { BallEvent } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function ScorePage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: balls } = await supabase
    .from('balls')
    .select('*')
    .eq('match_id', params.id)
    .order('id');

  const events = (balls ?? []) as BallEvent[];
  const inn1 = inningsTotal(events, 1);
  const inn2 = inningsTotal(events, 2);

  return (
    <div className="mt-10 grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Match Scorecard</h1>
        {[
          { label: 'Innings 1', t: inn1 },
          { label: 'Innings 2', t: inn2 },
        ].map(({ label, t }) => (
          <div key={label} className="card flex items-center justify-between">
            <span className="text-sm text-zinc-300">{label}</span>
            <span className="font-mono text-xl font-bold text-stadium">
              {t.runs}/{t.wickets}{' '}
              <span className="text-sm text-zinc-500">
                ({Math.floor(t.legalBalls / 6)}.{t.legalBalls % 6} ov)
              </span>
            </span>
          </div>
        ))}
        <p className="text-xs text-zinc-500">
          Every ball recorded here feeds verified batting and bowling stats on player profiles.
        </p>
      </div>
      <BallEntry matchId={params.id} />
    </div>
  );
}
