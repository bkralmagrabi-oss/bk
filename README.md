# BK Web Design

Bilingual (English/Arabic) marketing site for BK Web Design, built with Next.js (App Router) and TypeScript.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it.

## Structure

- `src/app` — App Router entry (`layout.tsx`, `page.tsx`, `globals.css`)
- `src/components` — page sections (Header, Hero, Services, Portfolio, About, Contact, Footer) plus shared UI (Logo, Reveal, LogoWatermark)
- `src/context` — `LanguageContext` powers the EN/AR toggle and RTL layout
- `src/lib/translations.ts` — EN/AR copy
- `static-version/` — the original plain HTML/CSS/JS version of the site, kept for reference

## Build

```bash
npm run build
```
