import dynamic from 'next/dynamic';
import Link from 'next/link';

const HeroScene = dynamic(() => import('@/components/three/HeroScene'), { ssr: false });

const features = [
  {
    title: 'Talent Showcase',
    body: 'Upload batting and bowling POV videos, build a verified stats timeline, and earn endorsements from coaches and teammates.',
    href: '/talent',
    accent: 'text-pitch-light',
  },
  {
    title: 'Live Cricket Data',
    body: 'Follow live international and domestic scores, scorecards, and player stat comparisons in one dashboard.',
    href: '/dashboard',
    accent: 'text-stadium',
  },
  {
    title: 'Tournament Engine',
    body: 'Run local and state-level tournaments with ball-by-ball scoring that feeds verified stats straight into player profiles.',
    href: '/tournaments',
    accent: 'text-leather-light',
  },
];

export default function Home() {
  return (
    <>
      <section className="relative -mx-4 flex h-[80vh] items-center justify-center overflow-hidden">
        <HeroScene />
        <div className="pointer-events-none relative z-10 text-center">
          <h1 className="font-display text-5xl font-extrabold tracking-tight sm:text-7xl">
            Where cricket careers
            <br />
            <span className="bg-gradient-to-r from-pitch-light via-stadium to-leather-light bg-clip-text text-transparent">
              get discovered
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-zinc-300">
            The professional network for players, coaches, and scouts. Showcase verified talent,
            track live scores, and run grassroots tournaments.
          </p>
          <div className="pointer-events-auto mt-8 flex justify-center gap-3">
            <Link href="/signup" className="btn-pitch">
              Create your profile
            </Link>
            <Link href="/talent" className="btn-leather">
              Scout talent
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-16 grid gap-6 sm:grid-cols-3">
        {features.map((f) => (
          <Link key={f.title} href={f.href} className="card transition hover:-translate-y-1">
            <h2 className={`text-lg font-bold ${f.accent}`}>{f.title}</h2>
            <p className="mt-2 text-sm text-zinc-300">{f.body}</p>
          </Link>
        ))}
      </section>
    </>
  );
}
