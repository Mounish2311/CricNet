import type { MatchCategory } from '@/lib/types';

// CricAPI doesn't return a clean category, so we classify each match by
// inspecting its name, teams, and matchType. This is a heuristic: right the
// vast majority of the time, but extend the keyword lists below as needed.

// Full-member + common associate national sides → "international".
const NATIONAL_TEAMS = [
  'india',
  'australia',
  'england',
  'pakistan',
  'south africa',
  'new zealand',
  'sri lanka',
  'bangladesh',
  'west indies',
  'afghanistan',
  'zimbabwe',
  'ireland',
  'scotland',
  'netherlands',
  'nepal',
  'namibia',
  'oman',
  'united states',
  'usa',
  'canada',
  'uae',
  'united arab emirates',
  'hong kong',
  'papua new guinea',
];

// Franchise / domestic-league competitions → "league".
const LEAGUE_KEYWORDS = [
  'indian premier league',
  'ipl',
  'big bash',
  'bbl',
  'psl',
  'pakistan super league',
  'cpl',
  'caribbean premier league',
  'the hundred',
  'sa20',
  'ilt20',
  'international league t20',
  'mlc',
  'major league cricket',
  'super smash',
  'vitality blast',
  't20 blast',
  'lpl',
  'lanka premier league',
  'bpl',
  'bangladesh premier league',
  'syed mushtaq ali',
  'mzansi',
  'global t20',
  'abu dhabi t10',
  't10 league',
  'legends league',
];

function matchesAny(haystack: string, needles: string[]): boolean {
  return needles.some((n) => haystack.includes(n));
}

// Women's matches can appear at any level, so detect them first.
function isWomen(text: string): boolean {
  return (
    /\bwomen\b/.test(text) ||
    /\bwomen'?s\b/.test(text) ||
    /\(w\)/.test(text) ||
    /\bw\)/.test(text)
  );
}

export function classifyMatch(name: string, teams: string[] = []): MatchCategory {
  const text = `${name} ${teams.join(' ')}`.toLowerCase();

  if (isWomen(text)) return 'women';
  if (matchesAny(text, LEAGUE_KEYWORDS)) return 'league';

  // International: both sides are recognised national teams. We strip a
  // trailing " women"/"(w)" already handled above; here we count national hits.
  const nationalHits = NATIONAL_TEAMS.filter((t) => text.includes(t)).length;
  if (nationalHits >= 2) return 'international';

  // A single national team usually means an "A"/U19/tour game — still
  // international-adjacent, but default such cases to domestic unless it's a
  // clearly bilateral national fixture handled above.
  return 'domestic';
}
