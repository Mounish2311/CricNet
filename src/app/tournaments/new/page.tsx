'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const TIERS = ['local', 'district', 'state', 'national'];

export default function NewTournament() {
  const supabase = createClient();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return router.push('/login');

    const form = new FormData(e.currentTarget);
    const { data, error } = await supabase
      .from('tournaments')
      .insert({
        organizer_id: user.id,
        name: String(form.get('name')),
        tier: String(form.get('tier')),
        location: String(form.get('location') || '') || null,
        starts_on: String(form.get('starts_on') || '') || null,
        ends_on: String(form.get('ends_on') || '') || null,
      })
      .select('id')
      .single();
    if (error) return setError(error.message);
    router.push(`/tournaments/${data.id}`);
  }

  return (
    <div className="mx-auto mt-16 max-w-md">
      <h1 className="text-2xl font-bold">Create tournament</h1>
      <form onSubmit={onSubmit} className="card mt-6 space-y-4">
        <input name="name" required placeholder="Tournament name" className="input" />
        <select name="tier" className="input capitalize" defaultValue="local">
          {TIERS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <input name="location" placeholder="Location" className="input" />
        <label className="block text-xs text-zinc-400">
          Start date
          <input name="starts_on" type="date" className="input mt-1" />
        </label>
        <label className="block text-xs text-zinc-400">
          End date
          <input name="ends_on" type="date" className="input mt-1" />
        </label>
        {error && <p className="text-sm text-leather-light">{error}</p>}
        <button className="btn-pitch w-full">Create</button>
      </form>
    </div>
  );
}
