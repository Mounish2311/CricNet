'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function Login() {
  const supabase = createClient();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get('email')),
      password: String(form.get('password')),
    });
    if (error) return setError(error.message);
    router.push('/talent');
  }

  return (
    <div className="mx-auto mt-20 max-w-sm">
      <h1 className="text-2xl font-bold">Welcome back</h1>
      <form onSubmit={onSubmit} className="card mt-6 space-y-4">
        <input name="email" type="email" required placeholder="Email" className="input" />
        <input name="password" type="password" required placeholder="Password" className="input" />
        {error && <p className="text-sm text-leather-light">{error}</p>}
        <button className="btn-pitch w-full">Log in</button>
      </form>
    </div>
  );
}
