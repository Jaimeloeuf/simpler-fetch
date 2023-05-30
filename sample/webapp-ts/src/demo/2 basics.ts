import { sf } from "simpler-fetch";
import { baseIdentifier } from "./0 Base Identifiers.js";
import { printGroup } from "../utils.js";

export async function basics() {
  await printGroup(
    "API call with the default base Url",

    async () => {
      const { res, err } = await sf.useDefault().GET("/test").runJSON();

      console.log(res, err);
    }
  );

  await printGroup(
    "API call with a non default base Url",

    async () => {
      const { res, err } = await sf
        .useBase(baseIdentifier.v2)
        .GET("/test")
        .runJSON();

      console.log(res, err);
    }
  );

  await printGroup(
    "One off call to an external API whose base URL is not saved",

    async () => {
      const { res, err } = await sf
        .useOnce("https://jsonplaceholder.typicode.com/todos/1")
        .GET()
        .runJSON();

      console.log(res, err);
    }
  );
}
