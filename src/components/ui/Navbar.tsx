import Link from 'next/link';

const links = [
  { href: '/talent', label: 'Talent Feed' },
  { href: '/dashboard', label: 'Live Scores' },
  { href: '/tournaments', label: 'Tournaments' },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-night-edge bg-night/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold">
          <span className="inline-block h-3 w-3 rounded-full bg-leather shadow-[0_0_10px_rgba(192,57,43,0.8)]" />
          Cric<span className="text-pitch-light">Net</span>
        </Link>
        <div className="hidden gap-6 text-sm text-zinc-300 sm:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="transition hover:text-stadium">
              {l.label}
            </Link>
          ))}
        </div>
        <div className="flex gap-2">
          <Link href="/login" className="px-3 py-1.5 text-sm text-zinc-300 hover:text-white">
            Log in
          </Link>
          <Link href="/signup" className="btn-pitch text-sm">
            Join CricNet
          </Link>
        </div>
      </nav>
    </header>
  );
}
