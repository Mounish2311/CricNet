'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types';

// Owner-only panel to edit your own profile: description (bio), name,
// location, and a profile picture uploaded to the public `avatars` bucket.
export default function EditProfile({ profile }: { profile: Profile }) {
  const supabase = createClient();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState(profile.full_name);
  const [bio, setBio] = useState(profile.bio ?? '');
  const [location, setLocation] = useState(profile.location ?? '');
  const [preview, setPreview] = useState<string | null>(profile.avatar_url);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    if (f) setPreview(URL.createObjectURL(f));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (saving) return;
    if (!fullName.trim()) return setError('Name is required.');
    setSaving(true);
    setError(null);

    let avatarUrl = profile.avatar_url;

    // Upload the new picture (if any) to "<uid>/<timestamp>-<name>" so the
    // storage RLS policy (owner-only writes to their own folder) is satisfied.
    if (file) {
      const ext = file.name.split('.').pop() || 'jpg';
      const filePath = `${profile.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });
      if (upErr) {
        setSaving(false);
        return setError(upErr.message);
      }
      const { data: pub } = supabase.storage.from('avatars').getPublicUrl(filePath);
      avatarUrl = pub.publicUrl;
    }

    const { error: updErr } = await supabase
      .from('profiles')
      .update({
        full_name: fullName.trim(),
        bio: bio.trim() || null,
        location: location.trim() || null,
        avatar_url: avatarUrl,
      })
      .eq('id', profile.id);

    setSaving(false);
    if (updErr) return setError(updErr.message);
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-pitch text-sm">
        Edit profile
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="w-full space-y-4 border-t border-night-edge pt-4">
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 overflow-hidden rounded-full bg-pitch-dark">
          {preview ? (
            <Image src={preview} alt="" fill sizes="80px" className="object-cover" unoptimized />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-3xl font-bold text-pitch-light">
              {fullName.charAt(0) || '?'}
            </span>
          )}
        </div>
        <label className="text-sm">
          <span className="mb-1 block text-xs text-zinc-400">Profile picture</span>
          <input type="file" accept="image/*" onChange={onPick} className="input text-xs" />
        </label>
      </div>

      <label className="block text-sm">
        <span className="mb-1 block text-xs text-zinc-400">Name</span>
        <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="input" />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block text-xs text-zinc-400">About you</span>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          placeholder="Tell scouts and coaches about your game, experience, and goals…"
          className="input resize-none"
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block text-xs text-zinc-400">Location</span>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="City"
          className="input"
        />
      </label>

      {error && <p className="text-sm text-leather-light">{error}</p>}

      <div className="flex gap-2">
        <button disabled={saving} className="btn-pitch text-sm disabled:opacity-60">
          {saving ? 'Saving…' : 'Save changes'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg border border-night-edge px-4 py-2 text-sm text-zinc-300 hover:border-pitch"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
