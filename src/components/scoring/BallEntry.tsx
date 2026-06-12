'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { BallEvent } from '@/lib/types';

const RUN_OPTIONS = [0, 1, 2, 3, 4, 6];
const EXTRA_TYPES = ['', 'wide', 'no_ball', 'bye', 'leg_bye'] as const;

// Ball-by-ball live scoring entry. Each submission persists a ball event;
// verified player stats are derived from these rows via SQL views.
export default function BallEntry({ matchId }: { matchId: string }) {
  const supabase = createClient();
  const [innings, setInnings] = useState<1 | 2>(1);
  const [over, setOver] = useState(0);
  const [ball, setBall] = useState(1);
  const [runs, setRuns] = useState(0);
  const [extraType, setExtraType] = useState<string>('');
  const [isWicket, setIsWicket] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  async function submit() {
    setSaving(true);
    const event: BallEvent = {
      match_id: matchId,
      innings,
      over_number: over,
      ball_number: ball,
      runs,
      extras: extraType ? 1 : 0,
      extra_type: (extraType || null) as BallEvent['extra_type'],
      is_wicket: isWicket,
    };
    const { error } = await supabase.from('balls').insert(event);
    setSaving(false);
    if (error) {
      setLog((l) => [`Error: ${error.message}`, ...l]);
      return;
    }
    setLog((l) => [
      `${over}.${ball} — ${isWicket ? 'WICKET' : `${runs} run(s)`}${extraType ? ` (${extraType})` : ''}`,
      ...l,
    ]);
    // Advance ball counter; wides/no-balls do not consume a legal delivery
    const legal = !extraType || extraType === 'bye' || extraType === 'leg_bye';
    if (legal) {
      if (ball === 6) {
        setOver(over + 1);
        setBall(1);
      } else {
        setBall(ball + 1);
      }
    }
    setRuns(0);
    setExtraType('');
    setIsWicket(false);
  }

  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">
          Live scoring — Over {over}.{ball}
        </h2>
        <select
          className="input w-auto"
          value={innings}
          onChange={(e) => setInnings(Number(e.target.value) as 1 | 2)}
        >
          <option value={1}>Innings 1</option>
          <option value={2}>Innings 2</option>
        </select>
      </div>
      <div className="flex flex-wrap gap-2">
        {RUN_OPTIONS.map((r) => (
          <button
            key={r}
            onClick={() => setRuns(r)}
            className={`h-12 w-12 rounded-full border text-lg font-bold transition ${
              runs === r
                ? 'border-pitch bg-pitch text-white'
                : 'border-night-edge bg-night-card hover:border-pitch'
            }`}
          >
            {r}
          </button>
        ))}
        <button
          onClick={() => setIsWicket(!isWicket)}
          className={`h-12 rounded-full border px-4 font-bold transition ${
            isWicket ? 'border-leather bg-leather text-white' : 'border-night-edge hover:border-leather'
          }`}
        >
          W
        </button>
      </div>
      <div className="flex items-center gap-3">
        <select className="input w-auto" value={extraType} onChange={(e) => setExtraType(e.target.value)}>
          {EXTRA_TYPES.map((t) => (
            <option key={t} value={t}>
              {t || 'No extra'}
            </option>
          ))}
        </select>
        <button onClick={submit} disabled={saving} className="btn-pitch disabled:opacity-50">
          {saving ? 'Saving…' : 'Record ball'}
        </button>
      </div>
      <ul className="max-h-48 space-y-1 overflow-y-auto text-sm text-zinc-400">
        {log.map((entry, i) => (
          <li key={i}>{entry}</li>
        ))}
      </ul>
    </div>
  );
}
