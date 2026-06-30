import Link from 'next/link';
import Image from 'next/image';
import AuthNav from '@/components/ui/AuthNav';

const links = [
  { href: '/talent', label: 'Talent Feed' },
  { href: '/dashboard', label: 'Live Scores' },
  { href: '/tournaments', label: 'Tournaments' },
  { href: '/compare', label: 'Compare' },
  { href: '/connections', label: 'Connections' },
  { href: '/messages', label: 'Messages' },
  { href: '/#news', label: 'News' },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-night-edge bg-night/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold">
          <Image
            src="/cricnet-logo.png"
            alt="CricNet logo"
            width={32}
            height={32}
            priority
            className="h-8 w-8 rounded-full object-contain"
          />
          <span className="bg-gradient-to-r from-[#FF9933] via-white to-[#138808] bg-clip-text text-transparent">
            CricNet
          </span>
        </Link>
        <div className="hidden gap-6 text-sm text-zinc-300 sm:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="transition hover:text-stadium">
              {l.label}
            </Link>
          ))}
        </div>
        <div className="flex gap-2">
          <AuthNav />
        </div>
      </nav>
    </header>
  );
}
