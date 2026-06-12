import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/ui/Navbar';

export const metadata: Metadata = {
  title: 'CricNet — The Professional Network for Cricket',
  description:
    'Showcase your cricket talent, connect with scouts and coaches, follow live scores, and run verified tournaments.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 pb-20">{children}</main>
      </body>
    </html>
  );
}
