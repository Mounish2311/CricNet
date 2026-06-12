'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface PlayerRef {
  id: string;
  full_name: string;
}

// Search player profiles and add them to a team roster.
// Rostered players become selectable as batter/bowler during live scoring.
export default function TeamRoster({ teamId, teamName }: { teamId: string; teamName: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [roster, setRoster] = useState<PlayerRef[]>([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlayerRef[]>([]);

  async function loadRoster() {
    const { data } = await supabase
      .from('team_players')
      .select('profile:profiles(id, full_name)')
      .eq('team_id', teamId);
    setRoster(((data ?? []) as any[]).map((r) => r.profile).filter(Boolean));
  }

  useEffect(() => {
    loadRoster();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);

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

  async function add(p: PlayerRef) {
    await supabase.from('team_players').insert({ team_id: teamId, profile_id: p.id });
    setQuery('');
    setResults([]);
    loadRoster();
    router.refresh();
  }

  return (
    <div className="rounded-lg bg-night p-3">
      <p className="text-sm font-medium">{teamName}</p>
      <ul className="mt-2 flex flex-wrap gap-1">
        {roster.map((p) => (
          <li key={p.id} className="rounded-full bg-pitch-dark px-2 py-0.5 text-xs text-pitch-light">
            {p.full_name}
          </li>
        ))}
        {!roster.length && <li className="text-xs text-zinc-500">No players added yet</li>}
      </ul>
      <div className="relative mt-2">
        <input
          className="input text-xs"
          placeholder="Search players to add…"
          value={query}
          onChange={(e) => search(e.target.value)}
        />
        {results.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full rounded-lg border border-night-edge bg-night-card text-sm">
            {results.map((p) => (
              <li key={p.id}>
                <button
                  onClick={() => add(p)}
                  className="block w-full px-3 py-2 text-left hover:bg-pitch-dark"
                >
                  {p.full_name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
