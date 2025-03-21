import { sf } from "../sf.js";

export default [
  {
    title: "POST data to server with compile time type safety",
    async fn() {
      /** Example type used for type checking the `bodyJSON` input */
      type BodyContentType = { some: string };

      const [err, res] = await sf
        .useBaseUrl("v1")
        .POST("/test")
        .bodyJSON<BodyContentType>({ some: "data" })
        .runJSON();

      console.log(res, err);
    },
  },
  {
    title: [
      "POST to an API without sending any data in the request body",
      "E.g. when using POST request to trigger RPC endpoints without any values",
    ],
    async fn() {
      const [err, res] = await sf.useBaseUrl("v1").POST("/test").runJSON();

      console.log(res, err);
    },
  },
];
