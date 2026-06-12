'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface PlayerRef {
  id: string;
  full_name: string;
}

interface PlayerStats {
  player: PlayerRef;
  matches: number;
  runs: number;
  strikeRate: number;
  wickets: number;
  economy: number;
}

function PlayerPicker({
  label,
  onPick,
  picked,
}: {
  label: string;
  onPick: (p: PlayerRef | null) => void;
  picked: PlayerRef | null;
}) {
  const supabase = createClient();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlayerRef[]>([]);

  async function search(q: string) {
    setQuery(q);
    if (q.length < 2) return setResults([]);
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name')
      .ilike('full_name', `%${q}%`)
      .limit(5);
    setResults((data ?? []) as PlayerRef[]);
  }

  return (
    <div className="relative flex-1">
      <p className="mb-1 text-xs text-zinc-400">{label}</p>
      <input
        className="input"
        placeholder="Search player…"
        value={picked ? picked.full_name : query}
        onChange={(e) => {
          if (picked) onPick(null);
          search(e.target.value);
        }}
        onFocus={() => picked && onPick(null)}
      />
      {results.length > 0 && !picked && (
        <ul className="absolute z-10 mt-1 w-full rounded-lg border border-night-edge bg-night-card text-sm">
          {results.map((p) => (
            <li key={p.id}>
              <button
                onClick={() => {
                  onPick(p);
                  setResults([]);
                  setQuery('');
                }}
                className="block w-full px-3 py-2 text-left hover:bg-pitch-dark"
              >
                {p.full_name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CompareRow({
  label,
  a,
  b,
  lowerIsBetter = false,
}: {
  label: string;
  a: number;
  b: number;
  lowerIsBetter?: boolean;
}) {
  const max = Math.max(a, b, 1);
  const aWins = lowerIsBetter ? a < b && a > 0 : a > b;
  const bWins = lowerIsBetter ? b < a && b > 0 : b > a;
  return (
    <div className="py-3">
      <div className="flex items-center justify-between text-sm">
        <span className={aWins ? 'font-bold text-pitch-light' : 'text-zinc-200'}>{a}</span>
        <span className="text-xs uppercase tracking-wide text-zinc-500">{label}</span>
        <span className={bWins ? 'font-bold text-pitch-light' : 'text-zinc-200'}>{b}</span>
      </div>
      <div className="mt-1 flex items-center gap-2">
        <div className="flex h-2 flex-1 justify-end overflow-hidden rounded bg-night">
          <div
            className={`h-full rounded ${aWins ? 'bg-pitch-light' : 'bg-zinc-600'}`}
            style={{ width: `${(a / max) * 100}%` }}
          />
        </div>
        <div className="flex h-2 flex-1 overflow-hidden rounded bg-night">
          <div
            className={`h-full rounded ${bWins ? 'bg-pitch-light' : 'bg-zinc-600'}`}
            style={{ width: `${(b / max) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function Compare() {
  const supabase = createClient();
  const [left, setLeft] = useState<PlayerRef | null>(null);
  const [right, setRight] = useState<PlayerRef | null>(null);
  const [stats, setStats] = useState<[PlayerStats, PlayerStats] | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadStats(p: PlayerRef): Promise<PlayerStats> {
    const [{ data: bat }, { data: bowl }] = await Promise.all([
      supabase.from('verified_batting_stats').select('*').eq('profile_id', p.id).maybeSingle(),
      supabase.from('verified_bowling_stats').select('*').eq('profile_id', p.id).maybeSingle(),
    ]);
    return {
      player: p,
      matches: bat?.matches ?? 0,
      runs: bat?.runs ?? 0,
      strikeRate: Number(bat?.strike_rate) || 0,
      wickets: bowl?.wickets ?? 0,
      economy: Number(bowl?.economy) || 0,
    };
  }

  async function compare() {
    if (!left || !right) return;
    setLoading(true);
    const [a, b] = await Promise.all([loadStats(left), loadStats(right)]);
    setStats([a, b]);
    setLoading(false);
  }

  return (
    <div className="mx-auto mt-10 max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Player Comparison</h1>
      <p className="text-sm text-zinc-400">
        Compare verified stats sourced from scored matches — not self-reported numbers.
      </p>
      <div className="card space-y-4">
        <div className="flex gap-4">
          <PlayerPicker label="Player A" picked={left} onPick={setLeft} />
          <PlayerPicker label="Player B" picked={right} onPick={setRight} />
        </div>
        <button
          onClick={compare}
          disabled={!left || !right || loading}
          className="btn-pitch w-full disabled:opacity-50"
        >
          {loading ? 'Comparing…' : 'Compare'}
        </button>
      </div>

      {stats && (
        <div className="card">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-stadium">{stats[0].player.full_name}</h2>
            <span className="text-xs text-zinc-500">vs</span>
            <h2 className="font-semibold text-stadium">{stats[1].player.full_name}</h2>
          </div>
          <div className="mt-2 divide-y divide-night-edge">
            <CompareRow label="Matches" a={stats[0].matches} b={stats[1].matches} />
            <CompareRow label="Runs" a={stats[0].runs} b={stats[1].runs} />
            <CompareRow label="Strike rate" a={stats[0].strikeRate} b={stats[1].strikeRate} />
            <CompareRow label="Wickets" a={stats[0].wickets} b={stats[1].wickets} />
            <CompareRow label="Economy" a={stats[0].economy} b={stats[1].economy} lowerIsBetter />
          </div>
        </div>
      )}
    </div>
  );
}
