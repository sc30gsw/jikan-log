# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Package Manager

Use **bun** exclusively. Never use npm, yarn, or pnpm.

```bash
bun install       # install deps
bun run <script>  # run scripts
bunx <tool>       # run tools directly
```

## Key Commands

```bash
bun run check     # lint + format check + tsc (run before committing)
bun run fix       # auto-fix lint + format issues
bun run tsc       # type check only
```

## Expo Dev Server

Must run inside **tmux** (direct `expo start` is blocked):

```bash
tmux new-session -d -s dev 'bun expo start'
tmux attach -t dev
```

## Branch Naming

- `feature/<name>` for new features
- `fix/<name>` for bug fixes

## Key Libraries

Prefer these over common alternatives:

| Purpose        | Library                                      | Do NOT use       |
| -------------- | -------------------------------------------- | ---------------- |
| Validation     | `valibot`                                    | zod              |
| UI components  | `HeroUI Native` (via `className` + Tailwind) | other RN UI libs |
| API routes     | `elysia`                                     | express, hono    |
| Database       | `@libsql/client` (Turso)                     | —                |
| Data fetching  | `@tanstack/react-query`                      | —                |
| Error handling | `better-result`                              | try-catch        |

## Environment Variables

| Variable                       | Purpose            |
| ------------------------------ | ------------------ |
| `EXPO_PUBLIC_TURSO_URL`        | Turso database URL |
| `EXPO_PUBLIC_TURSO_AUTH_TOKEN` | Turso auth token   |

> `EXPO_PUBLIC_` prefix exposes variables to the client bundle. Never put secrets in `EXPO_PUBLIC_` variables in production.

## Coding Standards

Detailed rules are auto-loaded from `.claude/rules/`. Key references:

- `typescript/better-result.md` — Result pattern (critical, no try-catch)
- `typescript/react-conventions.md` — named exports, function declarations
- `typescript/project-structure.md` — feature-based architecture, `~` alias
