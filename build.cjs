// "minify": "npx uglifyjs --compress --mangle -o ./dist/index.js -- index.js"
// npx uglifyjs --compress --mangle --mangle-props reserved=[run,runJSON] -o ./dist/index.js -- index.js

const { minify } = require("uglify-js");

const result = minify(require("fs").readFileSync("./index.js", "utf-8"));

// runtime error, or `undefined` if no error
if (result.error) console.error(result.error);
else require("fs").writeFileSync("./dist/index.js", result.code);
