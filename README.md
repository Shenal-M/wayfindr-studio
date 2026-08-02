# Wayfindr Studio

Marketing site and CMS-driven case study platform for Wayfindr Studio, a strategic design agency. Built with [Next.js](https://nextjs.org) (App Router) and [Sanity](https://www.sanity.io) as a headless CMS.

## Stack

- **Next.js 16** (App Router, React 19)
- **Tailwind CSS v4** — design tokens defined in `src/app/globals.css`
- **Sanity v4** — embedded Studio at `/studio`, content fetched via GROQ in `src/sanity/lib/queries.ts`
- **TypeScript** throughout

## Getting Started

Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site, and [http://localhost:3000/studio](http://localhost:3000/studio) for the Sanity Studio.

You'll need a `.env.local` with:

```
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=
```

Every page falls back to hardcoded content in `src/constants.ts` when Sanity has no data, so the site renders fully even against an empty dataset.

## Project Structure

```
src/
├─ app/
│  ├─ (site)/          marketing routes: home, agency, work, services, contact
│  └─ studio/           embedded Sanity Studio
├─ components/          shared UI (nav, footer, carousels, scroll effects)
├─ sanity/               client, GROQ queries, and schema types
├─ types.ts              shared content types
└─ constants.ts          fallback content
```

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — lint the codebase

## Deploy

The site is set up to deploy on [Vercel](https://vercel.com); see the [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying) for details.
