/* Demo modules */
import { basics } from "./demo/basics.js";
import { postRequest } from "./demo/postRequest.js";
import { headers } from "./demo/headers.js";
import { exceptionHandling } from "./demo/exceptionHandling.js";
import { responseValidation } from "./demo/runtimeResponseValidation.js";
import { customTimeout } from "./demo/customTimeout.js";
import { customOptions } from "./demo/customOptions.js";
import { exceptionTypeNarrowing } from "./demo/exceptionTypeNarrowing.js";
import { lazyLoading } from "./demo/lazyLoading.js";
import { otherResponseDataTypes } from "./demo/otherResponseDataTypes.js";
import { queryParams } from "./demo/queryParams.js";

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
