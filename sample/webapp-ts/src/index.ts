import { printGroup } from "./utils.js";

(async function () {
  const demoModules: Array<{
    title: string;
    module: Promise<{ default: any }>;
  }> = [
    {
      title: "Basic use",
      module: import("./demo/basics.js"),
    },
    {
      title: "Simple POST requests",
      module: import("./demo/postRequest.js"),
    },
    {
      title: "Working with Headers",
      module: import("./demo/headers.js"),
    },
    {
      title: "Error Handling",
      module: import("./demo/exceptionHandling.js"),
    },
    {
      title: "Runtime Response Validation",
      module: import("./demo/runtimeResponseValidation.js"),
    },
    {
      title: "Custom Timeout",
      module: import("./demo/customTimeout.js"),
    },
    {
      title: "Custom Options",
      module: import("./demo/customOptions.js"),
    },
    {
      title: "Error Type Narrowing",
      module: import("./demo/exceptionTypeNarrowing.js"),
    },
    {
      title: "Lazy Loading",
      module: import("./demo/lazyLoading.js"),
    },
    {
      title: "Other Response data types",
      module: import("./demo/otherResponseDataTypes.js"),
    },
    {
      title: "Query Params",
      module: import("./demo/queryParams.js"),
    },
  ];

  for (const demoModule of demoModules) {
    await printGroup(demoModule.title, (await demoModule.module).default);
  }
})();
