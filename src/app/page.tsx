import dynamic from 'next/dynamic';
import Link from 'next/link';
import Reveal from '@/components/ui/Reveal';

const HeroScene = dynamic(() => import('@/components/three/HeroScene'), { ssr: false });

const steps = [
  { n: '01', title: 'Build your profile', body: 'Pick your role — player, coach, or scout — and showcase your game.' },
  { n: '02', title: 'Play verified matches', body: 'Stats from ball-by-ball scored tournaments carry a verified badge scouts can trust.' },
  { n: '03', title: 'Get discovered', body: 'Scouts filter by role, location, and skill level, then connect and message you directly.' },
];

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
        {features.map((f, i) => (
          <Reveal key={f.title} delay={i * 120}>
            <Link href={f.href} className="card block h-full transition hover:-translate-y-1">
              <h2 className={`text-lg font-bold ${f.accent}`}>{f.title}</h2>
              <p className="mt-2 text-sm text-zinc-300">{f.body}</p>
            </Link>
          </Reveal>
        ))}
      </section>

      <section className="mt-24">
        <Reveal>
          <h2 className="text-center text-2xl font-bold">
            From the local pitch to the <span className="text-pitch-light">scout&apos;s shortlist</span>
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 150}>
              <div className="card h-full">
                <span className="font-mono text-3xl font-bold text-stadium/40">{s.n}</span>
                <h3 className="mt-2 font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-zinc-400">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mt-24">
        <Reveal>
          <div className="card flex flex-col items-center gap-4 bg-gradient-to-br from-night-card to-pitch-dark/40 py-12 text-center">
            <h2 className="text-2xl font-bold">Stats that scouts can trust</h2>
            <p className="max-w-lg text-sm text-zinc-300">
              Unlike self-reported numbers, CricNet stats come from real, ball-by-ball scored
              matches. Compare any two players head-to-head on verified data.
            </p>
            <Link href="/compare" className="btn-pitch">
              Compare players
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
