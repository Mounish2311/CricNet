import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function TournamentDetail({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const [{ data: tournament }, { data: matches }] = await Promise.all([
    supabase.from('tournaments').select('*').eq('id', params.id).single(),
    supabase
      .from('matches')
      .select('*, a:teams!matches_team_a_fkey(name), b:teams!matches_team_b_fkey(name)')
      .eq('tournament_id', params.id)
      .order('scheduled_at'),
  ]);

  if (!tournament) notFound();

  return (
    <div className="mt-10 space-y-6">
      <header className="card">
        <h1 className="text-2xl font-bold">{tournament.name}</h1>
        <p className="mt-1 text-sm capitalize text-zinc-400">
          {tournament.tier} · {tournament.location ?? 'Location TBC'}
        </p>
      </header>
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
    </div>
  );
}
