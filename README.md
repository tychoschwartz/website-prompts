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
