'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface Msg {
  id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  created_at: string;
}

export default function Conversation() {
  const { id: otherId } = useParams<{ id: string }>();
  const supabase = createClient();
  const router = useRouter();
  const [me, setMe] = useState<string | null>(null);
  const [otherName, setOtherName] = useState('Conversation');
  const [messages, setMessages] = useState<Msg[]>([]);
  const [body, setBody] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  async function load(uid: string) {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(
        `and(sender_id.eq.${uid},recipient_id.eq.${otherId}),and(sender_id.eq.${otherId},recipient_id.eq.${uid})`
      )
      .order('created_at');
    setMessages((data ?? []) as Msg[]);
  }

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return router.push('/login');
      setMe(user.id);
      const { data: p } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', otherId)
        .single();
      if (p) setOtherName(p.full_name);
      load(user.id);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otherId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!me || !body.trim()) return;
    const { error } = await supabase
      .from('messages')
      .insert({ sender_id: me, recipient_id: otherId, body: body.trim() });
    if (!error) {
      setBody('');
      load(me);
    }
  }

  return (
    <div className="mx-auto mt-10 flex h-[70vh] max-w-2xl flex-col">
      <h1 className="text-xl font-bold">{otherName}</h1>
      <div className="card mt-4 flex-1 space-y-2 overflow-y-auto">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[75%] rounded-xl px-3 py-2 text-sm ${
              m.sender_id === me
                ? 'ml-auto bg-pitch text-white'
                : 'bg-night text-zinc-200'
            }`}
          >
            {m.body}
          </div>
        ))}
        {!messages.length && (
          <p className="text-sm text-zinc-500">Start the conversation — say hello!</p>
        )}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={send} className="mt-3 flex gap-2">
        <input
          className="input"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write a message…"
        />
        <button className="btn-pitch">Send</button>
      </form>
    </div>
  );
}
