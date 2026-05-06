# MoveQuest source layout

This codebase follows a **feature-sliced lite** layout with four layers. Layer
direction is enforced by ESLint (`import/no-restricted-paths`); CI fails on
violation.

## Layers

```
app  →  features  →  entities  →  shared
```

A layer may import only from layers to its right. `shared` may not import from
any other layer.

| Layer        | Purpose                                                    | Allowed to import from           |
| ------------ | ---------------------------------------------------------- | -------------------------------- |
| `src/app`    | Next.js routes, layouts, middleware, error boundaries.     | `features`, `entities`, `shared` |
| `src/features` | Feature-scoped UI compositions (e.g. `landing/`, `quiz/`). | `entities`, `shared`             |
| `src/entities` | Domain entities: Zod schemas + `z.infer` types.            | `shared`                         |
| `src/shared` | Cross-cutting primitives, helpers, styles, i18n config.    | (nothing in `src/`; `node_modules` only) |

## One example import per layer

- **app** imports a feature:
  `import { LandingPage } from "@/features/landing";`
- **features** imports a primitive:
  `import { Button } from "@/shared/ui/button";`
- **features** imports an entity schema:
  `import { ActivitySchema } from "@/entities/activity";`
- **entities** imports an external library (no UI):
  `import { z } from "zod";`
- **shared** never imports from `app`, `features`, or `entities` — only from `node_modules`.

## Import path aliases

Path aliases are shaped to match future workspace package names:

- `@/app/*` → `src/app/*`
- `@/features/*` → `src/features/*`
- `@/entities/*` → `src/entities/*`
- `@/shared/*` → `src/shared/*`

## Primitive imports

Primitives have **no top-level barrel** at `src/shared/ui/index.ts`. Import each
primitive from its own folder:

```ts
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
```

This keeps tree-shaking deterministic and code navigation cheap.

## Entity schemas

Each entity owns `model/schema.ts` exporting `<Entity>Schema` and the
`z.infer` type. Six entity folders exist after Foundation: `activity`,
`archetype`, `question`, `answer`, `tag`, `translation`.

Language-neutral scoring tags live inside schema-validated entities; translated
labels live in `messages/<locale>/...` and are referenced by stable key.

## i18n

EN and RU are first-class. Locale negotiation runs once in
`src/middleware.ts`. EN-fallback for missing RU strings is implemented exactly
once in `src/shared/i18n/get-messages.ts` via deep-merge of `en` under the
requested locale before passing messages to next-intl.

## What does NOT belong here

- `pages/`, `widgets/`, `processes/` — these are full-FSD vocabulary that we do
  not use. Stick to the four layers above.
- `src/components/` — primitives live in `src/shared/ui/<primitive>/`.
- `src/lib/` — shared helpers live in `src/shared/lib/`.
