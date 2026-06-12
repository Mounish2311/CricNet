import type { LiveMatch } from '@/lib/types';

// Fallback data served when CricAPI is unavailable or rate-limited
export const mockLiveMatches: LiveMatch[] = [
  {
    id: 'mock-1',
    name: 'India vs Australia, 3rd T20I',
    status: 'India need 42 runs in 30 balls',
    venue: 'Wankhede Stadium, Mumbai',
    teams: ['India', 'Australia'],
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
    name: 'Tamil Nadu vs Karnataka, Ranji Trophy',
    status: 'Day 2: Karnataka trail by 88 runs',
    venue: 'M. A. Chidambaram Stadium, Chennai',
    teams: ['Tamil Nadu', 'Karnataka'],
    score: [
      { inning: 'Tamil Nadu Inning 1', r: 312, w: 10, o: 94.2 },
      { inning: 'Karnataka Inning 1', r: 224, w: 6, o: 71 },
    ],
    matchStarted: true,
    matchEnded: false,
    source: 'mock',
  },
];
