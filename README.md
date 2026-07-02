# Website prompts → HTML

Three self-contained HTML pages, one per website prompt. Each file is a single
`.html` you can open directly in a browser — no build step, no `npm install`.
React, Tailwind, and the animation/icon libraries are loaded from CDNs and the
JSX is transpiled in-browser with Babel standalone.

| File | Brand | Stack in the prompt | What it shows |
|------|-------|---------------------|---------------|
| `1-mainframe.html` | **Mainframe** | React + Tailwind | Full-screen hero, mouse-scrub background video, typewriter intro, action pills |
| `2-prisma.html` | **Prisma** | React + Tailwind + framer-motion + lucide-react | Hero / About / Features, word pull-up animations, scroll-linked text reveal |
| `3-wanderful.html` | **Wanderful** | React + Tailwind + GSAP + lucide-react | Cinematic hero with GSAP mouse-parallax video and a liquid-glass navbar |

## Schwartz Media Managing — background comparison

The three `smm-*.html` files are the **full Schwartz Media Managing site**
(`smm/_base.html`, i.e. the original `index.html` — all content, fonts, logos,
the phone/Instagram mockup, stats, case studies, charts, FAQ, tiers, footer and
JS is kept untouched). The only change per file is the page background: each one
places one prompt's background treatment behind the layout, with a readable
dark scrim on top, so you can compare how each background looks under the same
clean content.

| File | Background from | Behaviour |
|------|-----------------|-----------|
| `smm-mainframe.html` | Mainframe | Fixed mouse-scrub video (move the mouse to scrub) |
| `smm-prisma.html` | Prisma | Auto-playing cinematic video + fractal-noise overlay |
| `smm-wanderful.html` | Wanderful | Auto-playing video with GSAP mouse-parallax + liquid-glass navbar |

Regenerate them after editing the base with `node smm/_generate.mjs`. The site
uses relative asset paths (`logos/…`, `posts/…`) exactly as in the original, so
drop those asset folders next to the HTML files for logos and post thumbnails
to appear.

## Opening

Just double-click a file, or serve the folder and browse to it:

```bash
python3 -m http.server 8000
# then open http://localhost:8000/1-mainframe.html
```

An internet connection is required the first time so the CDN assets
(React, Tailwind, framer-motion, GSAP, lucide, fonts, and the background
videos referenced in the prompts) can load.

## Notes

- The prompts describe React + Vite + TypeScript projects. These pages keep the
  exact same markup, styling, animations, and asset URLs, but package each one
  as a single portable HTML file instead of a full Vite project.
- Fonts, videos, and image assets use the URLs given in the original prompts.
