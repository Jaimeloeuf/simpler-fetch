import { sf } from "../sf.js";
import { printGroup } from "../utils.js";

export async function exceptionHandling() {
  await printGroup(
    [
      "API call will purposely fail to showcase exception handling",
      "You can see that the network failure exception is returned rather than thrown",
      "This allows you to handle the exception sequentially rather than relying on try/catch",
    ],

    async () => {
      // API call to a definitely not available site to simulate an API call failure
      const [err, res] = await sf
        .useFullUrl(
          "https://hopefully-this-not-registered.com/some/invalid/path"
        )
        .GET()
        .runJSON();

      console.log(res, err);
    }
  );
}
