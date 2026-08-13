import { nextJsConfig } from "@healthalst/eslint-config/next";

export default [
  { ignores: [".next/**", "node_modules/**", "coverage/**"] },
  ...nextJsConfig,
];

