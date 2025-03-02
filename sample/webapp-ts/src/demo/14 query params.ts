import { sf } from "simpler-fetch";
import { baseIdentifier } from "./0 Base Identifiers.js";
import { printGroup } from "../utils.js";

export async function queryParams() {
  await printGroup(
    "Using query params in API URL Path string directly",

    async () => {
      const [err, res] = await sf
        .useDefaultBaseUrl()
        .GET("/test?query=something")
        .runJSON();

      console.log(res, err);
    }
  );

  await printGroup(
    [
      "Setting query params with 'useQuery' method",
      "This also includes a generic type for compile time type checking.",
    ],

    async () => {
      const [err, res] = await sf
        .useDefaultBaseUrl()
        .GET("/test")
        .useQuery<{ query: string }>({ query: "something" })
        .runJSON();

      console.log(res, err);
    }
  );

  await printGroup(
    [
      "Setting query params in API URL Path string directly and with 'useQuery' method at the same time",
      "Using different query param key to show that query params set with 'useQuery' is merged at the back",
    ],

    async () => {
      const [err, res] = await sf
        .useDefaultBaseUrl()
        .GET("/test?query=something")
        .useQuery<{ secondQuery: string }>({ secondQuery: "something-else" })
        .runJSON();

      console.log(res, err);
    }
  );

  await printGroup(
    [
      "Setting query params in API URL Path string directly and with 'useQuery' method at the same time",
      "Using the same query param key to show that query params set with 'useQuery' is merged at the back",
      "Note that even if the query param key is the same, this will not deduplicate for you as this is expected behaviour.",
      "Most web servers like ExpressJS will parse it into an array of values.",
    ],

    async () => {
      const [err, res] = await sf
        .useDefaultBaseUrl()
        .GET("/test?query=something")
        .useQuery<{ query: string }>({ query: "something-else" })
        .runJSON();

      console.log(res, err);
    }
  );
}
