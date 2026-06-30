'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import GoogleButton from '@/components/auth/GoogleButton';
import { getLastMethod, setLastMethod, type AuthMethod } from '@/lib/auth/last-method';

export default function Login() {
  const supabase = createClient();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [last, setLast] = useState<AuthMethod | null>(null);

  // localStorage isn't available during SSR, so read the hint after mount.
  useEffect(() => setLast(getLastMethod()), []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get('email')),
      password: String(form.get('password')),
    });
    if (error) {
      setPending(false);
      return setError(error.message);
    }
    setLastMethod('email');
    router.push('/talent');
  }

  return (
    <div className="mx-auto mt-20 max-w-sm">
      <h1 className="text-2xl font-bold">Welcome back</h1>
      <div className="card mt-6 space-y-4">
        <div className="space-y-1.5">
          <GoogleButton />
          {last === 'google' && (
            <p className="text-center text-xs text-pitch">Last used Google</p>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-zinc-500">
          <span className="h-px flex-1 bg-night-edge" />
          or
          <span className="h-px flex-1 bg-night-edge" />
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <input name="email" type="email" required placeholder="Email" className="input" />
          <input name="password" type="password" required placeholder="Password" className="input" />
          {error && <p className="text-sm text-leather-light">{error}</p>}
          <button disabled={pending} className="btn-pitch w-full disabled:opacity-60">
            {pending ? 'Logging in…' : 'Log in'}
          </button>
          {last === 'email' && (
            <p className="text-center text-xs text-pitch">Last used email &amp; password</p>
          )}
        </form>
      </div>
    </div>
  );
}
