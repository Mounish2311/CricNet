import type { NewsItem } from '@/lib/types';

// Fallback news served when the news API is unavailable, rate-limited,
// or NEWS_API_KEY is not configured. Grouped by scope so the landing
// page renders International / National / Local sections immediately.
export const mockNews: NewsItem[] = [
  // ---- International ----
  {
    id: 'mock-intl-1',
    scope: 'international',
    title: 'India clinch series decider in a last-over thriller',
    summary:
      'A composed chase under lights sealed the bilateral series, with the middle order holding firm against a quality pace attack.',
    source: 'CricNet Wire',
    url: '#',
    imageUrl: null,
    publishedAt: '2026-06-11T18:30:00.000Z',
    origin: 'mock',
  },
  {
    id: 'mock-intl-2',
    scope: 'international',
    title: 'ICC confirms expanded calendar for the next cycle',
    summary:
      'More day-night Tests and a revamped points system headline the governing body’s latest Future Tours Programme.',
    source: 'Global Cricket Desk',
    url: '#',
    imageUrl: null,
    publishedAt: '2026-06-10T09:15:00.000Z',
    origin: 'mock',
  },
  {
    id: 'mock-intl-3',
    scope: 'international',
    title: 'Spin twins spin a web on a turning track',
    summary:
      'A combined nine-wicket haul flattened the opposition batting card inside three sessions on a raging turner.',
    source: 'CricNet Wire',
    url: '#',
    imageUrl: null,
    publishedAt: '2026-06-09T14:00:00.000Z',
    origin: 'mock',
  },
  // ---- National ----
  {
    id: 'mock-nat-1',
    scope: 'national',
    title: 'Ranji Trophy: defending champions march into the semis',
    summary:
      'A double-century from the captain and a disciplined bowling effort booked a comfortable innings victory.',
    source: 'Domestic Roundup',
    url: '#',
    imageUrl: null,
    publishedAt: '2026-06-11T11:45:00.000Z',
    origin: 'mock',
  },
  {
    id: 'mock-nat-2',
    scope: 'national',
    title: 'Selectors hand maiden call-up to uncapped all-rounder',
    summary:
      'A breakout domestic season is rewarded with a place in the squad ahead of the white-ball leg of the home season.',
    source: 'Selection Watch',
    url: '#',
    imageUrl: null,
    publishedAt: '2026-06-10T16:20:00.000Z',
    origin: 'mock',
  },
  {
    id: 'mock-nat-3',
    scope: 'national',
    title: 'Women’s domestic league sets new attendance record',
    summary:
      'Packed stands and a nail-biting final signalled a surge of interest in the national women’s competition.',
    source: 'Domestic Roundup',
    url: '#',
    imageUrl: null,
    publishedAt: '2026-06-08T19:05:00.000Z',
    origin: 'mock',
  },
  // ---- Local ----
  {
    id: 'mock-local-1',
    scope: 'local',
    title: 'District league final heads to a super over',
    summary:
      'Two unbeaten sides traded blows before the title was decided by the narrowest of margins in front of a home crowd.',
    source: 'CricNet Local',
    url: '#',
    imageUrl: null,
    publishedAt: '2026-06-11T13:10:00.000Z',
    origin: 'mock',
  },
  {
    id: 'mock-local-2',
    scope: 'local',
    title: 'Academy graduate earns state age-group selection',
    summary:
      'A verified run of scores on CricNet-scored matches helped a local teenager catch the eye of state scouts.',
    source: 'CricNet Local',
    url: '#',
    imageUrl: null,
    publishedAt: '2026-06-09T08:40:00.000Z',
    origin: 'mock',
  },
  {
    id: 'mock-local-3',
    scope: 'local',
    title: 'Weekend tournament raises funds for new turf pitch',
    summary:
      'Grassroots clubs came together for a charity sixes event that will fund an all-weather pitch for the community ground.',
    source: 'CricNet Local',
    url: '#',
    imageUrl: null,
    publishedAt: '2026-06-07T10:00:00.000Z',
    origin: 'mock',
  },
];
