'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

// Wraps the landing content with Lenis smooth scrolling (the Bugatti "glide").
// Scoped to the landing only — other pages keep native scrolling.
// Also enables smooth scroll-to-anchor for nav links pointing at #news etc.
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    let rafId = 0;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Intercept in-page anchor clicks so they glide instead of jumping.
    function onAnchorClick(e: MouseEvent) {
      const target = (e.target as HTMLElement)?.closest('a');
      if (!target) return;
      const href = target.getAttribute('href');
      if (!href) return;
      // Support both "#news" and "/#news"
      const hash = href.startsWith('/#') ? href.slice(1) : href;
      if (!hash.startsWith('#')) return;
      const el = document.querySelector(hash);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el as HTMLElement, { offset: -80 });
      history.replaceState(null, '', hash);
    }
    document.addEventListener('click', onAnchorClick);

    // If the page loaded with a hash (e.g. arriving from another route at
    // /#news), glide to it once layout settles.
    if (window.location.hash) {
      const el = document.querySelector(window.location.hash);
      if (el) setTimeout(() => lenis.scrollTo(el as HTMLElement, { offset: -80 }), 200);
    }

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener('click', onAnchorClick);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
