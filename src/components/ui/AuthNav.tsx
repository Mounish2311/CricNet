'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

// Reactive auth area for the navbar: shows Log in / Join CricNet when signed
// out, and Log out when signed in. Subscribes to Supabase auth state so it
// flips instantly on login/logout — no manual refresh needed.
export default function AuthNav() {
  const supabase = createClient();
  const router = useRouter();
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (active) setSignedIn(!!session);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(!!session);
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function logout() {
    if (pending) return;
    setPending(true);
    await supabase.auth.signOut();
    // signOut clears the session locally and onAuthStateChange flips the UI;
    // send them home and refresh so any server-rendered, auth-gated content resets.
    router.push('/');
    router.refresh();
  }

  // Until we know the auth state, render a spacer to avoid flashing the wrong buttons.
  if (signedIn === null) return <div className="h-8" />;

  if (signedIn) {
    return (
      <button
        onClick={logout}
        disabled={pending}
        className="rounded-lg border border-night-edge px-3 py-1.5 text-sm text-zinc-300 transition hover:text-white disabled:opacity-60"
      >
        {pending ? 'Logging out…' : 'Log out'}
      </button>
    );
  }

  return (
    <>
      <Link href="/login" className="px-3 py-1.5 text-sm text-zinc-300 hover:text-white">
        Log in
      </Link>
      <Link href="/signup" className="btn-pitch text-sm">
        Join CricNet
      </Link>
    </>
  );
}
