import { readFileSync, writeFileSync } from "node:fs";
import { minify } from "terser";

minify(readFileSync("./dist/index.js", "utf8"), {
  // Generate sourcemap after minification
  sourceMap: true,

  ecma: 2016,

  // Compression options
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
}).then(({ code, sourceMap }) => {
  writeFileSync("./dist/index.js", code);
});
