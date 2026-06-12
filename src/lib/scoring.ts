import type { BallEvent } from '@/lib/types';

export interface BattingFigures {
  runs: number;
  ballsFaced: number;
  fours: number;
  sixes: number;
  strikeRate: number;
}

export interface BowlingFigures {
  overs: string;
  runsConceded: number;
  wickets: number;
  economy: number;
}

export function battingFigures(balls: BallEvent[], batterId: string): BattingFigures {
  const faced = balls.filter(
    (b) => b.batter_id === batterId && b.extra_type !== 'wide'
  );
  const runs = faced.reduce((sum, b) => sum + b.runs, 0);
  return {
    runs,
    ballsFaced: faced.length,
    fours: faced.filter((b) => b.runs === 4).length,
    sixes: faced.filter((b) => b.runs === 6).length,
    strikeRate: faced.length ? +((runs / faced.length) * 100).toFixed(2) : 0,
  };
}

export function bowlingFigures(balls: BallEvent[], bowlerId: string): BowlingFigures {
  const bowled = balls.filter((b) => b.bowler_id === bowlerId);
  const legalBalls = bowled.filter(
    (b) => !b.extra_type || b.extra_type === 'bye' || b.extra_type === 'leg_bye'
  ).length;
  const runsConceded = bowled.reduce(
    (sum, b) =>
      sum + b.runs + (b.extra_type === 'bye' || b.extra_type === 'leg_bye' ? 0 : b.extras),
    0
  );
  const wickets = bowled.filter(
    (b) => b.is_wicket && b.dismissal_type !== 'run_out'
  ).length;
  const oversFloat = legalBalls / 6;
  return {
    overs: `${Math.floor(legalBalls / 6)}.${legalBalls % 6}`,
    runsConceded,
    wickets,
    economy: oversFloat ? +(runsConceded / oversFloat).toFixed(2) : 0,
  };
}

export function inningsTotal(balls: BallEvent[], innings: 1 | 2) {
  const inn = balls.filter((b) => b.innings === innings);
  return {
    runs: inn.reduce((s, b) => s + b.runs + b.extras, 0),
    wickets: inn.filter((b) => b.is_wicket).length,
    legalBalls: inn.filter(
      (b) => !b.extra_type || b.extra_type === 'bye' || b.extra_type === 'leg_bye'
    ).length,
  };
}
