/* Demo modules */
import "./demo/1 configure.js";
import { basics } from "./demo/2 basics.js";
import { postRequest } from "./demo/3 POST.js";
import { headers } from "./demo/4 Headers.js";
import { exceptionHandling } from "./demo/5 Exception Handling.js";
import { responseValidation } from "./demo/6 Runtime Response Validation.js";
import { customTimeout } from "./demo/7 Custom Timeout.js";
import { customOptions } from "./demo/8 Custom Options.js";
import { uncommonMethods } from "./demo/9 Uncommon HTTP Methods.js";
import { exceptionTypeNarrowing } from "./demo/10 Exception type narrowing.js";
import { lazyLoading } from "./demo/11 Lazy Loading.js";
import { overrideDefaultValues } from "./demo/12 Override default values.js";

/* Utilities */
import { printGroup } from "./utils.js";

(async function () {
  await printGroup("Basic use", basics);

  await printGroup("Simple POST requests", postRequest);

  await printGroup("Working with Headers", headers);

  await printGroup("Error Handling", exceptionHandling);

  await printGroup("Runtime Response Validation", responseValidation);

  await printGroup("Custom Timeout", customTimeout);

  await printGroup("Custom Options", customOptions);

  await printGroup("Uncommon HTTP methods", uncommonMethods);

  await printGroup("Error Type Narrowing", exceptionTypeNarrowing);

  await printGroup("Safely override default values", overrideDefaultValues);

  await printGroup("Lazy Loading", lazyLoading);
})();
