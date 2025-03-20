/* Demo modules */
import "./demo/1 configure.js";
import { basics } from "./demo/2 basics.js";
import { postRequest } from "./demo/3 POST.js";
import { headers } from "./demo/4 Headers.js";
import { exceptionHandling } from "./demo/5 Exception Handling.js";
import { responseValidation } from "./demo/6 Runtime Response Validation.js";
import { customTimeout } from "./demo/7 Custom Timeout.js";
import { customOptions } from "./demo/8 Custom Options.js";
import { exceptionTypeNarrowing } from "./demo/10 Exception type narrowing.js";
import { lazyLoading } from "./demo/11 Lazy Loading.js";
import { otherResponseDataTypes } from "./demo/13 Other response data types.js";
import { queryParams } from "./demo/14 query params.js";

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

  await printGroup("Error Type Narrowing", exceptionTypeNarrowing);

  await printGroup("Lazy Loading", lazyLoading);

  await printGroup("Other Response data types", otherResponseDataTypes);

  await printGroup("Query Params", queryParams);
})();
