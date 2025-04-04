import { sf } from "../sf.js";
import { HeaderException } from "simpler-fetch";

export default [
  {
    title:
      "API call with the default base Url with headers set in multiple ways",
    async fn() {
      const [err, res] = await sf
        .useBaseUrl("v1")
        .GET("/test")
        // Hardcoded header object
        .useHeader({ someAuthenticationToken: "superSecureTokenString" })
        // Synchronous function that returns a header object
        .useHeader(() => ({ anotherAuthenticationToken: "secret" }))
        // Asynchronous function that returns a promise that resolves to a header object
        .useHeader(async () => ({ yetAnotherHeaderValue: "123456789" }))
        .runJSON();

      console.log(res, err);
    },
  },
  {
    title: [
      "API call where header function throws an error to show it bubbling up",
      "The error will be caught and returned as `err`",
    ],
    async fn() {
      const [err, res] = await sf
        .useBaseUrl("v1")
        .GET("/test")
        .useHeader(async () => {
          throw new Error("custom Header Function failed");
        })
        .runJSON();

      console.log(res, err?.message);

      if (err instanceof HeaderException) {
        console.error(err?.error);
      }
    },
  },
  {
    title: [
      "API call to demonstrate getting the Response Headers back",
      "API service is configured to allow client to access all Response",
      "Headers instead of just the safe headers only.",
    ],
    async fn() {
      const [err, res] = await sf.useBaseUrl("v1").GET("/test").runJSON();

      if (err === null)
        console.log(
          Array.from(res.headers.entries()).map((header) => header),
          err
        );
    },
  },

  {
    title: "Show case this example of overriding the header",
    async fn() {
      const [err, res] = await sf
        .useBaseUrl("v1")
        .GET("/test")
        .useDefaultHeaders()
        .useHeader(() => ({
          "a0-default-headers": Math.random().toString(),
        }))
        .runJSON();

      console.log(res, err);
    },
  },
];
