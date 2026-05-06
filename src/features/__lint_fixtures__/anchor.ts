// Resolution anchor for the import-zones unit test.
// `import/no-restricted-paths` only fires when the import target resolves;
// the test fixture at src/shared/__lint_fixtures__/illegal-import.ts
// imports this module to trigger a layer-zone violation.
//
// Excluded from the project-wide lint run via eslint.config.mjs ignores.
export const featuresAnchor = "anchor";
