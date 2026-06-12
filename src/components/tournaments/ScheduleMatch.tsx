'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

// Creates two teams (if needed), registers them in the tournament, and schedules a match
export default function ScheduleMatch({ tournamentId }: { tournamentId: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return router.push('/login');

    setSaving(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const names = [String(form.get('team_a')), String(form.get('team_b'))];

    const teamIds: string[] = [];
    for (const name of names) {
      const { data, error } = await supabase
        .from('teams')
        .insert({ name, created_by: user.id })
        .select('id')
        .single();
      if (error) {
        setSaving(false);
        return setError(error.message);
      }
      teamIds.push(data.id);
      await supabase
        .from('tournament_teams')
        .insert({ tournament_id: tournamentId, team_id: data.id });
    }

    const { error: matchError } = await supabase.from('matches').insert({
      tournament_id: tournamentId,
      team_a: teamIds[0],
      team_b: teamIds[1],
      overs_per_side: Number(form.get('overs')) || 20,
      round: Number(form.get('round')) || 1,
      scheduled_at: String(form.get('scheduled_at') || '') || null,
    });
    setSaving(false);
    if (matchError) return setError(matchError.message);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-3">
      <h2 className="font-semibold">Schedule a match</h2>
      <div className="grid grid-cols-2 gap-3">
        <input name="team_a" required placeholder="Team A" className="input" />
        <input name="team_b" required placeholder="Team B" className="input" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <label className="text-xs text-zinc-400">
          Overs
          <input name="overs" type="number" min={1} max={50} defaultValue={20} className="input mt-1" />
        </label>
        <label className="text-xs text-zinc-400">
          Round
          <input name="round" type="number" min={1} max={6} defaultValue={1} className="input mt-1" />
        </label>
        <label className="text-xs text-zinc-400">
          Date &amp; time
          <input name="scheduled_at" type="datetime-local" className="input mt-1" />
        </label>
      </div>
      {error && <p className="text-sm text-leather-light">{error}</p>}
      <button disabled={saving} className="btn-pitch disabled:opacity-50">
        {saving ? 'Scheduling…' : 'Add match'}
      </button>
    </form>
  );
}
