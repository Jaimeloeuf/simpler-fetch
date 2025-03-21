import { printGroup } from "./utils.js";

const demoModules: Array<{
  title: string;
  module: Promise<{
    default: Array<{
      title: string | Array<string>;
      fn: () => Promise<void>;
    }>;
  }>;
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

// Execute all the demo modules and print their results in groups
for (const demoModule of demoModules) {
  const demos = (await demoModule.module).default;
  await printGroup(demoModule.title, async function () {
    for (const demo of demos) {
      await printGroup(demo.title, demo.fn);
    }
  });
}
