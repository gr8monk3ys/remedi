import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import nextPlugin from "@next/eslint-plugin-next";

export default [
  // Ignore patterns
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "coverage/**",
      "*.config.js",
      "*.config.mjs",
      "prisma/seed*.js",
      "prisma/seed*.ts",
      "scripts/**",
      "public/sw.js",
      "e2e/**",
    ],
  },
  // Base JS recommended
  js.configs.recommended,
  // TypeScript recommended
  ...tseslint.configs.recommended,
  // React configuration
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "@next/next": nextPlugin,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      // React rules
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      // Next.js rules
      "@next/next/no-html-link-for-pages": "error",
      "@next/next/no-img-element": "warn",
      // TypeScript rules
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-empty-object-type": "off",
      // General rules
      "no-console": ["warn", { allow: ["debug", "info", "warn", "error"] }],
    },
  },
];
