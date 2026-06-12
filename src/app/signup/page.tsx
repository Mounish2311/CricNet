'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { UserRole } from '@/lib/types';

const ROLES: { value: UserRole; label: string; blurb: string }[] = [
  { value: 'player', label: 'Player', blurb: 'Showcase skills and get discovered' },
  { value: 'coach', label: 'Coach', blurb: 'Endorse and develop talent' },
  { value: 'scout', label: 'Scout / Team', blurb: 'Find and sign players' },
];

export default function Signup() {
  const supabase = createClient();
  const router = useRouter();
  const [role, setRole] = useState<UserRole>('player');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get('email'));
    const password = String(form.get('password'));
    const fullName = String(form.get('full_name'));

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return setError(error.message);

    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: fullName,
        role,
        location: String(form.get('location') || '') || null,
      });
      if (profileError) return setError(profileError.message);
    }
    router.push('/talent');
  }

  return (
    <div className="mx-auto mt-16 max-w-md">
      <h1 className="text-2xl font-bold">Join CricNet</h1>
      <form onSubmit={onSubmit} className="card mt-6 space-y-4">
        <div className="grid grid-cols-3 gap-2">
          {ROLES.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setRole(r.value)}
              className={`rounded-lg border p-3 text-left text-sm transition ${
                role === r.value ? 'border-pitch bg-pitch/10' : 'border-night-edge hover:border-pitch'
              }`}
            >
              <span className="block font-semibold">{r.label}</span>
              <span className="mt-1 block text-xs text-zinc-400">{r.blurb}</span>
            </button>
          ))}
        </div>
        <input name="full_name" required placeholder="Full name" className="input" />
        <input name="location" placeholder="Location (city)" className="input" />
        <input name="email" type="email" required placeholder="Email" className="input" />
        <input name="password" type="password" required minLength={8} placeholder="Password" className="input" />
        {error && <p className="text-sm text-leather-light">{error}</p>}
        <button className="btn-pitch w-full">Create account</button>
      </form>
    </div>
  );
}
