import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import PlayerCard from '@/components/ui/PlayerCard';
import TalentFilters from '@/components/talent/TalentFilters';
import type { Profile } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: { role?: string; skill_level?: string; location?: string };
}

export default async function TalentFeed({ searchParams }: Props) {
  const supabase = createClient();
  let query = supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(30);

  if (searchParams.role) query = query.eq('role', searchParams.role);
  if (searchParams.skill_level) query = query.eq('skill_level', searchParams.skill_level);
  if (searchParams.location) query = query.ilike('location', `%${searchParams.location}%`);

  const { data: profiles } = await query;

  return (
    <div className="mt-10 space-y-6">
      <h1 className="text-2xl font-bold">Talent Feed</h1>
      <Suspense>
        <TalentFilters />
      </Suspense>
      {profiles?.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(profiles as Profile[]).map((p) => (
            <PlayerCard key={p.id} profile={p} />
          ))}
        </div>
      ) : (
        <p className="card text-sm text-zinc-400">
          No profiles match these filters yet. Be the first — create your CricNet profile.
        </p>
      )}
    </div>
  );
}
