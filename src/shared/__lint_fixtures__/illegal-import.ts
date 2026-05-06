// Deliberate violation. shared MUST NOT import from features.
// This file lives inside src/shared/ specifically so that
// `import/no-restricted-paths` (target: ./src/shared) sees it.
//
// It is excluded from the project-wide `pnpm lint` run via the
// ignores list in eslint.config.mjs. The import-zones unit test
// invokes ESLint on this file explicitly and asserts the rule fires.
import { featuresAnchor } from "@/features/__lint_fixtures__/anchor";

export const illegal = featuresAnchor;
