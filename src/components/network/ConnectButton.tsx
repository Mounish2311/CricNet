'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function ConnectButton({
  targetId,
  className = '',
}: {
  targetId: string;
  className?: string;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [label, setLabel] = useState('Connect');
  const [pending, setPending] = useState(false);

  async function connect() {
    if (pending || label !== 'Connect') return;
    // Flip pending synchronously so the button reacts on the click itself,
    // before the auth + insert round-trips resolve.
    setPending(true);
    try {
      // getSession() reads the cached session locally (no auth-server round-trip),
      // so the click resolves fast. The insert is still gated server-side by RLS
      // (requester_id must equal auth.uid()), so a spoofed id can't slip through.
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) return router.push('/login');
      if (user.id === targetId) return setLabel('Your profile');
      const { error } = await supabase
        .from('connections')
        .insert({ requester_id: user.id, addressee_id: targetId });
      // 23505 = unique violation: a request already exists
      setLabel(!error || error.code === '23505' ? 'Requested' : 'Failed');
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      onClick={connect}
      disabled={pending || label !== 'Connect'}
      className={`btn-pitch disabled:opacity-60 ${className}`}
    >
      {pending ? 'Connecting…' : label}
    </button>
  );
}
