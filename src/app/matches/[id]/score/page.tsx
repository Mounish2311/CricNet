import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import BallEntry, { type RosterPlayer } from '@/components/scoring/BallEntry';
import MatchControls from '@/components/scoring/MatchControls';
import TeamRoster from '@/components/tournaments/TeamRoster';
import { inningsTotal } from '@/lib/scoring';
import type { BallEvent } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function ScorePage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const [{ data: match }, { data: balls }] = await Promise.all([
    supabase
      .from('matches')
      .select('*, a:teams!matches_team_a_fkey(id, name), b:teams!matches_team_b_fkey(id, name)')
      .eq('id', params.id)
      .single(),
    supabase.from('balls').select('*').eq('match_id', params.id).order('id'),
  ]);

  if (!match) notFound();

  const teamIds = [match.team_a, match.team_b].filter(Boolean) as string[];
  const { data: roster } = teamIds.length
    ? await supabase
        .from('team_players')
        .select('team_id, profile:profiles(id, full_name)')
        .in('team_id', teamIds)
    : { data: [] };

  const teamName = (id: string) =>
    id === match.a?.id ? match.a?.name : id === match.b?.id ? match.b?.name : 'Team';
  const players: RosterPlayer[] = ((roster ?? []) as any[])
    .filter((r) => r.profile)
    .map((r) => ({ id: r.profile.id, name: r.profile.full_name, teamName: teamName(r.team_id) }));

  const events = (balls ?? []) as BallEvent[];
  const inn1 = inningsTotal(events, 1);
  const inn2 = inningsTotal(events, 2);

  return (
    <div className="mt-10 space-y-6">
      <h1 className="text-2xl font-bold">
        {match.a?.name ?? 'Team A'} <span className="text-zinc-500">vs</span> {match.b?.name ?? 'Team B'}
      </h1>

      <MatchControls
        matchId={params.id}
        status={match.status}
        teamA={match.a ?? null}
        teamB={match.b ?? null}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          {[
            { label: `Innings 1`, t: inn1 },
            { label: `Innings 2`, t: inn2 },
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
          <div className="space-y-3">
            {match.a && <TeamRoster teamId={match.a.id} teamName={match.a.name} />}
            {match.b && <TeamRoster teamId={match.b.id} teamName={match.b.name} />}
          </div>
          <p className="text-xs text-zinc-500">
            Every attributed ball feeds verified batting and bowling stats on player profiles.
          </p>
        </div>
        <BallEntry matchId={params.id} players={players} />
      </div>
    </div>
  );
}
