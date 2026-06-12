'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface TeamRef {
  id: string;
  name: string;
}

export default function MatchControls({
  matchId,
  status,
  teamA,
  teamB,
}: {
  matchId: string;
  status: string;
  teamA: TeamRef | null;
  teamB: TeamRef | null;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [winner, setWinner] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function start() {
    const { error } = await supabase.from('matches').update({ status: 'live' }).eq('id', matchId);
    error ? setError(error.message) : router.refresh();
  }

  async function complete() {
    if (!winner) return setError('Select the winning team first.');
    const { error } = await supabase
      .from('matches')
      .update({ status: 'completed', winner_team: winner })
      .eq('id', matchId);
    error ? setError(error.message) : router.refresh();
  }

  if (status === 'completed') {
    const name = winner || (teamA && teamB ? '' : '');
    return (
      <div className="card flex items-center justify-between">
        <span className="text-sm text-zinc-300">Match completed</span>
        <span className="rounded-full bg-pitch/20 px-3 py-1 text-xs text-pitch-light">
          Stats verified on player profiles
        </span>
      </div>
    );
  }

  return (
    <div className="card flex flex-wrap items-center gap-3">
      {status === 'scheduled' && (
        <button onClick={start} className="btn-pitch text-sm">
          Start match
        </button>
      )}
      {status === 'live' && (
        <>
          <span className="flex items-center gap-1 text-xs text-leather-light">
            <span className="h-2 w-2 animate-pulse rounded-full bg-leather-light" /> LIVE
          </span>
          <select className="input w-auto text-sm" value={winner} onChange={(e) => setWinner(e.target.value)}>
            <option value="">Select winner…</option>
            {teamA && <option value={teamA.id}>{teamA.name}</option>}
            {teamB && <option value={teamB.id}>{teamB.name}</option>}
          </select>
          <button onClick={complete} className="btn-leather text-sm">
            Complete match
          </button>
        </>
      )}
      {error && <p className="w-full text-sm text-leather-light">{error}</p>}
    </div>
  );
}
