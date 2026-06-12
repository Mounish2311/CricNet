'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const SKILLS = [
  'Batting technique',
  'Power hitting',
  'Pace bowling',
  'Spin bowling',
  'Fielding',
  'Wicketkeeping',
  'Leadership',
  'Game awareness',
];

export default function EndorseForm({ endorseeId }: { endorseeId: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return router.push('/login');

    const form = new FormData(e.currentTarget);
    const { error } = await supabase.from('endorsements').insert({
      endorser_id: user.id,
      endorsee_id: endorseeId,
      skill: String(form.get('skill')),
      comment: String(form.get('comment') || '') || null,
    });
    if (error) {
      return setStatus(error.code === '23505' ? 'Already endorsed this skill.' : error.message);
    }
    setStatus('Endorsement added!');
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-3 rounded-lg border border-dashed border-night-edge p-4">
      <p className="text-sm font-medium">Endorse a skill</p>
      <select name="skill" className="input">
        {SKILLS.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <input name="comment" placeholder="Optional comment" className="input" />
      {status && <p className="text-sm text-stadium">{status}</p>}
      <button className="btn-pitch text-sm">Endorse</button>
    </form>
  );
}
