-- Fix SECURITY DEFINER issue on verified stats views
-- Drop and recreate with SECURITY INVOKER to respect RLS policies

drop view if exists public.verified_bowling_stats;
drop view if exists public.verified_batting_stats;

-- Recreate with SECURITY INVOKER (respects user's RLS policies)
create view public.verified_batting_stats with (security_invoker) as
select batter_id as profile_id,
  count(distinct match_id) as matches,
  sum(runs) as runs,
  round(100.0 * sum(runs) / nullif(count(*) filter (where extra_type is distinct from 'wide'), 0), 2) as strike_rate
from public.balls
where batter_id is not null
group by batter_id;

create view public.verified_bowling_stats with (security_invoker) as
select bowler_id as profile_id,
  count(*) filter (where is_wicket and coalesce(dismissal_type,'') <> 'run_out') as wickets,
  round(sum(runs + extras) / nullif((count(*) filter (where extra_type is null or extra_type in ('bye','leg_bye'))) / 6.0, 0), 2) as economy
from public.balls
where bowler_id is not null
group by bowler_id;
