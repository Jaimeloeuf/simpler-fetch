/* Demo modules */
import "./demo/1 configure.js";
import { basics } from "./demo/2 basics.js";

/* Utilities */
import { printGroup } from "./utils.js";

(async function () {
  await printGroup("Basic use", basics);
})();
