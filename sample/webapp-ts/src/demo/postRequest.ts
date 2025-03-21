import { sf } from "../sf.js";
import { printGroup } from "../utils.js";

export async function postRequest() {
  await printGroup(
    "POST data to server with compile time type safety",

    async () => {
      /** Example type used for type checking the `bodyJSON` input */
      type BodyContentType = { some: string };

      const [err, res] = await sf
        .useBaseUrl("v1")
        .POST("/test")
        .bodyJSON<BodyContentType>({ some: "data" })
        .runJSON();

      console.log(res, err);
    }
  );

  await printGroup(
    [
      "POST to an API without sending any data in the request body",
      "E.g. when using POST request to trigger RPC endpoints without any values",
    ],

    async () => {
      const [err, res] = await sf.useBaseUrl("v1").POST("/test").runJSON();

      console.log(res, err);
    }
  );
}
