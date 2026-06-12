'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const CATEGORIES = [
  { value: 'batting_pov', label: 'Batting POV' },
  { value: 'bowling_pov', label: 'Bowling POV' },
  { value: 'highlight_reel', label: 'Highlight reel' },
  { value: 'other', label: 'Other' },
];

export default function VideoUpload({ profileId }: { profileId: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const file = form.get('file') as File;
    if (!file?.size) return setStatus('Choose a video file first.');

    setBusy(true);
    setStatus('Uploading…');
    const path = `${profileId}/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const { error: uploadError } = await supabase.storage.from('videos').upload(path, file);
    if (uploadError) {
      setBusy(false);
      return setStatus(uploadError.message);
    }
    const { error } = await supabase.from('videos').insert({
      profile_id: profileId,
      title: String(form.get('title')),
      category: String(form.get('category')),
      storage_path: path,
    });
    setBusy(false);
    if (error) return setStatus(error.message);
    setStatus('Uploaded!');
    formEl.reset();
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-3 rounded-lg border border-dashed border-night-edge p-4">
      <p className="text-sm font-medium">Upload showcase video</p>
      <input name="title" required placeholder="Title (e.g. Cover drive practice)" className="input" />
      <div className="grid grid-cols-2 gap-3">
        <select name="category" className="input">
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <input name="file" type="file" accept="video/*" className="input" />
      </div>
      {status && <p className="text-sm text-stadium">{status}</p>}
      <button disabled={busy} className="btn-pitch text-sm disabled:opacity-50">
        {busy ? 'Uploading…' : 'Upload'}
      </button>
    </form>
  );
}
