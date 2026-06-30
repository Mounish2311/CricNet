'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRef } from 'react';
import type { Profile } from '@/lib/types';
import ConnectButton from '@/components/network/ConnectButton';
import MessageButton from '@/components/network/MessageButton';

// LinkedIn-style profile card with a 3D tilt-on-hover effect
export default function PlayerCard({
  profile,
  currentUserId = null,
  connectionStatus = null,
}: {
  profile: Profile;
  currentUserId?: string | null;
  connectionStatus?: 'accepted' | 'pending' | null;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isOwner = currentUserId === profile.id;

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
  }

  function onLeave() {
    if (ref.current) ref.current.style.transform = '';
  }

  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} className="tilt-card card">
      <div className="flex items-center gap-3">
        <div className="relative h-12 w-12 overflow-hidden rounded-full bg-pitch-dark">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={profile.full_name}
              fill
              sizes="48px"
              className="object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-lg font-bold text-pitch-light">
              {profile.full_name.charAt(0)}
            </span>
          )}
        </div>
        <div>
          <Link href={`/profile/${profile.id}`} className="font-semibold hover:text-stadium">
            {profile.full_name}
          </Link>
          <p className="text-xs capitalize text-zinc-400">
            {profile.role}
            {profile.secondary_role ? ` · ${profile.secondary_role}` : ''}
            {profile.location ? ` · ${profile.location}` : ''}
          </p>
        </div>
      </div>
      {profile.bio && <p className="mt-3 line-clamp-2 text-sm text-zinc-300">{profile.bio}</p>}
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        {profile.skill_level && (
          <span className="rounded-full bg-pitch-dark px-2 py-0.5 capitalize text-pitch-light">
            {profile.skill_level}
          </span>
        )}
        {profile.batting_style && (
          <span className="rounded-full bg-night px-2 py-0.5 text-zinc-300">{profile.batting_style}</span>
        )}
        {profile.bowling_style && (
          <span className="rounded-full bg-night px-2 py-0.5 text-zinc-300">{profile.bowling_style}</span>
        )}
      </div>
      <div className="mt-4 flex gap-2">
        {isOwner ? (
          <Link
            href={`/profile/${profile.id}`}
            className="btn-pitch flex-1 text-center text-sm"
          >
            View profile
          </Link>
        ) : connectionStatus === 'accepted' ? (
          <MessageButton targetId={profile.id} className="flex-1 text-sm" />
        ) : connectionStatus === 'pending' ? (
          <span className="flex-1 rounded-lg border border-night-edge px-4 py-2 text-center text-sm text-zinc-400">
            Request pending
          </span>
        ) : (
          <ConnectButton targetId={profile.id} className="flex-1 text-sm" />
        )}
      </div>
    </div>
  );
}
