-- Knockout/bracket support: which round a match belongs to (1 = first round)
alter table public.matches add column round int not null default 1;
