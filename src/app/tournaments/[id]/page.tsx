import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ScheduleMatch from '@/components/tournaments/ScheduleMatch';
import Bracket from '@/components/tournaments/Bracket';

export const dynamic = 'force-dynamic';

interface StandingRow {
  teamId: string;
  name: string;
  played: number;
  won: number;
  lost: number;
  points: number;
}

export default async function TournamentDetail({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const [{ data: tournament }, { data: matches }, { data: entries }] = await Promise.all([
    supabase.from('tournaments').select('*').eq('id', params.id).single(),
    supabase
      .from('matches')
      .select('*, a:teams!matches_team_a_fkey(name), b:teams!matches_team_b_fkey(name)')
      .eq('tournament_id', params.id)
      .order('scheduled_at'),
    supabase
      .from('tournament_teams')
      .select('team_id, team:teams(name)')
      .eq('tournament_id', params.id),
  ]);

  if (!tournament) notFound();

  // Compute standings: 2 points per win from completed matches
  const table = new Map<string, StandingRow>();
  for (const e of (entries ?? []) as any[]) {
    table.set(e.team_id, {
      teamId: e.team_id,
      name: e.team?.name ?? 'Team',
      played: 0,
      won: 0,
      lost: 0,
      points: 0,
    });
  }
  for (const m of (matches ?? []) as any[]) {
    if (m.status !== 'completed' || !m.winner_team) continue;
    const loser = m.winner_team === m.team_a ? m.team_b : m.team_a;
    const w = table.get(m.winner_team);
    const l = table.get(loser);
    if (w) {
      w.played++;
      w.won++;
      w.points += 2;
    }
    if (l) {
      l.played++;
      l.lost++;
    }
  }
  const standings = [...table.values()].sort((a, b) => b.points - a.points || b.won - a.won);

  return (
    <div className="mt-10 space-y-6">
      <header className="card">
        <h1 className="text-2xl font-bold">{tournament.name}</h1>
        <p className="mt-1 text-sm capitalize text-zinc-400">
          {tournament.tier} · {tournament.location ?? 'Location TBC'}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card">
          <h2 className="font-semibold">Matches</h2>
          {matches?.length ? (
            <ul className="mt-3 space-y-2">
              {matches.map((m: any) => (
                <li key={m.id} className="flex items-center justify-between rounded-lg bg-night p-3 text-sm">
                  <span>
                    {m.a?.name ?? 'TBC'} <span className="text-zinc-500">vs</span> {m.b?.name ?? 'TBC'}
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="text-xs capitalize text-zinc-400">{m.status}</span>
                    <Link href={`/matches/${m.id}/score`} className="btn-pitch px-3 py-1 text-xs">
                      {m.status === 'completed' ? 'Scorecard' : 'Score live'}
                    </Link>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-zinc-400">No matches scheduled yet.</p>
          )}
        </section>

        <section className="card">
          <h2 className="font-semibold">Standings</h2>
          {standings.length ? (
            <table className="mt-3 w-full text-sm">
              <thead className="text-left text-xs text-zinc-500">
                <tr>
                  <th className="pb-2">Team</th>
                  <th className="pb-2 text-center">P</th>
                  <th className="pb-2 text-center">W</th>
                  <th className="pb-2 text-center">L</th>
                  <th className="pb-2 text-right">Pts</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((s, i) => (
                  <tr key={s.teamId} className="border-t border-night-edge">
                    <td className="py-2">
                      <span className="mr-2 text-xs text-zinc-500">{i + 1}</span>
                      {s.name}
                    </td>
                    <td className="py-2 text-center">{s.played}</td>
                    <td className="py-2 text-center text-pitch-light">{s.won}</td>
                    <td className="py-2 text-center text-leather-light">{s.lost}</td>
                    <td className="py-2 text-right font-semibold text-stadium">{s.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="mt-3 text-sm text-zinc-400">Standings appear once matches are completed.</p>
          )}
        </section>
      </div>

      {(matches?.length ?? 0) > 0 && (
        <section className="card">
          <h2 className="font-semibold">Bracket</h2>
          <div className="mt-4">
            <Bracket matches={matches as any} />
          </div>
        </section>
      )}

      <ScheduleMatch tournamentId={params.id} />
    </div>
  );
}
