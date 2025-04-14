import tseslint from "typescript-eslint";
import perfectionist from "eslint-plugin-perfectionist";

export default [
  {
    files: ["src/**/*.ts"],
    ignores: ["dist/**"],
    rules: {
      "prefer-const": "error",
      "no-nested-ternary": "error",
      "no-unneeded-ternary": "error",
      "no-console": "warn",
      "perfectionist/sort-imports": "error",
      "perfectionist/sort-exports": "error",
    },
    plugins: {
      perfectionist,
    },
  },
  tseslint.configs.base,
];
