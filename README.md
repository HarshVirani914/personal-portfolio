# Harsh Virani — Portfolio

Personal portfolio site for **Harsh Virani**, full-stack engineer and AI systems builder. Built with Next.js 16, a WebGL flow backdrop, and a calm black-and-white design system.

**Live:** [https://harsh-virani.vercel.app](https://harsh-virani.vercel.app)

## Highlights

- **Home** — Hero with morphing portrait, project grid, and contact card
- **Projects** — Six case-study cards with a detail sheet (mobile bottom sheet, centered modal on desktop)
- **About** — Experience, education, skills, Matter.js stack, research PDFs, and academic work
- **CV download** — AI/ML-focused resume PDF from the site
- **SEO** — Metadata, dynamic Open Graph / Twitter images (1200×630), sitemap, `robots.txt`
- **Analytics** — [Vercel Web Analytics](https://vercel.com/docs/analytics)
- **Accessibility** — Skip link, focus rings, reduced-motion support, keyboard-friendly dialogs

## Tech stack


| Area       | Tools                                            |
| ---------- | ------------------------------------------------ |
| Framework  | Next.js 16 (App Router), React 19, TypeScript    |
| Styling    | Tailwind CSS v4, CSS variables                   |
| Motion     | motion/react, Lenis smooth scroll                |
| Graphics   | OGL (WebGL flow shader), Matter.js (about stack) |
| Deploy     | Vercel                                           |
| OG capture | Playwright (`scripts/capture-og-image.mjs`)      |


## Getting started

### Prerequisites

- Node.js 20+
- pnpm (recommended) or npm

### Install and run

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

Copy `.env.example` to `.env.local` and set your production URL:

```bash
NEXT_PUBLIC_SITE_URL=https://harsh-virani.vercel.app
```

Used for `metadataBase`, canonical URLs, sitemap, and social preview links.

## Scripts


| Command             | Description                                                |
| ------------------- | ---------------------------------------------------------- |
| `pnpm dev`          | Development server                                         |
| `pnpm build`        | Production build                                           |
| `pnpm start`        | Run production server locally                              |
| `pnpm typecheck`    | TypeScript check                                           |
| `pnpm lint`         | ESLint                                                     |
| `pnpm lint:fix`     | ESLint with auto-fix                                       |
| `pnpm format`       | Prettier write                                             |
| `pnpm format:check` | Prettier check                                             |
| `pnpm og:capture`   | Capture homepage OG image (1200×630) — requires dev server |


### Regenerate the Open Graph image

With the site running locally:

```bash
pnpm dev
pnpm og:capture -- --url http://127.0.0.1:3000
```

Output: `public/og/homepage-desktop.png`, served via `app/opengraph-image.tsx` and `app/twitter-image.tsx`.

For production-accurate previews:

```bash
pnpm og:capture -- --url https://harsh-virani.vercel.app
```

## Project structure

```
├── app/
│   ├── about/page.tsx
│   ├── projects/page.tsx
│   ├── page.tsx                    # Home
│   ├── layout.tsx                  # Root layout, Analytics
│   ├── globals.css                 # Tokens, frame, dialog, project cards
│   ├── opengraph-image.tsx         # OG image route
│   ├── twitter-image.tsx
│   ├── robots.ts
│   └── sitemap.ts
├── components/
│   ├── about/                      # Experience, education, skills, stack, research, academic work
│   ├── contact/                    # Contact card, copy-email button, CTAs
│   ├── hero/                       # Hero, portrait morph, CTAs
│   ├── layout/                     # Nav, providers, Lenis, backdrop, skip link
│   ├── projects/                   # Grid + project detail dialog
│   ├── shaders/shader-flow.tsx
│   └── ui/                         # Motion helpers, CV download, dotted pattern
├── lib/
│   ├── projects-data.ts            # Project cards + case-study copy
│   ├── site-content.ts             # Links, research PDFs, academic work
│   ├── metadata.ts                 # SEO defaults
│   ├── site-url.ts                 # URL from env
│   └── config.ts                   # Feature flags (smooth scroll)
├── public/
│   ├── harsh_normal.webp           # Hero portrait
│   ├── harsh_waving.webp           # Hero hover portrait
│   ├── projects/                   # Project card images
│   ├── logos/                      # Education / employer logos
│   ├── research/                   # Research PDFs
│   ├── og/homepage-desktop.png     # Social preview screenshot
│   └── harsh-virani-ai-ml-cv.pdf   # Downloadable CV
└── scripts/capture-og-image.mjs
```

## Updating content


| What to change                               | Where                                                                                            |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Site name, description, OG title             | `lib/metadata.ts`                                                                                |
| Projects (copy, images, links, case studies) | `lib/projects-data.ts`                                                                           |
| Email, LinkedIn, GitHub, CV path             | `lib/site-content.ts`                                                                            |
| Hero headline and intro                      | `components/hero/hero.tsx`                                                                       |
| Portraits                                    | `public/harsh_normal.webp`, `public/harsh_waving.webp`                                           |
| About sections                               | `components/about/*.tsx` + `lib/site-content.ts` (research / academic)                           |
| CV PDF                                       | Compile from `Resumes/applications/Portfolio_AI_ML/`, copy to `public/harsh-virani-ai-ml-cv.pdf` |
| Production URL                               | `NEXT_PUBLIC_SITE_URL` in `.env.local` / Vercel env                                              |


## Deployment (Vercel)

1. Import the repository on [Vercel](https://vercel.com).
2. Set `NEXT_PUBLIC_SITE_URL` to your production domain.
3. Deploy. Enable **Analytics** in the project dashboard if you want traffic data.
4. After visual changes, re-run `pnpm og:capture` against the live URL and redeploy so link previews stay current.

## License

Private personal portfolio. All rights reserved unless otherwise noted for third-party assets (fonts, logos, etc.).