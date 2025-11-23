import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import unusedImports from "eslint-plugin-unused-imports";

/**
 * ESLint Flat Config
 * Works with: Node ESM + TypeScript + Fastify
 */
export default [
  // Base JS config
  js.configs.recommended,

  // TypeScript config
  ...tseslint.configs.recommended,

  {
    files: ["**/*.ts"],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        sourceType: "module",
      },
    },
    plugins: {
      import: importPlugin,
      "unused-imports": unusedImports,
    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json",
        },
      },
    },
    rules: {
      // Import rules
      "import/no-unresolved": "error",
      "@typescript-eslint/no-explicit-any": "warn",

      // Remove unused imports automatically
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        { vars: "all", varsIgnorePattern: "^_", args: "after-used" },
      ],

      // Best practice for Fastify/Node devs
      "no-console": "off",

      // Throwing literals (TypeScript version preferred)
      "@typescript-eslint/only-throw-error": "error",

      // Prettier integration (turn off conflicting rules)
      ...prettier.rules,
    },
  },
];
