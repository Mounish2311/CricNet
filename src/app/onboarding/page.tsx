'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { UserRole } from '@/lib/types';

const ROLES: { value: UserRole; label: string; blurb: string }[] = [
  { value: 'player', label: 'Player', blurb: 'Showcase skills and get discovered' },
  { value: 'coach', label: 'Coach', blurb: 'Endorse and develop talent' },
  { value: 'scout', label: 'Scout / Team', blurb: 'Find and sign players' },
];

export default function Onboarding() {
  const supabase = createClient();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [role, setRole] = useState<UserRole>('player');
  const [fullName, setFullName] = useState('');
  const [location, setLocation] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Gate the screen: must be signed in, and if a profile already exists this
  // step is done — bounce straight to the app. Prefill the name from whatever
  // the auth provider (or manual signup) gave us.
  useEffect(() => {
    let active = true;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) return router.replace('/login');

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();
      if (!active) return;
      if (profile) {
        // Already onboarded (e.g. a pre-existing account). Backfill the metadata
        // flag so the middleware guard stops redirecting here, then move on.
        if (!user.user_metadata?.onboarded) {
          await supabase.auth.updateUser({ data: { onboarded: true } });
        }
        return router.replace('/talent');
      }

      const meta = user.user_metadata ?? {};
      setFullName(meta.full_name ?? meta.name ?? '');
      setReady(true);
    })();
    return () => {
      active = false;
    };
  }, [supabase, router]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    if (!fullName.trim()) return setError('Please enter your name.');
    setPending(true);
    setError(null);

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) {
      setPending(false);
      return router.replace('/login');
    }

    // RLS guarantees a user can only insert their own profile (auth.uid() = id).
    const { error: profileError } = await supabase.from('profiles').insert({
      id: user.id,
      full_name: fullName.trim(),
      role,
      location: location.trim() || null,
    });
    if (profileError) {
      setPending(false);
      return setError(profileError.message);
    }

    // Flag onboarding done in user metadata so middleware can cheaply skip the
    // redirect on future requests without a DB read. The profile row is still
    // the source of truth.
    await supabase.auth.updateUser({ data: { onboarded: true } });
    router.push('/talent');
  }

  if (!ready) {
    return (
      <div className="mx-auto mt-20 max-w-md text-center text-sm text-zinc-400">Loading…</div>
    );
  }

  return (
    <div className="mx-auto mt-16 max-w-md">
      <h1 className="text-2xl font-bold">You&apos;re in. What brings you to CricNet?</h1>
      <p className="mt-2 text-sm text-zinc-400">Pick the role that fits you best.</p>
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
        <input
          name="full_name"
          required
          placeholder="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="input"
        />
        <input
          name="location"
          placeholder="Location (city)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="input"
        />
        {error && <p className="text-sm text-leather-light">{error}</p>}
        <button disabled={pending} className="btn-pitch w-full disabled:opacity-60">
          {pending ? 'Setting up…' : 'Enter CricNet'}
        </button>
      </form>
    </div>
  );
}
