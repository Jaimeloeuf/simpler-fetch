import { sf } from "simpler-fetch";
import { printGroup } from "../utils.js";

export async function overrideDefaultValues() {
  await printGroup(
    [
      "Demo to show that once a Fetch instance is created, default options",
      "object for that instance cannot be overwritten, making it safe from",
      "this angle of attacks.",
    ],

    async () => {
      sf.useDefaultBaseUrl().setDefaultOptions({ credentials: "omit" });

      const tmp = sf.useDefaultBaseUrl().GET("/test");

      // This is fine since this is a REPLACEMENT, replacing the old object
      sf.useDefaultBaseUrl().setDefaultOptions({ credentials: "include" });

      const [_, res] = await tmp.useDefaultOptions().runJSON();

      console.log(res?.data);
    }
  );

  await printGroup(
    [
      "Demo to show that once a Fetch instance is created, default headers",
      "array for that instance cannot be overwritten, making it safe from",
      "this angle of attacks.",
    ],

    async () => {
      sf.useDefaultBaseUrl().setDefaultHeaders({ credentials: "omit" });

      const tmp = sf.useDefaultBaseUrl().GET("/test");

      // This is fine since this is a REPLACEMENT, replacing the old object
      sf.useDefaultBaseUrl().setDefaultHeaders({ credentials: "include" });

      const [_, res] = await tmp.useDefaultHeaders().runJSON();

      console.log(res?.data);
    }
  );
}
