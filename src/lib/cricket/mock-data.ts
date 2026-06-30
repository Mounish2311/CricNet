import type { LiveMatch } from '@/lib/types';

// Fallback data served when CricAPI is unavailable or rate-limited.
// Spans all four categories so the tabbed UI has something to show in demo mode.
export const mockLiveMatches: LiveMatch[] = [
  {
    id: 'mock-1',
    name: 'India vs Australia, 3rd T20I',
    status: 'India need 42 runs in 30 balls',
    venue: 'Wankhede Stadium, Mumbai',
    teams: ['India', 'Australia'],
    category: 'international',
    score: [
      { inning: 'Australia Inning 1', r: 186, w: 7, o: 20 },
      { inning: 'India Inning 1', r: 145, w: 4, o: 15 },
    ],
    matchStarted: true,
    matchEnded: false,
    source: 'mock',
  },
  {
    id: 'mock-2',
    name: 'England vs South Africa, 1st ODI',
    status: 'England won by 5 wickets',
    venue: "Lord's, London",
    teams: ['England', 'South Africa'],
    category: 'international',
    score: [
      { inning: 'South Africa Inning 1', r: 271, w: 10, o: 48.3 },
      { inning: 'England Inning 1', r: 272, w: 5, o: 47.1 },
    ],
    matchStarted: true,
    matchEnded: true,
    source: 'mock',
  },
  {
    id: 'mock-3',
    name: 'Mumbai Indians vs Chennai Super Kings, Indian Premier League',
    status: 'CSK need 58 runs in 36 balls',
    venue: 'Wankhede Stadium, Mumbai',
    teams: ['Mumbai Indians', 'Chennai Super Kings'],
    category: 'league',
    score: [
      { inning: 'Mumbai Indians Inning 1', r: 192, w: 5, o: 20 },
      { inning: 'Chennai Super Kings Inning 1', r: 135, w: 3, o: 14 },
    ],
    matchStarted: true,
    matchEnded: false,
    source: 'mock',
  },
  {
    id: 'mock-4',
    name: 'Tamil Nadu vs Karnataka, Ranji Trophy',
    status: 'Day 2: Karnataka trail by 88 runs',
    venue: 'M. A. Chidambaram Stadium, Chennai',
    teams: ['Tamil Nadu', 'Karnataka'],
    category: 'domestic',
    score: [
      { inning: 'Tamil Nadu Inning 1', r: 312, w: 10, o: 94.2 },
      { inning: 'Karnataka Inning 1', r: 224, w: 6, o: 71 },
    ],
    matchStarted: true,
    matchEnded: false,
    source: 'mock',
  },
  {
    id: 'mock-5',
    name: 'India Women vs England Women, 2nd ODI',
    status: 'India Women won by 4 wickets',
    venue: 'Holkar Stadium, Indore',
    teams: ['India Women', 'England Women'],
    category: 'women',
    score: [
      { inning: 'England Women Inning 1', r: 244, w: 9, o: 50 },
      { inning: 'India Women Inning 1', r: 247, w: 6, o: 48.2 },
    ],
    matchStarted: true,
    matchEnded: true,
    source: 'mock',
  },
];
