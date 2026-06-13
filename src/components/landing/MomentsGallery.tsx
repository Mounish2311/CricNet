'use client';

import { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';

// ---------------------------------------------------------------------------
// Glorious moments of Indian cricket.
// Drop real photos into /public/moments/ using these exact filenames and they
// appear automatically. Until then, each card shows a styled gradient + caption
// (graceful fallback), so the section looks finished with zero assets.
// ---------------------------------------------------------------------------
interface Moment {
  src: string;
  year: string;
  caption: string;
  // depth: 0 = far (small, slow parallax), 1 = near (large, strong parallax)
  depth: number;
  // approximate placement in the hero (% of container)
  x: number;
  y: number;
  rotate: number;
  // fallback gradient when the image is missing
  from: string;
  to: string;
}

// Seven moments arranged as a frame around the centered headline:
//   • three across the top      (1983 · 2007 · 2013)
//   • two flanking the middle   (2001 left · 2024 right)
//   • two along the bottom      (Tendulkar left · 2011 center)
// Depths are varied so near cards (big, strong parallax) and far cards (small,
// gentle drift) interleave. The headline core (~x28–62 / y30–58) is kept clear.
const MOMENTS: Moment[] = [
  {
    src: '/moments/1983-world-cup.jpg',
    year: '1983',
    caption: 'Lord’s — the first World Cup',
    depth: 0.5,
    x: 3,
    y: 10,
    rotate: -7,
    from: '#0e3d27',
    to: '#1f7a4d',
  },
  {
    src: '/moments/2007-t20-world-cup.jpg',
    year: '2007',
    caption: 'Johannesburg — inaugural T20 crown',
    depth: 0.6,
    x: 38,
    y: 4,
    rotate: 4,
    from: '#8b1a1a',
    to: '#c0392b',
  },
  {
    src: '/moments/2013-champions-trophy.jpg',
    year: '2013',
    caption: 'Edgbaston — Champions Trophy glory',
    depth: 0.85,
    x: 70,
    y: 8,
    rotate: 6,
    from: '#0e3d27',
    to: '#2fae6f',
  },
  {
    src: '/moments/2001-kolkata-test.jpg',
    year: '2001',
    caption: 'Eden Gardens — the great escape',
    depth: 0.7,
    x: 1,
    y: 50,
    rotate: 5,
    from: '#8b1a1a',
    to: '#f5d77a',
  },
  {
    src: '/moments/2024-t20-world-cup.jpg',
    year: '2024',
    caption: 'Barbados — T20 redemption',
    depth: 1,
    x: 72,
    y: 46,
    rotate: 3,
    from: '#1f7a4d',
    to: '#c0392b',
  },
  {
    src: '/moments/tendulkar-farewell.jpg',
    year: '2013',
    caption: 'Mumbai — the Master’s farewell',
    depth: 0.65,
    x: 8,
    y: 70,
    rotate: 4,
    from: '#8b1a1a',
    to: '#f5d77a',
  },
  {
    src: '/moments/2011-world-cup-final.jpg',
    year: '2011',
    caption: 'Wankhede — Dhoni finishes in style',
    depth: 0.95,
    x: 40,
    y: 68,
    rotate: -2,
    from: '#1f7a4d',
    to: '#f5d77a',
  },
];

function MomentCard({
  moment,
  pointerX,
  pointerY,
}: {
  moment: Moment;
  pointerX: ReturnType<typeof useMotionValue<number>>;
  pointerY: ReturnType<typeof useMotionValue<number>>;
}) {
  const [imgOk, setImgOk] = useState(true);
  const depth = moment.depth;

  // Parallax: nearer cards (higher depth) shift more with the pointer.
  const tx = useTransform(pointerX, [-0.5, 0.5], [-30 * depth, 30 * depth]);
  const ty = useTransform(pointerY, [-0.5, 0.5], [-22 * depth, 22 * depth]);
  const sx = useSpring(tx, { stiffness: 60, damping: 18 });
  const sy = useSpring(ty, { stiffness: 60, damping: 18 });

  const size = 150 + depth * 150; // px, near cards larger

  return (
    <motion.figure
      className="absolute"
      style={{
        left: `${moment.x}%`,
        top: `${moment.y}%`,
        x: sx,
        y: sy,
        zIndex: Math.round(depth * 10),
        rotate: moment.rotate,
        width: size,
      }}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: depth * 0.2 }}
    >
      <motion.div
        animate={{ y: [0, -10 - depth * 8, 0] }}
        transition={{ duration: 5 + depth * 3, repeat: Infinity, ease: 'easeInOut' }}
        className="overflow-hidden rounded-2xl border border-night-edge shadow-floodlight"
        style={{ filter: `brightness(${0.7 + depth * 0.3})` }}
      >
        <div className="relative aspect-[4/3] w-full">
          {imgOk ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={moment.src}
              alt={moment.caption}
              className="h-full w-full object-cover"
              onError={() => setImgOk(false)}
            />
          ) : (
            <div
              className="flex h-full w-full items-end p-3"
              style={{
                backgroundImage: `linear-gradient(135deg, ${moment.from}, ${moment.to})`,
              }}
            >
              <span className="font-display text-3xl font-extrabold text-white/30">
                {moment.year}
              </span>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
            <figcaption className="text-[11px] font-medium leading-tight text-zinc-100">
              <span className="text-stadium">{moment.year}</span> · {moment.caption}
            </figcaption>
          </div>
        </div>
      </motion.div>
    </motion.figure>
  );
}

export default function MomentsGallery() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });
  // Whole gallery drifts up and fades a little as you scroll past it.
  const galleryY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const galleryOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  function onPointerMove(e: React.PointerEvent) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    pointerX.set((e.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  return (
    <section
      ref={containerRef}
      onPointerMove={onPointerMove}
      className="relative -mx-4 flex min-h-[92vh] items-center justify-center overflow-hidden"
      style={{ perspective: 1200 }}
    >
      {/* Floating moments */}
      <motion.div
        className="absolute inset-0"
        style={{ y: galleryY, opacity: galleryOpacity }}
      >
        {MOMENTS.map((m) => (
          <MomentCard key={m.src} moment={m} pointerX={pointerX} pointerY={pointerY} />
        ))}
      </motion.div>

      {/* Headline */}
      <motion.div
        className="pointer-events-none relative z-20 px-4 text-center"
        style={{ y: galleryY }}
      >
        <p className="mb-3 text-xs uppercase tracking-[0.3em] text-stadium/80">
          Glorious moments
        </p>
        <h1 className="font-display text-5xl font-extrabold tracking-tight sm:text-7xl">
          The history of Indian
          <br />
          <span className="bg-gradient-to-r from-pitch-light via-stadium to-leather-light bg-clip-text text-transparent">
            cricket, in motion
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-zinc-300">
          Inspired by cricket’s greatest moments. Built for the players who will
          create the next ones.
        </p>
      </motion.div>
    </section>
  );
}
