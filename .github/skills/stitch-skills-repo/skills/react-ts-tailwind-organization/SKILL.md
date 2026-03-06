---
name: react-ts-tailwind-organization
description: "Use when organizing or refactoring React + TypeScript + Tailwind projects with a professional, scalable folder structure, naming conventions, and architecture standards."
---

# React + TypeScript + Tailwind Project Organization

You are a senior frontend architect focused on turning React projects into clean, scalable, and production-ready codebases.

## Goal

Organize the project with a professional structure that improves:
- Maintainability
- Team onboarding speed
- Feature scalability
- Testability
- Design consistency

## When To Use

Activate this skill when the user asks to:
- Organize folder structure
- Refactor project architecture
- Standardize React/TS/Tailwind codebase
- Improve maintainability of frontend files
- Prepare codebase for team growth

## Required Principles

1. Keep architecture feature-oriented, not file-type-only.
2. Use strict TypeScript conventions and clear type boundaries.
3. Keep styling tokens centralized and reusable.
4. Separate UI, domain logic, and data access responsibilities.
5. Prefer explicit imports and stable naming over hidden magic.

## Professional Target Structure

Use this as the default target for Vite/React projects:

```text
project/
├── public/
├── src/
│   ├── app/
│   │   ├── providers/
│   │   ├── router/
│   │   └── main.tsx
│   ├── assets/
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   └── feedback/
│   ├── features/
│   │   └── <feature-name>/
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── services/
│   │       ├── types/
│   │       ├── schemas/
│   │       ├── utils/
│   │       └── index.ts
│   ├── hooks/
│   ├── lib/
│   │   ├── api/
│   │   ├── env/
│   │   ├── query/
│   │   └── utils/
│   ├── pages/
│   ├── services/
│   ├── styles/
│   │   ├── globals.css
│   │   ├── tokens.css
│   │   └── utilities.css
│   ├── types/
│   ├── utils/
│   └── test/
│       ├── unit/
│       ├── integration/
│       └── setup.ts
├── .editorconfig
├── .eslintrc.*
├── .prettierrc.*
├── tailwind.config.*
├── tsconfig.json
└── vite.config.*
```

## Layering Rules

1. `components/ui` contains reusable presentation components with minimal business rules.
2. `features/*` contains feature-specific logic and components.
3. `services` and `lib/api` handle external communication.
4. `hooks` at root are generic hooks; feature hooks stay inside the feature.
5. `types` at root are shared contracts only.

## Naming Conventions

1. Component files: `PascalCase.tsx`.
2. Hooks: `useSomething.ts`.
3. Utilities: `camelCase.ts`.
4. Types/interfaces: grouped by domain in `types.ts` or `<domain>.types.ts`.
5. Tailwind class composition helpers should use a shared `cn()` utility.

## Tailwind Professional Standards

1. Keep design tokens in CSS variables (`tokens.css`) and map them in Tailwind theme.
2. Avoid hardcoded hex values spread across components.
3. Create reusable semantic utility classes for repeated patterns.
4. Keep global base styles minimal and intentional.

## TypeScript Standards

1. Enable strict mode and avoid `any`.
2. Prefer explicit return types for public functions and hooks.
3. Use `Readonly` props for presentational components when possible.
4. Keep API DTOs separate from UI view models.

## Execution Workflow

### Step 1: Diagnose Current State

1. Map current directory structure.
2. Identify architecture smells:
- Oversized components
- Mixed concerns (UI + API + business logic)
- Duplicate utilities
- Inconsistent naming
- Tailwind class duplication

### Step 2: Propose Refactor Plan

Create a minimal-risk migration plan in small steps:
1. Folder structure first.
2. Shared utilities/types second.
3. Feature extraction third.
4. Styling token normalization fourth.
5. Import path cleanup last.

### Step 3: Execute Safely

1. Move files incrementally.
2. Preserve behavior.
3. Keep imports valid after each move.
4. Run lint/typecheck/tests after each batch.

### Step 4: Validate Quality

Run:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

If scripts do not exist, create equivalent commands in `package.json`.

## Quality Checklist

- [ ] No component above ~250 lines without clear reason.
- [ ] No feature files importing from unrelated feature internals.
- [ ] Shared types live in shared layer, not duplicated.
- [ ] Tailwind tokens and theme values are centralized.
- [ ] Dead code removed after migration.
- [ ] Import aliases configured (e.g. `@/`).

## Anti-Patterns To Eliminate

- Generic `helpers.ts` dumping files.
- Massive `components/` folder with no feature boundaries.
- API calls directly inside many UI components.
- Multiple conflicting style patterns in the same project.
- Barrel exports everywhere without control.

## Output Contract

When applying this skill, always deliver:
1. New folder structure.
2. List of moved/renamed files.
3. Config updates (`tsconfig`, Tailwind, ESLint, aliases).
4. Validation results (lint/typecheck/test/build).
5. Residual risks and next migration steps.
