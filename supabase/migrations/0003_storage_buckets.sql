-- Storage buckets for profile avatars and showcase videos, with RLS policies.
-- Both are public-read; writes are restricted to the owner's own folder
-- (objects are stored under "<auth.uid()>/..."), matching how the app uploads.

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('videos', 'videos', true)
on conflict (id) do nothing;

-- Avatars
drop policy if exists "avatars public read" on storage.objects;
create policy "avatars public read" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "avatars owner write" on storage.objects;
create policy "avatars owner write" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "avatars owner update" on storage.objects;
create policy "avatars owner update" on storage.objects
  for update using (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "avatars owner delete" on storage.objects;
create policy "avatars owner delete" on storage.objects
  for delete using (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Videos
drop policy if exists "videos public read" on storage.objects;
create policy "videos public read" on storage.objects
  for select using (bucket_id = 'videos');

drop policy if exists "videos owner write" on storage.objects;
create policy "videos owner write" on storage.objects
  for insert with check (
    bucket_id = 'videos' and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "videos owner update" on storage.objects;
create policy "videos owner update" on storage.objects
  for update using (
    bucket_id = 'videos' and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "videos owner delete" on storage.objects;
create policy "videos owner delete" on storage.objects
  for delete using (
    bucket_id = 'videos' and auth.uid()::text = (storage.foldername(name))[1]
  );
