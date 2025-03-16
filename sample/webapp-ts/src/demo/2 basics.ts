import { sf } from "simpler-fetch";
import { printGroup } from "../utils.js";

export async function basics() {
  await printGroup(
    "API call with the default base Url",

    async () => {
      const [err, res] = await sf.useDefaultBaseUrl().GET("/test").runJSON();

      console.log(res, err);
    }
  );

  await printGroup(
    "API call with a non default base Url",

    async () => {
      const [err, res] = await sf.useBaseUrl("v2").GET("/test").runJSON();

      console.log(res, err);
    }
  );

  await printGroup(
    "One off call to an external API whose base URL is not saved",

    async () => {
      const [err, res] = await sf
        .useFullUrl("https://jsonplaceholder.typicode.com/todos/1")
        .GET()
        .runJSON();

      console.log(res, err);
    }
  );
}
