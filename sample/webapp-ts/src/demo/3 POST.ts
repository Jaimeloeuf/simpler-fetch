import { sf } from "simpler-fetch";
import { printGroup } from "../utils.js";

export async function postRequest() {
  await printGroup(
    "POST data to server with compile time type safety",

    async () => {
      /** Example type used for type checking the `bodyJSON` input */
      type BodyContentType = { some: string };

      const { res, err } = await sf
        .useDefault()
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
      const { res, err } = await sf.useDefault().POST("/test").runJSON();

      console.log(res, err);
    }
  );
}
