import { readFileSync, writeFileSync } from "node:fs";
import { minify } from "terser";

minify(readFileSync("./dist/index.js", "utf8"), {
  // Generate sourcemap for the minified code
  sourceMap: {
    // This is only used to set //# sourceMappingURL=out.js.map in the minified code output
    url: "index.js.map",

    // Using content since this is compressing compiled JavaScript with an existing source map,
    // to use the non-minified / mangled symbols that are preserved in the original TSC source map.
    content: readFileSync("./dist/index.js.map", "utf8"),
  },

  ecma: 2016,

  compress: {
    // Set all default compression options
    defaults: true,

    // Inline calls to function with simple return statement
    inline: true,

    // Used when compressing ES6 module to enable strict mode set toplevel option to true,
    // where any unreferenced functions or variables in the top level scope will be dropped
    module: true,

    // The maximum number of times to run compress. In some cases more than one pass leads to further compressed code. Keep in mind more passes will take more time.
    passes: 10,
  },

  mangle: {
    // Since it is a standalone ES6 module, it is safe to mangle any module top
    // level function names that are not exported to further minify the size.
    toplevel: true,
  },
}).then(({ code, map }) => {
  writeFileSync("./dist/index.js", code);

  // Save the updated source map for the minified code
  writeFileSync("./dist/index.js.map", map);
});
