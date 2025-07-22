import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,

  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "coverage/**",
      "*.config.{js,ts,mjs}",
      ".env*",
      "**/*.d.ts",
    ],
  },

  {
    files: ["src/**/*.{js,ts,mts,cts}"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/prefer-nullish-coalescing": "error",
      "@typescript-eslint/prefer-optional-chain": "error",
      "@typescript-eslint/no-unnecessary-type-assertion": "error",
      "@typescript-eslint/no-floating-promises": "error",

      "prefer-const": "error",
      "no-var": "error",
      "no-console": "off",
      "no-debugger": "error",
      "no-eval": "error",
      "no-implied-eval": "error",

      "no-duplicate-imports": "error",
      "sort-imports": [
        "error",
        {
          ignoreCase: true,
          ignoreDeclarationSort: true,
        },
      ],

      "no-restricted-globals": [
        "error",
        {
          name: "window",
          message:
            "Use globalThis or check if window exists for SSR compatibility",
        },
        {
          name: "document",
          message:
            "Use globalThis or check if document exists for SSR compatibility",
        },
      ],
    },
  },

  {
    files: ["**/*.{test,spec}.{js,ts}", "tests/**/*.{js,ts}"],
    languageOptions: {
      globals: {
        ...globals.node,
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        vi: "readonly",
        jest: "readonly",
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-floating-promises": "off",
      "no-console": "off",
      "no-restricted-globals": "off",
    },
  },

  {
    files: [
      "*.config.{js,ts,mjs}",
      "scripts/**/*.{js,ts}",
      "build/**/*.{js,ts}",
    ],
    languageOptions: {
      globals: {
        ...globals.node,
      },
      parserOptions: {
        project: null,
      },
    },
    rules: {
      "@typescript-eslint/no-var-requires": "off",
      "@typescript-eslint/no-require-imports": "off",
      "no-console": "off",
      "@typescript-eslint/no-floating-promises": "off",
    },
  },
];
