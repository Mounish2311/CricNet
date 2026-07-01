import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/ui/Navbar';

// Body copy
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

// Headings — variable font, so ExtraBold (800) is available via font-extrabold
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CricNet — The Professional Network for Cricket',
  description:
    'Showcase your cricket talent, connect with scouts and coaches, follow live scores, and run verified tournaments.',
  icons: {
    icon: '/cricnet-logo.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`}>
      <body>
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 pb-20">{children}</main>
      </body>
    </html>
  );
}
