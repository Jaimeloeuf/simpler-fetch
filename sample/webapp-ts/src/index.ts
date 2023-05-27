/* Demo modules */
import "./demo/1 configure.js";
import { basics } from "./demo/2 basics.js";

/* Utilities */
import { runAsSection } from "./utils.js";

(async function () {
  await runAsSection(basics, "Basic use");
})();
