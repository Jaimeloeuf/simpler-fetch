import { sf } from "simpler-fetch";
import { printGroup } from "../utils.js";

export async function uncommonMethods() {
  await printGroup(
    [
      "API call using 'HEAD' HTTP method where it does not use the built in method like GET/POST",
      "using 'run' since no data will be returned back to parse as it is a HEAD method.",
    ],

    async () => {
      const { res, err } = await sf.useDefault().HTTP("HEAD", "/test").run();

      console.log(res, err);
    }
  );
}
