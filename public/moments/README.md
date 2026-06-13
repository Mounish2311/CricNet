# Glorious moments — image slots

Drop photos here using these **exact filenames** and they'll appear automatically
in the landing-page hero gallery (`src/components/landing/MomentsGallery.tsx`).
Until a file exists, that card shows a styled gradient + caption fallback, so the
page always looks finished.

| Filename                          | Moment                                   |
| --------------------------------- | ---------------------------------------- |
| `1983-world-cup.jpg`              | 1983 — Lord's, the first World Cup        |
| `2007-t20-world-cup.jpg`          | 2007 — inaugural T20 World Cup            |
| `2011-world-cup-final.jpg`        | 2011 — Wankhede, the winning six          |
| `2013-champions-trophy.jpg`       | 2013 — Champions Trophy                   |
| `tendulkar-farewell.jpg`          | 2013 — Tendulkar's farewell               |

## Notes
- Recommended size: ~800×600 (4:3), JPG or WebP, optimized for web.
- To add/remove/reorder moments, edit the `MOMENTS` array in
  `src/components/landing/MomentsGallery.tsx` — each entry has `src`, `year`,
  `caption`, plus layout fields (`x`, `y`, `depth`, `rotate`) and a `from`/`to`
  fallback gradient.
- Use images you have the rights to (official/licensed press photos, your own,
  or properly licensed stock). Avoid scraping copyrighted match footage.
