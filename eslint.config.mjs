import { fileURLToPath } from "node:url";
import path from "node:path";

import js from "@eslint/js";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const layerZones = {
  zones: [
    // shared MUST NOT import from app, features, or entities
    {
      target: "./src/shared",
      from: ["./src/app", "./src/features", "./src/entities"],
      message:
        "shared/* must not import from app, features, or entities. Layer direction: app → features → entities → shared.",
    },
    // entities MUST NOT import from app or features
    {
      target: "./src/entities",
      from: ["./src/app", "./src/features"],
      message:
        "entities/* must not import from app or features. Layer direction: app → features → entities → shared.",
    },
    // features MUST NOT import from app
    {
      target: "./src/features",
      from: ["./src/app"],
      message:
        "features/* must not import from app. Layer direction: app → features → entities → shared.",
    },
  ],
};

export default [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "dist/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
      "src/shared/__lint_fixtures__/**",
      "src/features/__lint_fixtures__/**",
      "next-env.d.ts",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx,mjs,cjs,js,jsx}"],
    plugins: {
      import: importPlugin,
    },
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
      globals: {
        React: "readonly",
        process: "readonly",
        console: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
        fetch: "readonly",
        Request: "readonly",
        Response: "readonly",
        Headers: "readonly",
        document: "readonly",
        window: "readonly",
        navigator: "readonly",
        HTMLElement: "readonly",
        HTMLButtonElement: "readonly",
        HTMLDivElement: "readonly",
        HTMLSpanElement: "readonly",
        HTMLInputElement: "readonly",
        HTMLAnchorElement: "readonly",
        Element: "readonly",
        MutationObserver: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        queueMicrotask: "readonly",
        globalThis: "readonly",
      },
    },
    settings: {
      "import/resolver": {
        typescript: {
          project: path.resolve(__dirname, "tsconfig.json"),
        },
        node: true,
      },
    },
    rules: {
      "import/no-restricted-paths": ["error", layerZones],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  {
    files: ["**/*.test.{ts,tsx}", "src/test/**/*.{ts,tsx}", "tests/**/*.{ts,tsx}"],
    languageOptions: {
      globals: {
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        vi: "readonly",
      },
    },
  },
];
