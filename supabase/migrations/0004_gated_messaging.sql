-- LinkedIn-style private messaging: you may only send a message to someone
-- you are CONNECTED with (an accepted connection in either direction).
-- Profiles remain publicly viewable; only the private DM channel is gated.
-- This is enforced in the database so the rule holds for any API caller,
-- not just the UI.

drop policy if exists "send message" on public.messages;
create policy "send message" on public.messages for insert with check (
  auth.uid() = sender_id
  and exists (
    select 1 from public.connections c
    where c.status = 'accepted'
      and (
        (c.requester_id = auth.uid() and c.addressee_id = recipient_id)
        or (c.requester_id = recipient_id and c.addressee_id = auth.uid())
      )
  )
);
