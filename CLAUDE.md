# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

Early-stage scaffold for a chatbot backend. The only live code is `src/server.ts`
(an Express server with a `/health` route, listening on a hard-coded port 3000).
`src/app.ts` and the files under `src/config/` (`env.ts`, `ai.config.ts`,
`database.ts`, `prisma.ts`) are **empty placeholders** that mark the intended
structure — don't assume they contain logic. The working Prisma client lives at
`src/database/client.ts`.

## Commands

The package manager is **pnpm** (enforced via `devEngines`; npm/yarn will warn).

- `pnpm dev` — run the server with hot reload (`tsx watch src/server.ts`)
- `pnpm build` — type-check and compile to `dist/` via `tsc`
- `pnpm lint` — ESLint over `src`
- `pnpm format` — Prettier write over `src`
- There is **no test runner** yet; the `test` script is a placeholder that exits 1.

### Database / Prisma workflow

1. `docker compose up -d` — starts Postgres 16 (`docker-compose.yaml`). Its
   credentials match the `DATABASE_URL` in `.env.example`; copy that to `.env`.
2. `pnpm prisma generate` — **required after every fresh checkout** (see below).
3. `pnpm prisma migrate dev` — apply/create migrations (output in `prisma/migrations/`).

## Architecture notes (the non-obvious parts)

This project uses **Prisma 7** with several conventions that differ from older
Prisma setups — most confusion will come from here:

- **Generated client is gitignored.** The `prisma-client` generator (the new ESM
  generator, not the legacy `prisma-client-js`) outputs to `src/generated/prisma`,
  which is in `.gitignore`. Nothing compiles or runs until you run
  `pnpm prisma generate`. Import the client as `../generated/prisma/client.js`
  (note the `.js` extension — required by NodeNext ESM, see below).
- **Connection config is split.** `prisma/schema.prisma`'s `datasource` block has
  **no `url`**. The CLI reads `DATABASE_URL` through `prisma.config.ts` (the Prisma 7
  config file), while the runtime client gets its connection via the
  `@prisma/adapter-pg` **driver adapter** in `src/database/client.ts`
  (`new PrismaPg({ connectionString: process.env.DATABASE_URL })`).
- **Import the shared client** from `src/database/client.ts` (exports `prisma`);
  do not instantiate `PrismaClient` elsewhere.

### ESM / TypeScript

`"type": "module"` with `module`/`moduleResolution: NodeNext`. Relative imports
**must include the `.js` extension** even though the source files are `.ts`.
`tsc` is strict; `tsx` runs TS directly in dev without a build step.

### Data model

Three models in `prisma/schema.prisma`: `User` (with a `Role` enum: `user`/`admin`),
`Conversation`, and `Message` (`Message.conversationId` → `Conversation`,
`onDelete: Cascade`). IDs are UUID strings.

## Conventions

- ESLint config (`eslint.config.mjs`) flags `console` as a warning and treats
  unused vars as errors, except names prefixed with `_` (use `_req`, `_res` for
  intentionally-unused Express handler args — `server.ts` already does this).
