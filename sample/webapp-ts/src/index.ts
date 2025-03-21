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
  const demoModules = [
    { title: "Basic use", fn: basics },
    { title: "Simple POST requests", fn: postRequest },
    { title: "Working with Headers", fn: headers },
    { title: "Error Handling", fn: exceptionHandling },
    { title: "Runtime Response Validation", fn: responseValidation },
    { title: "Custom Timeout", fn: customTimeout },
    { title: "Custom Options", fn: customOptions },
    { title: "Error Type Narrowing", fn: exceptionTypeNarrowing },
    { title: "Lazy Loading", fn: lazyLoading },
    { title: "Other Response data types", fn: otherResponseDataTypes },
    { title: "Query Params", fn: queryParams },
  ];

  for (const demoModule of demoModules) {
    await printGroup(demoModule.title, demoModule.fn);
  }
})();
