import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
  {
    files: ["**/*.js", "**/*.jsx"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },
]);
