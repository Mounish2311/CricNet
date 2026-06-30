'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import GoogleButton from '@/components/auth/GoogleButton';
import { setLastMethod } from '@/lib/auth/last-method';

export default function Signup() {
  const supabase = createClient();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const email = String(form.get('email'));
    const password = String(form.get('password'));
    const fullName = String(form.get('full_name'));

    // Stash the name in user metadata so the onboarding screen can prefill it,
    // mirroring how Google hands us a name. Role is chosen on /onboarding.
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) {
      setPending(false);
      return setError(error.message);
    }
    setLastMethod('email');
    router.push('/onboarding');
  }

  return (
    <div className="mx-auto mt-16 max-w-md">
      <h1 className="text-2xl font-bold">Join CricNet</h1>
      <div className="card mt-6 space-y-4">
        <GoogleButton />
        <div className="flex items-center gap-3 text-xs text-zinc-500">
          <span className="h-px flex-1 bg-night-edge" />
          or
          <span className="h-px flex-1 bg-night-edge" />
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <input name="full_name" required placeholder="Full name" className="input" />
          <input name="email" type="email" required placeholder="Email" className="input" />
          <input
            name="password"
            type="password"
            required
            minLength={8}
            placeholder="Password"
            className="input"
          />
          {error && <p className="text-sm text-leather-light">{error}</p>}
          <button disabled={pending} className="btn-pitch w-full disabled:opacity-60">
            {pending ? 'Creating…' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}
