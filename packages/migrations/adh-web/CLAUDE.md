# ADH Web - CLAUDE.md

## Package

- **Name**: `@magic-migration/adh-web`
- **Path**: `packages/migrations/adh-web/`
- **Role**: Web migration of the ADH (Adherents/Caisse) Magic Unipaas application

## Commands

```bash
pnpm dev              # Vite dev server (port 3071)
pnpm build            # tsc -b && vite build
pnpm test             # vitest run
pnpm test:watch       # vitest (watch mode)
pnpm test:coverage    # vitest run --coverage
pnpm lint             # eslint
pnpm storybook        # storybook dev (port 3072)
```

## Architecture

```
src/
  App.tsx             # Root component with routing
  main.tsx            # Entry point
  pages/              # Page components (one per migrated program)
  components/
    ui/               # Reusable UI components (Dialog, DataGrid, etc.)
    [feature]/        # Feature-specific components
  stores/             # Zustand stores (mock/API pattern)
  services/           # API service layer
  hooks/              # Custom React hooks
  types/              # TypeScript type definitions
  i18n/               # Internationalization
  lib/                # Utility functions
  data/               # Static data / fixtures
  fixtures/           # Test fixtures
  test/               # Test utilities
  __tests__/          # Page-level integration tests
```

## Stack

- React 19 + Vite 7 + TypeScript 5.9
- Tailwind CSS v4 (`@import "tailwindcss"`, `@theme {}`, NO tailwind.config.js)
- Zustand for state management
- Axios for API calls
- Lucide React for icons
- React Hook Form + Zod for forms
- Storybook for component dev

## Ports

- `3071` - Vite dev server
- `3072` - Storybook
- Proxy `/api` -> `:5287` (C# Caisse API)

## Code Patterns

| Pattern | Reference |
|---------|-----------|
| Store with mock/API | `stores/transactionStore.ts` |
| Dialog modal | `components/ui/Dialog.tsx` |
| DataGrid | `components/ui/DataGrid.tsx` |
| Print preview | `pages/facture/FacturePreview.tsx` |

## Rules

- Tailwind v4 syntax only (no tailwind.config.js)
- `erasableSyntaxOnly`: use `as const` objects instead of TS enums
- Named exports (no default exports except pages)
- Co-located tests in `__tests__/` and `*.test.ts` files
- No `any` types - use `unknown` or precise types
- French for UI labels, English for code/comments
