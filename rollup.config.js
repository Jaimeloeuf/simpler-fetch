import ts from "rollup-plugin-ts";
import terser from "@rollup/plugin-terser";

export default {
  // Use the TS source file as entry. The plugin will transpile it.
  input: "src/index.ts",

  // Output a single source file only, with source map and types.
  output: {
    file: "dist/index.js",
    sourcemap: true,
  },

  plugins: [ts(), terser()],
};
