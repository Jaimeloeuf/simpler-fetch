import { oof } from "../../dist/index.js";

// Used for the response validation example
import { z } from "zod";
import { zodToValidator } from "../../dist/index.js";

// async IIFE to use async await without using top level await as older environments dont support it
(async function () {
  /**
   * Identifiers for the baseUrls, you can choose to use literal strings too,
   * grouping them as an object just makes it easier to import in different files to use.
   */
  const baseIdentifier = {
    v1: "v1",
    v2: "v2",
    billing: "billing",
  };

  // Set Base URLs of your API services.
  // Leave out the trailing '/' if you plan to use a starting '/' for every API call.
  //
  // Alternatively, if you would like to have your URL injected from a .env file, e.g. using VITE
  // oof.addBase("identifier", import.meta.env.VITE_API_URL);
  //
  // Alternatively, if you would like to use different base URLs for different build modes,
  // Base URL can be set like this if using a bundler that injects NODE_ENV in
  // oof.addBase(
  //   "identifier",
  //   process.env.NODE_ENV === "production"
  //     ? "https://deployed-api.com"
  //     : "http://localhost:3000"
  // );
  //
  // Alternatively, if you would like to use different base URLs for different build modes,
  // Base URL can be set like this if using a bundler that sets the `import.meta` attributes
  // oof.addBase(
  //   "identifier",
  //   import.meta.env.MODE === "development"
  //     ? "http://localhost:3000"
  //     : "https://api.example.com"
  // );
  oof
    .addBase(baseIdentifier.v1, "http://localhost:3000/v1")

    // Different base Urls can be useful for API service with different versions
    .addBase(baseIdentifier.v2, "http://localhost:3000/v2")

    // It can also be useful for interfacing with external API
    .addBase(baseIdentifier.billing, "http://api.stripe.com/billing")

    // Set v1 as the default base url
    .setDefault(baseIdentifier.v1);

  /*
    All the sample API calls will be nested in block scopes to reuse variable names
    https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/block
  */

  /* ================================= Basics ================================= */
  {
    {
      // API call with the default base Url
      const { res, err } = await oof.useDefault().GET("/test").runJSON();

      console.log("res 1", res, err);
    }

    {
      // API call with a non default base Url
      const { res, err } = await oof
        .useBase(baseIdentifier.v2)
        .GET("/test")
        .runJSON();

      console.log("res 2", res, err);
    }

    {
      // Make a one off API call to an external API service with a full URL path without using any base Urls
      const { res, err } = await oof
        .useOnce("https://jsonplaceholder.typicode.com/todos/1")
        .GET()
        .runJSON();

      console.log("res 3", res, err);
    }
  }

  /* ================================= POST ================================= */
  {
    /** Example type used for type checking the `bodyJSON` input */
    type BodyContentType = { some: string };

    {
      // POST API call with the default base Url
      const { res, err } = await oof
        .useDefault()
        .POST("/test")
        .bodyJSON<BodyContentType>({ some: "data" })
        .runJSON();

      console.log("res 4", res, err);
    }

    {
      // POST API call with no data used
      // E.g. when using POST request to trigger RPC endpoints without any values
      const { res, err } = await oof.useDefault().POST("/test").runJSON();

      console.log("res 5", res, err);
    }
  }

  /* ================================= Headers ================================= */
  {
    {
      // API call with the default base Url with headers set in multiple ways
      const { res, err } = await oof
        .useDefault()
        .GET("/test")
        // Hardcoded header object
        .header({ someAuthenticationToken: "superSecureTokenString" })
        // Synchronous function that returns a header object
        .header(() => ({ anotherAuthenticationToken: "secret" }))
        // Asynchronous function that returns a promise that resolves to a header object
        .header(async () => ({ yetAnotherHeaderValue: "123456789" }))
        .runJSON();

      console.log("res 6", res, err);
    }

    {
      // API call where header function throws an error to show it bubbling up
      // The error will be caught and returned as `err`
      const { res, err } = await oof
        .useDefault()
        .GET("/test")
        .header(async () => {
          throw new Error("Header Function failed");
        })
        .runJSON();

      console.log("res 7", res, err);
    }

    {
      // API call to demonstrate getting the Response Headers back
      // API service is configured to allow client to access all the Response Headers
      // instead of just the safe headers only.
      const { res, err } = await oof.useDefault().GET("/test").runJSON();

      if (err === undefined)
        console.log(
          "res 8",
          Array.from(res.headers.entries()).map((header) => header),
          err
        );
    }
  }

  /* ================================= Error Handling ================================= */
  {
    console.log("Next API call will purposely fail to showcase error handling");

    // API call to a definitely not available site to simulate an API call failure
    const { res, err } = await oof
      .useOnce("https://hopefully-this-not-registered.com/some/invalid/path")
      .GET()
      .runJSON();

    console.log("res 9 failed", res, err);
  }

  /* ================================= Response Validation ================================= */
  {
    console.log("Next few API calls showcases response validation");

    type ExpectedResponseType = { someCustomData: boolean };

    {
      // Create a custom type predicate to use as the validator
      const validator = (data: unknown): data is { someCustomData: boolean } =>
        (data as any)?.someCustomData === true ||
        (data as any)?.someCustomData === false;

      const { res, err } = await oof
        .useDefault()
        .GET("/response-validation/correct")
        .runJSON<ExpectedResponseType>(validator);

      console.log("res validation with validator correct", res, err);
    }

    {
      // Since the custom type predicate is not super type safe,
      // e.g. if you return true without any checks TS will assume data: unknown to be correctly typed.
      // Thus this example show cases using an external validation library like `Zod`
      // that provide stronger runtime type checking/validation garuntees.
      // To use a Zod Parser easily in a type safe manner, the `zodToValidator` utility function
      // is used to convert the Zod Parser to a validator type expected by this API library.

      const { res, err } = await oof
        .useDefault()
        .GET("/response-validation/correct")
        .runJSON<ExpectedResponseType>(
          zodToValidator(z.object({ someCustomData: z.boolean() }))
        );

      console.log("res validation with zod correct", res, err);
    }

    {
      // This purposely gets wrong data from API service, to showcase how `ZodError`
      // is bubbled up through the API library when Response validation fails.

      const { res, err } = await oof
        .useDefault()
        .GET("/response-validation/incorrect")
        .runJSON<ExpectedResponseType>(
          zodToValidator(z.object({ someCustomData: z.boolean() }))
        );

      console.log("res validation with zod incorrect", res, err);
    }
  }

  /* ================================= Custom Timeout ================================= */
  {
    {
      // API call to simulate custom timeout of 0.1 seconds
      // where this will timeout before the API responds in 0.5 seconds
      const { res, err } = await oof
        .useDefault()
        .GET("/delay")
        .timeoutAfter(100)
        .runJSON();

      console.log("res timeout fail", res, err);
    }

    {
      // API call to simulate custom timeout of 1 seconds
      // where this will not timeout since the API responds in 0.5 seconds
      const { res, err } = await oof
        .useDefault()
        .GET("/delay")
        .timeoutAfter(1000)
        .runJSON();

      console.log("res timeout pass", res, err);
    }
  }

  /* ================================= Custom Options ================================= */
  {
    //
  }

  /* ================================= Uncommon HTTP methods ================================= */
  {
    {
      // API call using a HTTP method without a built in method like GET/POST
      // using run method since no data will be returned back to parse as it is a HEAD method.
      const { res, err } = await oof.useDefault().HTTP("HEAD", "/test").run();

      console.log("res HEAD", res, err);
    }
  }

  /* ================================= Lazily Loaded ================================= */
  {
    // Import the API library lazily into your application.
    // Only do this if your entire application only needs this library for a
    // small number of API calls only such as a landing page's contact form.
    // For all other purposes, import the API library at top level first.
    const { oof } = await import("../../dist/index.js");
    const { res, err } = await oof
      .useOnce("https://jsonplaceholder.typicode.com/todos/1")
      .GET()
      .runJSON();

    console.log("res lazy", res, err);
  }
})();
