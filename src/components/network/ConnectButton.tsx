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

  async function connect() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return router.push('/login');
    if (user.id === targetId) return setLabel('Your profile');
    const { error } = await supabase
      .from('connections')
      .insert({ requester_id: user.id, addressee_id: targetId });
    // 23505 = unique violation: a request already exists
    setLabel(!error || error.code === '23505' ? 'Requested' : 'Failed');
  }

  return (
    <button
      onClick={connect}
      disabled={label !== 'Connect'}
      className={`btn-pitch disabled:opacity-60 ${className}`}
    >
      {label}
    </button>
  );
}
