// These only support es6 module import
import fetch from "node-fetch";
import { oof } from "../../dist/index.js";

// This checks if fetch API is already available globally,
// and only polyfilling it if it is not available with node-fetch library.
//
// Once you upgrade to node v18.0.0 and above, fetch API will be available in node natively,
// meaning that you do not need to install any third party fetch library before using this!
if (!global.fetch) {
  console.log("Setting fetch globally\n");
  global.fetch = fetch;
}

// async IIFE to use async await without using top level await as older node versions dont support it
(async function () {
  // Set Base URL of your API once and all subsequent API calls with use this base API url.
  // Leave out the trailing '/' if you plan to use a starting '/' for every API call.
  oof.setBaseURL("http://localhost:3000");
  console.log("oof._baseUrl: ", oof.baseUrl());

  // Alternatively, if you would like to have your URL injected from a .env file, e.g. using VITE
  // oof.setBaseURL(import.meta.env.VITE_API_URL);

  // Alternatively, if you would like to use different base URLs for different build modes,
  // Base URL can be set like this if using a bundler that injects NODE_ENV in
  // oof.setBaseURL(
  //   process.env.NODE_ENV === "production"
  //     ? "https://deployed-api.com"
  //     : "http://localhost:3000"
  // );

  // Alternatively, if you would like to use different base URLs for different build modes,
  // Base URL can be set like this if using a bundler that sets the `import.meta` attributes
  // oof.setBaseURL(
  //   import.meta.env.MODE === "development"
  //     ? "http://localhost:3000"
  //     : "https://api.example.com"
  // );

  /* ================================= GET ================================= */

  // API call to registered API server
  await oof
    .GET("/test")
    .runJSON()
    .then(({ res, err }) => console.log("res 0", res, err));

  // API call to registered API server with header set in multiple ways
  await oof
    .GET("/test")
    // Fixed header object
    .header({ someAuthenticationToken: "superSecureTokenString" })
    // Synchronous function that returns a header object
    .header(() => ({ anotherAuthenticationToken: "secret" }))
    // Asynchronous function that returns a promise that resolves to a header object
    .header(async () => ({ yetAnotherHeaderValue: 123456789 }))
    .runJSON()
    .then(({ res, err }) => console.log("res 1", res, err));

  // API call to local API server with full path
  await oof
    .GET("http://localhost:3000/test")
    .once()
    .runJSON()
    .then(({ res, err }) => console.log("res 2", res, err));

  // API call to external API server with full path
  await oof
    .GET("https://jsonplaceholder.typicode.com/todos/1")
    .once()
    .runJSON()
    .then(({ res, err }) => console.log("res 3", res, err));

  /* ================================= POST ================================= */

  // POST request to registered API server
  await oof
    .POST("/test")
    .body({ some: "data" })
    .runJSON()
    .then(({ res, err }) => console.log("res 4", res, err));

  // POST request to local API server with full path
  await oof
    .POST("http://localhost:3000/test")
    .once()
    .body({ some: "data" })
    .runJSON()
    .then(({ res, err }) => console.log("res 5", res, err));

  // POST request with no data used
  // Useful when using POST request to trigger RPC endpoints without any values
  await oof
    .POST("/test")
    .runJSON()
    .then(({ res, err }) => console.log("res 6", res, err));

  /* ================================= Error Handling ================================= */

  console.log("Next API call will fail to show case error handling.");

  // API call to a definitely not available site to similiar API call failed
  await oof
    .GET("https://hopefully-this-not-registered.com/some/invalid/path")
    .once()
    .runJSON()
    .then(({ res, err }) => console.log("res failed", res, err));

  /* ================================= Lazily Loaded ================================= */

  // Import the API library lazily into your application.
  // Only do this if your entire application only needs this library for a
  // small number of API calls only such as a landing page's contact form.
  // For all other purposes, import the API library at top level first.
  const { oof: lazy_oof } = await import("../../dist/index.js");
  await lazy_oof
    .GET("https://jsonplaceholder.typicode.com/todos/1")
    .once()
    .runJSON()
    .then(({ res, err }) => console.log("res lazy", res, err));
})();
