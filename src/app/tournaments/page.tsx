import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function Tournaments() {
  const supabase = createClient();
  const { data: tournaments } = await supabase
    .from('tournaments')
    .select('*, organizer:profiles!tournaments_organizer_id_fkey(full_name)')
    .order('created_at', { ascending: false });

  return (
    <div className="mt-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tournaments</h1>
        <Link href="/tournaments/new" className="btn-pitch text-sm">
          Create tournament
        </Link>
      </div>
      {tournaments?.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {tournaments.map((t: any) => (
            <Link key={t.id} href={`/tournaments/${t.id}`} className="card transition hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">{t.name}</h2>
                <span className="rounded-full bg-pitch/20 px-2 py-0.5 text-xs capitalize text-pitch-light">
                  {t.tier}
                </span>
              </div>
              <p className="mt-1 text-sm text-zinc-400">
                {t.location ?? 'Location TBC'}
                {t.starts_on ? ` · from ${t.starts_on}` : ''}
              </p>
              {t.organizer && (
                <p className="mt-2 text-xs text-zinc-500">Organized by {t.organizer.full_name}</p>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <p className="card text-sm text-zinc-400">
          No tournaments yet. Create one to start recording verified matches.
        </p>
      )}
    </div>
  );
}
