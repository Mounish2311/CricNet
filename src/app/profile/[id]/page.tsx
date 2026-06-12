import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import StatBars3D from '@/components/three/StatBars3D';

export const dynamic = 'force-dynamic';

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const [{ data: profile }, { data: batting }, { data: bowling }, { data: endorsements }, { data: videos }] =
    await Promise.all([
      supabase.from('profiles').select('*').eq('id', params.id).single(),
      supabase.from('verified_batting_stats').select('*').eq('profile_id', params.id).maybeSingle(),
      supabase.from('verified_bowling_stats').select('*').eq('profile_id', params.id).maybeSingle(),
      supabase
        .from('endorsements')
        .select('skill, comment, endorser:profiles!endorsements_endorser_id_fkey(full_name)')
        .eq('endorsee_id', params.id),
      supabase.from('videos').select('*').eq('profile_id', params.id),
    ]);

  if (!profile) notFound();

  const stats = [
    { label: `Matches ${batting?.matches ?? 0}`, value: Math.min((batting?.matches ?? 0) / 50, 1), color: '#2fae6f' },
    { label: `Runs ${batting?.runs ?? 0}`, value: Math.min((batting?.runs ?? 0) / 1000, 1), color: '#f5d77a' },
    { label: `Wickets ${bowling?.wickets ?? 0}`, value: Math.min((bowling?.wickets ?? 0) / 50, 1), color: '#c0392b' },
    { label: `SR ${batting?.strike_rate ?? 0}`, value: Math.min((Number(batting?.strike_rate) || 0) / 200, 1), color: '#1f7a4d' },
  ];

  return (
    <div className="mt-10 space-y-6">
      <header className="card flex flex-wrap items-center gap-5">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-pitch-dark text-3xl font-bold text-pitch-light">
          {profile.full_name.charAt(0)}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{profile.full_name}</h1>
          <p className="capitalize text-zinc-400">
            {profile.role}
            {profile.secondary_role ? ` · ${profile.secondary_role}` : ''}
            {profile.location ? ` · ${profile.location}` : ''}
          </p>
          {profile.bio && <p className="mt-2 max-w-xl text-sm text-zinc-300">{profile.bio}</p>}
        </div>
        <div className="flex gap-2">
          <button className="btn-pitch">Connect</button>
          <button className="btn-leather">Message</button>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="font-semibold">
            Verified career stats{' '}
            <span className="ml-1 rounded-full bg-pitch/20 px-2 py-0.5 text-xs text-pitch-light">
              from scored matches
            </span>
          </h2>
          <StatBars3D stats={stats} />
        </div>
        <div className="card">
          <h2 className="font-semibold">Endorsements</h2>
          {endorsements?.length ? (
            <ul className="mt-3 space-y-3">
              {endorsements.map((e: any, i: number) => (
                <li key={i} className="rounded-lg bg-night p-3 text-sm">
                  <span className="rounded-full bg-stadium/10 px-2 py-0.5 text-xs text-stadium">{e.skill}</span>
                  {e.comment && <p className="mt-2 text-zinc-300">“{e.comment}”</p>}
                  <p className="mt-1 text-xs text-zinc-500">— {e.endorser?.full_name}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-zinc-400">No endorsements yet.</p>
          )}
        </div>
      </section>

      <section className="card">
        <h2 className="font-semibold">Showcase videos</h2>
        {videos?.length ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {videos.map((v: any) => (
              <div key={v.id} className="rounded-lg bg-night p-3 text-sm">
                <p className="font-medium">{v.title}</p>
                <p className="text-xs capitalize text-zinc-500">{v.category?.replaceAll('_', ' ')}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-zinc-400">No videos uploaded yet.</p>
        )}
      </section>
    </div>
  );
}
