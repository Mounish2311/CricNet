'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface Row {
  id: string;
  status: string;
  requester_id: string;
  addressee_id: string;
  requester: { full_name: string; role: string } | null;
  addressee: { full_name: string; role: string } | null;
}

export default function Connections() {
  const supabase = createClient();
  const router = useRouter();
  const [me, setMe] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  async function load(uid: string) {
    const { data } = await supabase
      .from('connections')
      .select(
        '*, requester:profiles!connections_requester_id_fkey(full_name, role), addressee:profiles!connections_addressee_id_fkey(full_name, role)'
      )
      .order('created_at', { ascending: false });
    setRows((data ?? []) as Row[]);
    setLoading(false);
  }

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return router.push('/login');
      setMe(user.id);
      load(user.id);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function respond(id: string, status: 'accepted' | 'declined') {
    await supabase.from('connections').update({ status }).eq('id', id);
    if (me) load(me);
  }

  const incoming = rows.filter((r) => r.status === 'pending' && r.addressee_id === me);
  const outgoing = rows.filter((r) => r.status === 'pending' && r.requester_id === me);
  const accepted = rows.filter((r) => r.status === 'accepted');

  if (loading) return <p className="mt-10 text-sm text-zinc-400">Loading connections…</p>;

  return (
    <div className="mt-10 space-y-6">
      <h1 className="text-2xl font-bold">Connections</h1>

      <section className="card">
        <h2 className="font-semibold">Incoming requests</h2>
        {incoming.length ? (
          <ul className="mt-3 space-y-2">
            {incoming.map((r) => (
              <li key={r.id} className="flex items-center justify-between rounded-lg bg-night p-3 text-sm">
                <span>
                  <Link href={`/profile/${r.requester_id}`} className="font-medium hover:text-stadium">
                    {r.requester?.full_name}
                  </Link>{' '}
                  <span className="capitalize text-zinc-500">· {r.requester?.role}</span>
                </span>
                <span className="flex gap-2">
                  <button onClick={() => respond(r.id, 'accepted')} className="btn-pitch px-3 py-1 text-xs">
                    Accept
                  </button>
                  <button onClick={() => respond(r.id, 'declined')} className="btn-leather px-3 py-1 text-xs">
                    Decline
                  </button>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-zinc-400">No pending requests.</p>
        )}
      </section>

      <section className="card">
        <h2 className="font-semibold">Your network ({accepted.length})</h2>
        {accepted.length ? (
          <ul className="mt-3 space-y-2">
            {accepted.map((r) => {
              const otherId = r.requester_id === me ? r.addressee_id : r.requester_id;
              const other = r.requester_id === me ? r.addressee : r.requester;
              return (
                <li key={r.id} className="flex items-center justify-between rounded-lg bg-night p-3 text-sm">
                  <span>
                    <Link href={`/profile/${otherId}`} className="font-medium hover:text-stadium">
                      {other?.full_name}
                    </Link>{' '}
                    <span className="capitalize text-zinc-500">· {other?.role}</span>
                  </span>
                  <Link href={`/messages/${otherId}`} className="btn-leather px-3 py-1 text-xs">
                    Message
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-zinc-400">
            No connections yet. Find people in the <Link href="/talent" className="text-pitch-light">Talent Feed</Link>.
          </p>
        )}
      </section>

      {outgoing.length > 0 && (
        <section className="card">
          <h2 className="font-semibold">Sent requests</h2>
          <ul className="mt-3 space-y-2">
            {outgoing.map((r) => (
              <li key={r.id} className="rounded-lg bg-night p-3 text-sm text-zinc-300">
                {r.addressee?.full_name} <span className="text-xs text-zinc-500">· pending</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
