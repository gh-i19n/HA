import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import turbo from "eslint-plugin-turbo";
import tseslint from "typescript-eslint";

export const baseConfig = [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    plugins: { turbo },
    rules: { "turbo/no-undeclared-env-vars": "error" },
  },
  { ignores: ["dist/**", ".next/**", "coverage/**"] },
];

