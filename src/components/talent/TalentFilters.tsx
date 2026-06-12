'use client';

import { useRouter, useSearchParams } from 'next/navigation';

const FILTERS = [
  { name: 'role', label: 'Role', options: ['player', 'coach', 'scout'] },
  {
    name: 'skill_level',
    label: 'Skill level',
    options: ['beginner', 'club', 'district', 'state', 'professional'],
  },
];

export default function TalentFilters() {
  const router = useRouter();
  const params = useSearchParams();

  function setFilter(name: string, value: string) {
    const next = new URLSearchParams(params.toString());
    value ? next.set(name, value) : next.delete(name);
    router.push(`/talent?${next.toString()}`);
  }

  return (
    <div className="card flex flex-wrap items-end gap-4">
      {FILTERS.map((f) => (
        <label key={f.name} className="text-sm">
          <span className="mb-1 block text-xs text-zinc-400">{f.label}</span>
          <select
            className="input capitalize"
            value={params.get(f.name) ?? ''}
            onChange={(e) => setFilter(f.name, e.target.value)}
          >
            <option value="">Any</option>
            {f.options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </label>
      ))}
      <label className="text-sm">
        <span className="mb-1 block text-xs text-zinc-400">Location</span>
        <input
          className="input"
          placeholder="e.g. Chennai"
          defaultValue={params.get('location') ?? ''}
          onKeyDown={(e) => {
            if (e.key === 'Enter') setFilter('location', (e.target as HTMLInputElement).value);
          }}
        />
      </label>
    </div>
  );
}
