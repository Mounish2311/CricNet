'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { BallEvent } from '@/lib/types';

const RUN_OPTIONS = [0, 1, 2, 3, 4, 6];
const EXTRA_TYPES = ['', 'wide', 'no_ball', 'bye', 'leg_bye'] as const;
const DISMISSALS = ['bowled', 'caught', 'lbw', 'run_out', 'stumped', 'hit_wicket'];

export interface RosterPlayer {
  id: string;
  name: string;
  teamName: string;
}

// Ball-by-ball live scoring entry. Each submission persists a ball event
// with batter/bowler attribution; verified player stats are derived from
// these rows via SQL views.
export default function BallEntry({
  matchId,
  players,
}: {
  matchId: string;
  players: RosterPlayer[];
}) {
  const supabase = createClient();
  const [innings, setInnings] = useState<1 | 2>(1);
  const [over, setOver] = useState(0);
  const [ball, setBall] = useState(1);
  const [runs, setRuns] = useState(0);
  const [extraType, setExtraType] = useState<string>('');
  const [isWicket, setIsWicket] = useState(false);
  const [dismissal, setDismissal] = useState('bowled');
  const [batterId, setBatterId] = useState('');
  const [nonStrikerId, setNonStrikerId] = useState('');
  const [bowlerId, setBowlerId] = useState('');
  const [log, setLog] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const nameOf = (id: string) => players.find((p) => p.id === id)?.name ?? 'Unknown';

  // When a roster exists, every ball must be attributed so it feeds verified
  // stats — otherwise it silently counts toward nobody. Without a roster
  // (e.g. a practice match), unattributed scoring is still allowed.
  const hasRoster = players.length > 0;
  const missing: string[] = [];
  if (hasRoster && !batterId) missing.push('striker');
  if (hasRoster && !bowlerId) missing.push('bowler');
  const sameBatter = !!batterId && batterId === nonStrikerId;
  const canRecord = !saving && missing.length === 0 && !sameBatter;

  async function submit() {
    if (!canRecord) return;
    setSaving(true);
    const event: BallEvent = {
      match_id: matchId,
      innings,
      over_number: over,
      ball_number: ball,
      batter_id: batterId || undefined,
      bowler_id: bowlerId || undefined,
      runs,
      extras: extraType ? 1 : 0,
      extra_type: (extraType || null) as BallEvent['extra_type'],
      is_wicket: isWicket,
      dismissal_type: isWicket ? dismissal : null,
    };
    const { error } = await supabase.from('balls').insert(event);
    setSaving(false);
    if (error) {
      setLog((l) => [`Error: ${error.message}`, ...l]);
      return;
    }
    const who = batterId ? ` · ${nameOf(batterId)}` : '';
    setLog((l) => [
      `${over}.${ball} — ${isWicket ? `WICKET (${dismissal})` : `${runs} run(s)`}${
        extraType ? ` (${extraType})` : ''
      }${who}`,
      ...l,
    ]);
    // Advance ball counter; wides/no-balls do not consume a legal delivery
    const legal = !extraType || extraType === 'bye' || extraType === 'leg_bye';
    let endOfOver = false;
    if (legal) {
      if (ball === 6) {
        setOver(over + 1);
        setBall(1);
        endOfOver = true;
      } else {
        setBall(ball + 1);
      }
    }
    // Strike rotation: batters cross on odd runs, and ends swap at over's end
    // (not on a wicket — the scorer selects the incoming batter manually).
    if (legal && !isWicket) {
      const crossed = runs % 2 === 1;
      const swap = crossed !== endOfOver; // XOR: both true cancels out
      if (swap && nonStrikerId) {
        setBatterId(nonStrikerId);
        setNonStrikerId(batterId);
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

      <div className="grid grid-cols-3 gap-3">
        <label className="text-xs text-zinc-400">
          On strike{hasRoster && <span className="text-leather-light"> *</span>}
          <select
            className={`input mt-1 ${hasRoster && !batterId ? 'border-leather' : ''}`}
            value={batterId}
            onChange={(e) => setBatterId(e.target.value)}
          >
            <option value="">{hasRoster ? 'Select striker' : 'Unattributed'}</option>
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.teamName})
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-zinc-400">
          Non-striker
          <select
            className="input mt-1"
            value={nonStrikerId}
            onChange={(e) => setNonStrikerId(e.target.value)}
          >
            <option value="">Optional</option>
            {players
              .filter((p) => p.id !== batterId)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.teamName})
                </option>
              ))}
          </select>
        </label>
        <label className="text-xs text-zinc-400">
          Bowler{hasRoster && <span className="text-leather-light"> *</span>}
          <select
            className={`input mt-1 ${hasRoster && !bowlerId ? 'border-leather' : ''}`}
            value={bowlerId}
            onChange={(e) => setBowlerId(e.target.value)}
          >
            <option value="">{hasRoster ? 'Select bowler' : 'Unattributed'}</option>
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.teamName})
              </option>
            ))}
          </select>
        </label>
      </div>
      {!hasRoster && (
        <p className="text-xs text-stadium">
          Add players to team rosters below to attribute balls and build verified stats.
        </p>
      )}
      {sameBatter && (
        <p className="text-xs text-leather-light">
          Striker and non-striker can&apos;t be the same player.
        </p>
      )}

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

      <div className="flex flex-wrap items-center gap-3">
        <select className="input w-auto" value={extraType} onChange={(e) => setExtraType(e.target.value)}>
          {EXTRA_TYPES.map((t) => (
            <option key={t} value={t}>
              {t || 'No extra'}
            </option>
          ))}
        </select>
        {isWicket && (
          <select className="input w-auto" value={dismissal} onChange={(e) => setDismissal(e.target.value)}>
            {DISMISSALS.map((d) => (
              <option key={d} value={d}>
                {d.replaceAll('_', ' ')}
              </option>
            ))}
          </select>
        )}
        <button onClick={submit} disabled={!canRecord} className="btn-pitch disabled:opacity-50">
          {saving ? 'Saving…' : 'Record ball'}
        </button>
        {missing.length > 0 && (
          <span className="text-xs text-leather-light">Select {missing.join(' & ')} first</span>
        )}
      </div>

      <ul className="max-h-48 space-y-1 overflow-y-auto text-sm text-zinc-400">
        {log.map((entry, i) => (
          <li key={i}>{entry}</li>
        ))}
      </ul>
    </div>
  );
}
