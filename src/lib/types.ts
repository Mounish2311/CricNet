export type UserRole = 'player' | 'coach' | 'scout';

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  secondary_role: UserRole | null;
  bio: string | null;
  location: string | null;
  date_of_birth: string | null;
  batting_style: string | null;
  bowling_style: string | null;
  skill_level: string | null;
  avatar_url: string | null;
}

export interface BallEvent {
  match_id: string;
  innings: 1 | 2;
  over_number: number;
  ball_number: number;
  batter_id?: string;
  bowler_id?: string;
  runs: number;
  extras: number;
  extra_type?: 'wide' | 'no_ball' | 'bye' | 'leg_bye' | null;
  is_wicket: boolean;
  dismissal_type?: string | null;
}

export interface LiveMatch {
  id: string;
  name: string;
  status: string;
  venue: string;
  teams: string[];
  score: { inning: string; r: number; w: number; o: number }[];
  matchStarted: boolean;
  matchEnded: boolean;
  source: 'live' | 'mock';
}

export type NewsScope = 'international' | 'national' | 'local';

export interface NewsItem {
  id: string;
  scope: NewsScope;
  title: string;
  summary: string;
  source: string;
  url: string;
  imageUrl: string | null;
  publishedAt: string; // ISO date
  origin: 'live' | 'mock';
}
