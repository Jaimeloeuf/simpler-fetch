import { oof } from "simpler-fetch";
import { baseIdentifier } from "./0 Base Identifiers.js";

/**
 * All sample API calls are nested in block scopes to reuse variable names
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/block
 */
export async function basics() {
  // API call with the default base Url
  {
    const { res, err } = await oof.useDefault().GET("/test").runJSON();

    console.log("res 1", res, err);
  }

  // API call with a non default base Url
  {
    const { res, err } = await oof
      .useBase(baseIdentifier.v2)
      .GET("/test")
      .runJSON();

    console.log("res 2", res, err);
  }

  // Make a one off API call to an external API service with a full URL path without using any base Urls
  {
    const { res, err } = await oof
      .useOnce("https://jsonplaceholder.typicode.com/todos/1")
      .GET()
      .runJSON();

    console.log("res 3", res, err);
  }
}
