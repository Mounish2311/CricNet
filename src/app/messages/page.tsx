import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function Inbox() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // RLS restricts rows to conversations involving the current user
  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);

  const conversations = new Map<string, { last: string; at: string }>();
  for (const m of messages ?? []) {
    const other = m.sender_id === user.id ? m.recipient_id : m.sender_id;
    if (!conversations.has(other)) {
      conversations.set(other, { last: m.body, at: m.created_at });
    }
  }

  const ids = [...conversations.keys()];
  const { data: profiles } = ids.length
    ? await supabase.from('profiles').select('id, full_name, role').in('id', ids)
    : { data: [] };
  const nameOf = new Map((profiles ?? []).map((p: any) => [p.id, p]));

  return (
    <div className="mt-10 space-y-6">
      <h1 className="text-2xl font-bold">Messages</h1>
      {ids.length ? (
        <ul className="space-y-2">
          {ids.map((id) => {
            const p = nameOf.get(id);
            const c = conversations.get(id)!;
            return (
              <li key={id}>
                <Link href={`/messages/${id}`} className="card flex items-center gap-4 transition hover:-translate-y-0.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pitch-dark font-bold text-pitch-light">
                    {p?.full_name?.charAt(0) ?? '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium">
                      {p?.full_name ?? 'Unknown'}{' '}
                      <span className="text-xs capitalize text-zinc-500">· {p?.role}</span>
                    </p>
                    <p className="truncate text-sm text-zinc-400">{c.last}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="card text-sm text-zinc-400">
          No conversations yet. Message someone from the{' '}
          <Link href="/talent" className="text-pitch-light">Talent Feed</Link>.
        </p>
      )}
    </div>
  );
}
