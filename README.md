# CricNet 🏏

A LinkedIn-style professional networking platform for the cricket ecosystem: talent showcase, live cricket data, and tournament management with a 3D cricket-themed UI.

## Stack

- **Next.js 14** (App Router, full-stack)
- **Tailwind CSS** — dark, premium cricket theme (pitch green, leather red, stadium gold)
- **Supabase** — auth, Postgres, storage (video uploads)
- **React Three Fiber / Three.js** — 3D hero, stat visualizations, tilt cards

## Modules

| Module | Where |
|---|---|
| Talent profiles, showcase videos, endorsements | `/talent`, `/profile/[id]` |
| Live scores dashboard (CricAPI + cache + mock fallback) | `/dashboard`, `/api/cricket/live` |
| Tournaments and ball-by-ball live scoring | `/tournaments`, `/matches/[id]/score` |
| Verified stats (derived from scored matches via SQL views) | `supabase/migrations/0001_init.sql` |

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Create a Supabase project** at https://supabase.com, then run the migration:
   - Open SQL Editor and execute `supabase/migrations/0001_init.sql`
   - Create a public storage bucket named `videos`
3. **Configure environment**
   ```bash
   cp .env.example .env.local
   ```
   Fill in `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and optionally `CRICAPI_KEY` (free key from https://cricketdata.org). Without a key, the live scores dashboard serves realistic mock data.
4. **Run**
   ```bash
   npm run dev
   ```

## How verified player stats work

CricNet stats are **earned by playing, never self-entered.** A player does not
type in his own runs or wickets — they accumulate automatically from matches
scored inside the app:

1. **Register** — sign up and create a player profile.
2. **Join a team** — an organizer adds the player to a team roster
   (`team_players`). Registering alone is not enough; the player must be on a
   roster for a match.
3. **Play a scored match** — the team plays a tournament fixture that is scored
   ball-by-ball at `/matches/[id]/score`.
4. **Stats appear automatically** — every attributed delivery is written to the
   `balls` table, and the `verified_batting_stats` / `verified_bowling_stats`
   SQL views roll those up into matches, runs, strike rate, wickets, and
   economy. These show on the player's profile under a *verified* badge,
   visible to the player and to scouts. No manual upload, no refresh step.

### Attribution is required (important for scorers)

Stats are only as complete as the scoring. On the scoring screen, when a team
roster exists, **every ball must be attributed to a striker and a bowler** —
the *Record ball* button stays disabled until both are selected. This prevents
deliveries from being saved against nobody and silently undercounting a
player's verified stats. The scorer also picks a non-striker so strike rotates
automatically (batters cross on odd runs and at the end of each over). Only
practice matches with no roster allow unattributed scoring.

## Architecture notes

- **Verified stats:** the `balls` table is the source of truth. SQL views `verified_batting_stats` and `verified_bowling_stats` aggregate scored deliveries into per-player figures shown with a *verified* badge, distinct from `self_reported_stats`. Aggregation ignores any ball with no `batter_id` / `bowler_id`, which is why attribution is enforced during scoring.
- **API caching:** `src/lib/cricket/api.ts` wraps CricAPI with an in-memory TTL cache (configurable via `CRICKET_CACHE_TTL`) and falls back to `mock-data.ts` when rate-limited.
- **RLS:** all tables have row-level security; users can only write their own profiles, videos, messages, and connection requests.

## Roadmap

- Connection request + messaging flows wired to the existing schema
- Video upload UI to the Supabase `videos` bucket
- Tournament creation form, brackets, and standings
- Scroll-based 3D section transitions and player stat comparisons
