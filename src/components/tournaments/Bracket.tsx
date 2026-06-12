interface BracketMatch {
  id: string;
  round: number;
  status: string;
  winner_team: string | null;
  team_a: string | null;
  team_b: string | null;
  a: { id: string; name: string } | null;
  b: { id: string; name: string } | null;
}

function roundLabel(round: number, maxRound: number) {
  if (round === maxRound && maxRound > 1) return 'Final';
  if (round === maxRound - 1 && maxRound > 2) return 'Semi-finals';
  return `Round ${round}`;
}

function TeamLine({
  name,
  isWinner,
  decided,
}: {
  name: string;
  isWinner: boolean;
  decided: boolean;
}) {
  return (
    <p
      className={`flex items-center justify-between rounded px-2 py-1 text-sm ${
        isWinner
          ? 'bg-pitch/20 font-semibold text-pitch-light'
          : decided
            ? 'text-zinc-500 line-through decoration-zinc-600'
            : 'text-zinc-200'
      }`}
    >
      {name}
      {isWinner && <span className="text-xs">✓</span>}
    </p>
  );
}

// Knockout bracket: one column per round, winners highlighted
export default function Bracket({ matches }: { matches: BracketMatch[] }) {
  const rounds = new Map<number, BracketMatch[]>();
  for (const m of matches) {
    const r = m.round ?? 1;
    rounds.set(r, [...(rounds.get(r) ?? []), m]);
  }
  const roundNumbers = [...rounds.keys()].sort((a, b) => a - b);
  if (!roundNumbers.length) return null;
  const maxRound = roundNumbers[roundNumbers.length - 1];

  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-max gap-6">
        {roundNumbers.map((r) => (
          <div key={r} className="flex w-52 flex-col justify-around gap-4">
            <p className="text-center text-xs font-semibold uppercase tracking-wide text-zinc-500">
              {roundLabel(r, maxRound)}
            </p>
            {rounds.get(r)!.map((m) => {
              const decided = m.status === 'completed' && !!m.winner_team;
              return (
                <div key={m.id} className="space-y-1 rounded-lg border border-night-edge bg-night p-2">
                  <TeamLine
                    name={m.a?.name ?? 'TBC'}
                    isWinner={decided && m.winner_team === m.team_a}
                    decided={decided}
                  />
                  <TeamLine
                    name={m.b?.name ?? 'TBC'}
                    isWinner={decided && m.winner_team === m.team_b}
                    decided={decided}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
